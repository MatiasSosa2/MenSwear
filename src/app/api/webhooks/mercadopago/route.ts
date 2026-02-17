import { NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "" });

/**
 * Webhook de Mercado Pago
 * Este endpoint recibe notificaciones cuando cambia el estado de un pago
 * 
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(req: Request) {
  const debug = process.env.DEBUG_CHECKOUT === "true";
  
  try {
    const body = await req.json();
    
    if (debug) {
      console.log("[Webhook MP] Notificación recibida:", JSON.stringify(body, null, 2));
    }

    // Mercado Pago envía diferentes tipos de notificaciones
    const { type, data } = body;

    // Solo procesamos notificaciones de pagos
    if (type === "payment") {
      const paymentId = data?.id;
      
      if (!paymentId) {
        return NextResponse.json({ received: true, message: "No payment ID" });
      }

      // Obtener detalles completos del pago
      const paymentClient = new Payment(mpClient);
      const payment = await paymentClient.get({ id: paymentId });

      if (debug) {
        console.log("[Webhook MP] Pago obtenido:", {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          amount: payment.transaction_amount,
          payer_email: payment.payer?.email
        });
      }

      // Procesar según el estado del pago
      if (payment.status === "approved") {
        await handleApprovedPayment(payment);
      } else if (payment.status === "rejected") {
        await handleRejectedPayment(payment);
      } else if (payment.status === "pending") {
        await handlePendingPayment(payment);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, message: "Notification type not processed" });

  } catch (error: any) {
    console.error("[Webhook MP] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Procesar pago aprobado
 */
async function handleApprovedPayment(payment: any) {
  const debug = process.env.DEBUG_CHECKOUT === "true";
  
  console.log("[Webhook MP] ✅ Pago APROBADO:", payment.id);

  // Extraer metadata (datos de envío, cliente, etc.)
  const metadata = payment.metadata || {};
  const orderData = {
    payment_id: payment.id,
    status: payment.status,
    amount: payment.transaction_amount,
    payer_email: payment.payer?.email,
    payer_name: metadata.buyer_name || payment.payer?.first_name,
    shipping: {
      address: metadata.shipping_address,
      city: metadata.shipping_city,
      province: metadata.shipping_province,
      zip: metadata.shipping_zip,
      cost: metadata.shipping_cost,
      service: metadata.shipping_service,
      days: metadata.shipping_days,
      notes: metadata.shipping_notes
    },
    items: payment.additional_info?.items || []
  };

  if (debug) {
    console.log("[Webhook MP] Datos de la orden:", JSON.stringify(orderData, null, 2));
  }

  // 1. Enviar email al dueño del negocio
  await sendOwnerNotification(orderData);

  // 2. Enviar email de confirmación al cliente
  await sendCustomerConfirmation(orderData);

  // 3. Crear orden de envío en Andreani (si corresponde)
  if (orderData.shipping.cost > 0) {
    await createAndreaniShipment(orderData);
  }

  // 4. Guardar en base de datos (si tienes una)
  // await saveOrderToDatabase(orderData);
}

/**
 * Procesar pago rechazado
 */
async function handleRejectedPayment(payment: any) {
  console.log("[Webhook MP] ❌ Pago RECHAZADO:", payment.id);
  
  // Opcional: Notificar al cliente que su pago fue rechazado
  // await sendRejectionEmail(payment.payer?.email, payment.status_detail);
}

/**
 * Procesar pago pendiente
 */
async function handlePendingPayment(payment: any) {
  console.log("[Webhook MP] ⏳ Pago PENDIENTE:", payment.id);
  
  // Opcional: Notificar al cliente que su pago está en proceso
  // await sendPendingEmail(payment.payer?.email);
}

/**
 * Enviar email al dueño del negocio
 */
