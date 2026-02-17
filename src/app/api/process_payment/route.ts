import { NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";

// Coloca tu Access Token de Mercado Pago en .env.local como MP_ACCESS_TOKEN
// MP_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXX
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "" });

function statusDetailMessage(detail?: string): string {
  const map: Record<string, string> = {
    cc_rejected_insufficient_amount: "Fondos insuficientes",
    cc_rejected_bad_filled_card_number: "Número de tarjeta incorrecto",
    cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta",
    cc_rejected_bad_filled_other: "Datos incompletos o inválidos",
    cc_rejected_blacklist: "Tarjeta bloqueada",
    cc_rejected_call_for_authorize: "Contacta al emisor para autorizar",
    cc_rejected_card_disabled: "Tarjeta inactiva",
    cc_rejected_duplicated_payment: "Pago duplicado",
    cc_rejected_high_risk: "Pago rechazado por riesgo",
    cc_rejected_invalid_installments: "Cuotas inválidas",
    cc_rejected_invalid_expiration_date: "Vencimiento inválido",
    cc_rejected_max_attempts: "Intentos máximos alcanzados",
    cc_rejected_other_reason: "Pago rechazado por el emisor",
    cc_rejected_fraud: "Transacción sospechosa de fraude",
    expired_card: "Tarjeta vencida",
  };
  return map[detail || ""] || "Verifica los datos o prueba otro medio de pago";
}

export async function POST(req: Request) {
  try {
    const debug = process.env.DEBUG_CHECKOUT === "true";
    const traceId = req.headers.get("x-trace-id") || "";
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Falta MP_ACCESS_TOKEN en variables de entorno" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const formData = body?.formData || body || {};
    if (debug) {
      const incomingKeys = Object.keys(formData || {});
      console.log("[API] /process_payment incoming", { traceId, incomingKeys });
    }

    const paymentPayload: any = {
      transaction_amount: Number(formData.transaction_amount),
      token: formData.token, // Para tarjetas
      installments: formData.installments ? Number(formData.installments) : undefined,
      payment_method_id: formData.payment_method_id,
      issuer_id: formData.issuer_id ? String(formData.issuer_id) : undefined,
      payer: {
        email: formData.payer?.email || formData.email,
        identification: formData.payer?.identification || formData.identification, // opcional
      },
      description: formData.description || "Compra en E-commerce",
    };

    // Eliminar campos undefined para evitar errores del SDK
    Object.keys(paymentPayload).forEach((k) => {
      if (paymentPayload[k] === undefined || paymentPayload[k] === null) {
        delete paymentPayload[k];
      }
    });
    if (debug) {
      const payloadForLog: any = {
        ...paymentPayload,
        token: paymentPayload.token ? "***masked***" : undefined,
        payer: {
          email: paymentPayload.payer?.email,
          identification: paymentPayload.payer?.identification ? "***masked***" : undefined,
        },
      };
      console.log("[API] Payload sanitized", { traceId, payload: payloadForLog });
    }

    // Procesa el pago (tarjeta, ticket/cash, transferencia) según formData
    const paymentClient = new Payment(mpClient);
    const payment = await paymentClient.create({ body: paymentPayload });

    const status = (payment as any).status as string; // approved | rejected | pending | in_process
    const status_detail = (payment as any).status_detail as string | undefined;

    const statusMessageMap: Record<string, string> = {
      approved: "Pago aprobado",
      rejected: "Pago rechazado",
      pending: "Pago pendiente",
      in_process: "Pago en proceso",
    };

    const message = `${statusMessageMap[status] || "Estado"}: ${
      status_detail ? statusDetailMessage(status_detail) : ""
    }`.trim();
    if (debug) {
      console.log("[API] Payment response", {
        traceId,
        id: (payment as any).id,
        status,
        status_detail,
      });
    }

    return NextResponse.json(
      {
        id: (payment as any).id,
        status,
        status_detail,
        message,
        // Datos de interés para tickets (Rapipago/Pago Fácil) o transferencia
        // El frontend puede usar estos datos para mostrar el comprobante/barcode
        additional_info: (payment as any).point_of_interaction || (payment as any).transaction_details || null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = error?.cause?.[0] || {};
    console.error("[API] Payment error", { traceId: req.headers.get("x-trace-id") || "", error: apiError || error });
    return NextResponse.json(
      {
        error: "Error procesando el pago",
        message: apiError?.description || error?.message || "Revisa los datos del pago",
      },
      { status: 400 }
    );
  }
}
