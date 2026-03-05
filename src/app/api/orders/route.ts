import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Schema de validación ─────────────────────────────────────────────────────
const orderItemSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(300),
  size: z.string().max(10).optional(),
  color: z.string().max(50).optional(),
  colorHex: z.string().max(10).optional(),
  qty: z.number().int().min(1).max(100),
  price: z.number().positive(),
});

const createOrderSchema = z.object({
  externalRef: z.string().max(100),
  customerName: z.string().min(1).max(100).trim(),
  customerLastName: z.string().min(1).max(100).trim(),
  customerDni: z
    .string()
    .regex(/^\d{7,8}$/, "DNI inválido")
    .trim(),
  customerEmail: z.string().email().max(200).trim(),
  customerPhone: z.string().min(7).max(30).trim(),
  address: z.string().min(3).max(300).trim(),
  city: z.string().min(2).max(100).trim(),
  province: z.string().min(2).max(100).trim(),
  zip: z.string().min(3).max(10).trim(),
  notes: z.string().max(500).optional(),
  subtotal: z.number().positive(),
  shippingCost: z.number().min(0),
  total: z.number().positive(),
  shippingService: z.string().max(100).optional(),
  items: z.array(orderItemSchema).min(1).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verificar que no exista ya el externalRef (idempotencia)
    const existing = await prisma.order.findUnique({
      where: { externalRef: data.externalRef },
    });
    if (existing) {
      return NextResponse.json({ success: true, orderId: existing.id });
    }

    // Crear la orden con sus items en una transacción
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          externalRef: data.externalRef,
          customerName: data.customerName,
          customerLastName: data.customerLastName,
          customerDni: data.customerDni,
          customerEmail: data.customerEmail.toLowerCase(),
          customerPhone: data.customerPhone,
          address: data.address,
          city: data.city,
          province: data.province,
          zip: data.zip,
          notes: data.notes ?? null,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          total: data.total,
          shippingService: data.shippingService ?? null,
          status: "PENDING",
          items: {
            create: data.items.map((item) => ({
              productSlug: item.id,
              productTitle: item.title,
              size: item.size ?? null,
              color: item.color ?? null,
              colorHex: item.colorHex ?? null,
              quantity: item.qty,
              unitPrice: item.price,
              totalPrice: item.price * item.qty,
            })),
          },
        },
      });
      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("[API/orders] Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Error interno al crear el pedido" },
      { status: 500 }
    );
  }
}