async function sendOwnerNotification(orderData: any) {
  const ownerEmail = process.env.OWNER_EMAIL || "tu-email@ejemplo.com";
  
  // Loguear en consola siempre (útil para desarrollo)
  console.log(`
╔═══════════════════════════════════════════════╗
║       🎉 NUEVA VENTA CONFIRMADA 🎉           ║
╚═══════════════════════════════════════════════╝

💰 Pago ID: ${orderData.payment_id}
💵 Monto: $${orderData.amount}
📧 Cliente: ${orderData.payer_email}
👤 Nombre: ${orderData.payer_name}

📦 ENVÍO:
   Dirección: ${orderData.shipping.address}
   Ciudad: ${orderData.shipping.city}
   Provincia: ${orderData.shipping.province}
   CP: ${orderData.shipping.zip}
   Costo: $${orderData.shipping.cost}
   Servicio: ${orderData.shipping.service}
   Plazo: ${orderData.shipping.days}
   Notas: ${orderData.shipping.notes || 'N/A'}

🛍️ PRODUCTOS:
${orderData.items.map((item: any) => `   - ${item.title} x${item.quantity} = $${item.unit_price * item.quantity}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  // Enviar email si está configurado Resend
  if (process.env.RESEND_API_KEY) {
    console.log(`[Email] 📧 Enviando notificación al dueño: ${ownerEmail}`);
    
    const { sendEmail, generateOwnerEmailHTML } = await import("@/lib/email");
    
    const result = await sendEmail({
      to: ownerEmail,
      subject: `🎉 Nueva venta: $${orderData.amount?.toLocaleString('es-AR')} - ${orderData.payer_name}`,
      html: generateOwnerEmailHTML(orderData)
    });

    if (!result.success) {
      console.error("[Email] Error enviando al dueño:", result.message);
    }
  } else {
    console.log("[Email] ⚠️ RESEND_API_KEY no configurado - Solo logueo en consola");
  }
}

/**
 * Enviar email de confirmación al cliente
 */
async function sendCustomerConfirmation(orderData: any) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] ⚠️ Email al cliente no enviado (RESEND_API_KEY no configurado)`);
    return;
  }

  console.log(`[Email] 📧 Enviando confirmación al cliente: ${orderData.payer_email}`);
  
  const { sendEmail, generateCustomerEmailHTML } = await import("@/lib/email");
  
  const result = await sendEmail({
    to: orderData.payer_email,
    subject: `✅ Confirmación de compra - Pedido #${orderData.payment_id}`,
    html: generateCustomerEmailHTML(orderData)
  });

  if (!result.success) {
    console.error("[Email] Error enviando al cliente:", result.message);
  }
}

/**
 * Crear orden de envío en Andreani
 */
async function createAndreaniShipment(orderData: any) {
  console.log("[Andreani] 📦 Creando orden de envío...");
  
  // TODO: Llamar a la API de Andreani para crear el envío
  // Esto requiere tener credenciales de Andreani configuradas
  
  /*
  const andreaniResponse = await fetch('https://apis.andreani.com/v2/envios', {
    method: 'POST',
    headers: {
      'x-authorization-token': process.env.ANDREANI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contrato: process.env.ANDREANI_CONTRACT_NUMBER,
      origen: {
        postal: {
          codigoPostal: "7600", // La Plata
          calle: "Tu dirección",
          numero: "123"
        }
      },
      destino: {
        postal: {
          codigoPostal: orderData.shipping.zip,
          calle: orderData.shipping.address,
          localidad: orderData.shipping.city,
          provincia: orderData.shipping.province,
          pais: "Argentina"
        }
      },
      remitente: {
        nombreCompleto: "Tu Negocio",
        email: process.env.OWNER_EMAIL,
        documentoTipo: "CUIT",
        documentoNumero: "TU_CUIT"
      },
      destinatario: [
        {
          nombreCompleto: orderData.payer_name,
          email: orderData.payer_email,
          documentoTipo: "DNI",
          documentoNumero: "00000000"
        }
      ],
      paquetes: [
        {
          valorDeclaradoConImpuestos: orderData.amount,
          volumen: 1, // kg
          peso: 1 // kg
        }
      ]
    })
  });
  
  const andreaniData = await andreaniResponse.json();
  console.log("[Andreani] Envío creado:", andreaniData.numeroDeEnvio);
  */
  
  console.log("[Andreani] (MOCK) Orden de envío creada para:", orderData.shipping.address);
}
