import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createHmac, timingSafeEqual } from "crypto";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// Mapa de estados de MercadoPago -> estados de la app
const statusMap: Record<string, "APPROVED" | "REJECTED" | "PENDING"> = {
  approved: "APPROVED",
  rejected: "REJECTED",
  refunded: "REJECTED",
  cancelled: "REJECTED",
  pending: "PENDING",
  in_process: "PENDING",
  authorized: "PENDING",
};

// ---------------------------------------------------------------------------
// Verifica la firma HMAC-SHA256 que MercadoPago envía en el header x-signature
// Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
// Si MP_WEBHOOK_SECRET no está configurado se omite la verificación (dev).
// ---------------------------------------------------------------------------
function verifyMPSignature(
  req: NextRequest,
  dataId: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    // En producción se recomienda siempre configurar MP_WEBHOOK_SECRET
    return true;
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  if (!xSignature || !xRequestId) return false;

  // El header tiene el formato: ts=<epoch>,v1=<hmac_hex>
  let ts: string | null = null;
  let v1: string | null = null;
  for (const part of xSignature.split(",")) {
    const [key, value] = part.split("=");
    if (key === "ts") ts = value;
    if (key === "v1") v1 = value;
  }

  if (!ts || !v1) return false;

  // Cadena firmada por MP: id:<dataId>;request-id:<xRequestId>;ts:<ts>;
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  // Comparación en tiempo constante para evitar timing attacks
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Solo procesar notificaciones de pagos
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentId = String(body.data.id);

    // Verificar firma del webhook para asegurarse de que viene de MercadoPago
    if (!verifyMPSignature(req, paymentId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Obtener detalles del pago desde MercadoPago
    const paymentClient = new Payment(mp);
    const payment = await paymentClient.get({ id: paymentId });

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ received: true });
    }

    const newStatus = statusMap[payment.status || ""] ?? "PENDING";

    // Actualizar el estado de la orden
    await prisma.order.updateMany({
      where: { externalRef: payment.external_reference },
      data: {
        status: newStatus,
        mercadoPagoId: paymentId,
      },
    });

    // Si el pago fue aprobado, descontar stock por talle
    if (newStatus === "APPROVED") {
      const order = await prisma.order.findUnique({
        where: { externalRef: payment.external_reference },
        include: { items: true },
      });

      if (order) {
        for (const item of order.items) {
          const existing = await prisma.productStock.findUnique({
            where: { slug: item.productSlug },
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sizeStocks = ((existing as any)?.sizeStocks as Record<string, number>) ?? {};
          const sizeKey = item.size ?? "default";
          const current = sizeStocks[sizeKey] ?? 0;
          sizeStocks[sizeKey] = Math.max(0, current - item.quantity);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (prisma.productStock as any).upsert({
            where: { slug: item.productSlug },
            update: { sizeStocks },
            create: { slug: item.productSlug, sizeStocks },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook/mp] Error:", error);
    // Devolvemos 200 para que MP no reintente indefinidamente
    return NextResponse.json({ received: true });
  }
}
