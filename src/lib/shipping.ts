// Librería para gestión de envíos con Andreani

export type ShippingQuoteParams = {
  destination: {
    postalCode: string;
    province: string;
  };
  weight?: number; // kg (opcional, se calcula automático)
  declared_value?: number; // Valor declarado
};

export type ShippingQuote = {
  carrier: 'andreani';
  service: string;
  cost: number;
  deliveryDays: string;
  success: boolean;
  error?: string;
};

/**
 * Calcula el costo de envío usando la API de Andreani
 */
export async function getShippingQuote(params: ShippingQuoteParams): Promise<ShippingQuote> {
  try {
    const response = await fetch('/api/shipping/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Error al obtener cotización de envío');
    }

    return await response.json();
  } catch (error: any) {
    return {
      carrier: 'andreani',
      service: 'error',
      cost: 0,
      deliveryDays: '-',
      success: false,
      error: error.message || 'Error de conexión',
    };
  }
}

/**
 * Mapeo de provincias argentinas a sus códigos
 */
export const PROVINCIAS: Record<string, string> = {
  'Buenos Aires': 'B',
  'CABA': 'C',
  'Capital Federal': 'C',
  'Catamarca': 'K',
  'Chaco': 'H',
  'Chubut': 'U',
  'Córdoba': 'X',
  'Corrientes': 'W',
  'Entre Ríos': 'E',
  'Formosa': 'P',
  'Jujuy': 'Y',
  'La Pampa': 'L',
  'La Rioja': 'F',
  'Mendoza': 'M',
  'Misiones': 'N',
  'Neuquén': 'Q',
  'Río Negro': 'R',
  'Salta': 'A',
  'San Juan': 'J',
  'San Luis': 'D',
  'Santa Cruz': 'Z',
  'Santa Fe': 'S',
  'Santiago del Estero': 'G',
  'Tierra del Fuego': 'V',
  'Tucumán': 'T',
};
