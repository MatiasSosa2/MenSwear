import { NextResponse } from "next/server";

// Andreani tiene entorno de SANDBOX para pruebas
// URL Sandbox: https://apis-sandbox.andreani.com
// URL Producción: https://apis.andreani.com

const ANDREANI_API_KEY = process.env.ANDREANI_API_KEY || "";
const ANDREANI_ENV = process.env.ANDREANI_ENV || "sandbox"; // sandbox | production
const USE_MOCK = process.env.ANDREANI_USE_MOCK === "true"; // Simula sin llamar API

// Configuración de origen (tu depósito/tienda)
const ORIGIN_POSTAL_CODE = "1000"; // CABA - Cambiar según tu ubicación

/**
 * Simula una cotización de Andreani (para desarrollo sin credenciales)
 */
function mockShippingQuote(postalCode: string, declaredValue: number) {
  // Simulación básica de costos según zona
  const firstDigit = postalCode.charAt(0);
  
  let baseCost = 3500;
  let deliveryDays = "3-5";
  
  // CABA y GBA
  if (firstDigit === "1" || firstDigit === "B") {
    baseCost = 2500;
    deliveryDays = "2-3";
  }
  // Zona Centro (Córdoba, Santa Fe, Entre Ríos)
  else if (["2", "3", "5"].includes(firstDigit)) {
    baseCost = 4500;
    deliveryDays = "4-6";
  }
  // Patagonia
  else if (["8", "9"].includes(firstDigit)) {
    baseCost = 7500;
    deliveryDays = "7-10";
  }
  
  // Agregar un % basado en valor declarado
  const insuranceCost = declaredValue > 50000 ? 500 : 0;
  
  return {
    carrier: "andreani",
    service: "Estándar a Domicilio",
    cost: baseCost + insuranceCost,
    deliveryDays,
    success: true,
  };
}

/**
 * Llama a la API real de Andreani (sandbox o producción)
 */
async function getAndreaniQuote(postalCode: string, declaredValue: number) {
  const baseUrl = ANDREANI_ENV === "production" 
    ? "https://apis.andreani.com"
    : "https://apis-sandbox.andreani.com";
  
  try {
    // Endpoint de cotización de Andreani
    const response = await fetch(`${baseUrl}/v2/tarifas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-authorization-token": ANDREANI_API_KEY,
      },
      body: JSON.stringify({
        cpDestino: postalCode,
        cpOrigen: ORIGIN_POSTAL_CODE,
        contrato: "400006711", // Número de contrato (lo obtienes al registrarte)
        bultos: [
          {
            valorDeclarado: declaredValue,
            kilos: 1, // Peso estimado por producto
            volumen: 0.01, // m³ (10x10x10 cm)
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Andreani API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Andreani devuelve un array de tarifas, tomamos la estándar
    const tariff = data.tarifaConIva?.tarifaConIvaSinAdicionales || data.tarifaConIva;
    
    return {
      carrier: "andreani",
      service: "Estándar a Domicilio",
      cost: Math.round(tariff.total || 0),
      deliveryDays: "3-5", // Andreani no siempre devuelve plazo exacto
      success: true,
    };
  } catch (error: any) {
    console.error("[Andreani API] Error:", error.message);
    return {
      carrier: "andreani",
      service: "error",
      cost: 0,
      deliveryDays: "-",
      success: false,
      error: error.message,
    };
  }
}

export async function POST(req: Request) {
  try {
    const { destination, declared_value = 10000 } = await req.json();
    const postalCode = destination?.postalCode || "";

    // Validar código postal
    if (!postalCode || postalCode.length < 4) {
      return NextResponse.json({
        carrier: "andreani",
        success: false,
        error: "Código postal inválido",
        cost: 0,
        deliveryDays: "-",
      }, { status: 400 });
    }

    // Usar mock si está configurado (no requiere API key)
    if (USE_MOCK) {
      const quote = mockShippingQuote(postalCode, declared_value);
      return NextResponse.json(quote);
    }

    // Verificar que exista API key
    if (!ANDREANI_API_KEY) {
      // Si no hay API key, usar mock automáticamente
      console.warn("[Andreani] No API key found, using mock data");
      const quote = mockShippingQuote(postalCode, declared_value);
      return NextResponse.json(quote);
    }

    // Llamar a la API real de Andreani
    const quote = await getAndreaniQuote(postalCode, declared_value);
    return NextResponse.json(quote);

  } catch (error: any) {
    console.error("[Shipping API] Error:", error);
    return NextResponse.json({
      carrier: "andreani",
      success: false,
      error: "Error al calcular envío",
      cost: 0,
      deliveryDays: "-",
    }, { status: 500 });
  }
}
