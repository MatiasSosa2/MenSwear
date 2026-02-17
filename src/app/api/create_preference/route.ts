import { NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "" });

export async function POST(req: Request) {
  const debug = process.env.DEBUG_CHECKOUT === "true";
  const traceId = req.headers.get("x-trace-id") || "";
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Falta MP_ACCESS_TOKEN" }, { status: 500 });
    }

    const body = await req.json();
    const amount = Number(body?.amount || 0);
    const email = String(body?.email || "");
    const origin = req.headers.get("origin") || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
    const isLocal = /localhost|127\.0\.0\.1/i.test(siteUrl || "");
    const hasValidSiteUrl = /^https?:\/\//i.test(siteUrl || "") && !isLocal;

    if (amount <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const preferenceClient = new Preference(mpClient);
    const baseBody: any = {
      items: [
        {
          id: "order-" + Date.now(),
          title: "Compra en E-commerce",
          quantity: 1,
          unit_price: amount,
          currency_id: "ARS",
        },
      ],
      payer: {
        email: email || undefined,
      },
    };

    if (hasValidSiteUrl) {
      baseBody.back_urls = {
        success: `${siteUrl.replace(/\/$/, "")}/checkout?success=1`,
        failure: `${siteUrl.replace(/\/$/, "")}/checkout?failure=1`,
        pending: `${siteUrl.replace(/\/$/, "")}/checkout?pending=1`,
      };
      baseBody.auto_return = "approved";
    } else if (debug) {
      console.warn("[API] create_preference: omitiendo back_urls/auto_return por sitio local", { traceId, siteUrl, origin });
    }

    const pref = await preferenceClient.create({ body: baseBody });

    const initPoint = (pref as any)?.init_point || (pref as any)?.sandbox_init_point || "";
    if (debug) console.log("[API] create_preference", { traceId, id: (pref as any)?.id, initPoint: initPoint?.slice(0, 60) + "..." });

    return NextResponse.json({ id: (pref as any)?.id, init_point: initPoint }, { status: 200 });
  } catch (error: any) {
    const causeMsg = error?.cause?.[0]?.description || error?.message || "";
    if (debug) console.error("[API] create_preference error", { traceId, error: causeMsg });
    return NextResponse.json({ error: "Error creando preferencia", message: causeMsg }, { status: 400 });
  }
}
