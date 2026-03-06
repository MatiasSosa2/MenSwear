import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validación estricta de la petición de cotización de envío
const shippingSchema = z.object({
  destination: z.object({
    postalCode: z
      .string()
      .min(4, "Código postal muy corto")
      .max(8, "Código postal muy largo")
      .regex(/^\d+$/, "El código postal solo puede contener números"),
  }),
});

export async function POST(req: Request) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Body JSON inválido' },
        { status: 400 }
      );
    }

    const parsed = shippingSchema.safeParse(rawBody);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    const postalCode = parseInt(parsed.data.destination.postalCode, 10);

    let cost = 3500;
    let days = '3-5';
    let service = 'Estándar';

    // Lógica Mock de Andreani
    if (postalCode >= 1000 && postalCode < 2000) {
      // CABA y GBA
      cost = 2500;
      days = '2-3';
      service = 'AMBA Estándar';
    } else if ((postalCode >= 2000 && postalCode < 4000) || (postalCode >= 5000 && postalCode < 6000)) {
      // Santa Fe, Entre Ríos, Corrientes, Córdoba
      cost = 4500;
      days = '4-6';
      service = 'Larga Distancia';
    } else if (postalCode >= 8000) {
      // Patagonia (aprox)
      cost = 7500;
      days = '7-10';
      service = 'Patagonia';
    } else {
      // Resto del país
      cost = 3500;
      days = '3-5';
      service = 'Regional';
    }

    return NextResponse.json({
      carrier: 'andreani',
      service: service,
      cost: cost,
      deliveryDays: days,
      success: true
    });

  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno al calcular envío' },
      { status: 500 }
    );
  }
}
