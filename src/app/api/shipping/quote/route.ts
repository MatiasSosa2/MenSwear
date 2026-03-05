import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { destination } = await req.json();
    const postalCode = parseInt(destination.postalCode);

    if (isNaN(postalCode)) {
      return NextResponse.json({
        success: false,
        error: 'Código postal inválido'
      }, { status: 400 });
    }

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

    // Respuesta simulada exitosa
    return NextResponse.json({
      carrier: 'andreani',
      service: service,
      cost: cost,
      deliveryDays: days,
      success: true
    });

  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno al calcular envío'
    }, { status: 500 });
  }
}
