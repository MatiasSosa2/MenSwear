import { NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "" });

export async function POST(req: Request) {
  const debug = process.env.DEBUG_CHECKOUT === "true";
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: "Falta MP_ACCESS_TOKEN en variables de entorno"
      }, { status: 500 });
    }

    const body = await req.json();

    if (debug) {
      console.log("[API] create_preference - Items:", body.items?.length);
      console.log("[API] create_preference - Payer:", body.payer?.email);
    }

    // Validar que hay items
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No hay productos en la compra"
      }, { status: 400 });
    }

    const preferenceClient = new Preference(mpClient);
    
    // Construir el body de la preferencia
    const preferenceBody: any = {
      items: body.items,
      payer: body.payer,
      back_urls: body.back_urls,
      auto_return: body.auto_return || "approved",
      statement_descriptor: body.statement_descriptor || "E-COMMERCE",
      external_reference: body.external_reference || `ORDER-${Date.now()}`,
    };

    // Solo agregar notification_url si no estamos en localhost
    const origin = req.headers.get("origin") || "";
    const isLocal = /localhost|127\.0\.0\.1/i.test(origin);
    
    if (!isLocal && body.notification_url) {
      preferenceBody.notification_url = body.notification_url;
    }

    if (debug) {
      console.log("[API] create_preference - Creando preferencia...");
    }

    const pref = await preferenceClient.create({ body: preferenceBody });

    const initPoint = (pref as any)?.init_point || (pref as any)?.sandbox_init_point || "";
    
    if (debug) {
      console.log("[API] create_preference - Success");
      console.log("[API] Preference ID:", (pref as any)?.id);
      console.log("[API] Init point:", initPoint?.substring(0, 50) + "...");
    }

    return NextResponse.json({
      success: true,
      id: (pref as any)?.id,
      init_point: initPoint
    }, { status: 200 });

  } catch (error: any) {
    const causeMsg = error?.cause?.[0]?.description || error?.message || "Error desconocido";
    
    if (debug) {
      console.error("[API] create_preference error:", causeMsg);
      console.error("[API] Full error:", error);
    }

    return NextResponse.json({
      success: false,
      message: `Error al crear preferencia de pago: ${causeMsg}`
    }, { status: 500 });
  }
}
