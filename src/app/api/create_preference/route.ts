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
    
    // Obtener el origin para las URLs de retorno
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const isLocal = /localhost|127\.0\.0\.1/i.test(origin);
    
    // Preparar back_urls
    const backUrls = {
      success: `${origin}/checkout/success`,
      failure: `${origin}/checkout/failure`,
      pending: `${origin}/checkout/pending`
    };
    
    if (debug) {
      console.log("[API] Origin:", origin);
      console.log("[API] Back URLs:", backUrls);
    }
    
    // Construir el body de la preferencia
    const preferenceBody: any = {
      items: body.items,
      payer: body.payer,
      back_urls: backUrls,
      statement_descriptor: body.statement_descriptor || "E-COMMERCE",
      external_reference: body.external_reference || `ORDER-${Date.now()}`,
    };
    
    // Solo agregar auto_return si no es local (Mercado Pago puede rechazarlo con localhost)
    if (!isLocal) {
      preferenceBody.auto_return = "approved";
    }
    
    if (!isLocal && body.notification_url) {
      preferenceBody.notification_url = body.notification_url;
    }

    if (debug) {
      console.log("[API] create_preference - Creando preferencia...");
      console.log("[API] Preference body:", JSON.stringify(preferenceBody, null, 2));
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
