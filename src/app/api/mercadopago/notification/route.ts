import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Solo procesar notificaciones de pagos
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    const paymentId = String(body.data.id);

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

    // Si el pago fue aprobado, descontar stock
    if (newStatus === "APPROVED") {
      const order = await prisma.order.findUnique({
        where: { externalRef: payment.external_reference },
        include: { items: true },
      });

      if (order) {
        for (const item of order.items) {
          await prisma.productStock.upsert({
            where: { slug: item.productSlug },
            update: { stock: { decrement: item.quantity } },
            create: { slug: item.productSlug, stock: 0 },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook/mp] Error:", error);
    // Devolvemos 200 para que MP no reintente
    return NextResponse.json({ received: true });
  }
}
