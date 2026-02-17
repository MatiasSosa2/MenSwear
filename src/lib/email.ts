/**
 * Utilidad para enviar emails usando Resend
 * Configuración en: NOTIFICATIONS_SETUP.md
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Enviar email usando Resend
 */
export async function sendEmail({ to, subject, html }: EmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY no configurado - Email no enviado");
    return { success: false, message: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ventas@tudominio.com", // Cambiar por tu dominio verificado
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error enviando email:", error);
      return { success: false, message: error };
    }

    const data = await response.json();
    console.log("✅ Email enviado:", data.id);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error en sendEmail:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Generar HTML para email de notificación al dueño
 */
export function generateOwnerEmailHTML(orderData: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0A1F44; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #0A1F44; }
    .section-title { font-weight: bold; color: #0A1F44; margin-bottom: 10px; }
    .item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 18px; font-weight: bold; color: #0A1F44; text-align: right; margin-top: 15px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Nueva Venta Confirmada</h1>
    </div>
    <div class="content">
      
      <div class="section">
        <div class="section-title">💰 Información del Pago</div>
        <div class="item"><strong>ID de Pago:</strong> ${orderData.payment_id}</div>
        <div class="item"><strong>Estado:</strong> ${orderData.status === 'approved' ? '✅ APROBADO' : orderData.status}</div>
        <div class="total">Total: $${orderData.amount?.toLocaleString('es-AR')}</div>
      </div>

      <div class="section">
        <div class="section-title">👤 Cliente</div>
        <div class="item"><strong>Nombre:</strong> ${orderData.payer_name || 'N/A'}</div>
        <div class="item"><strong>Email:</strong> ${orderData.payer_email}</div>
        <div class="item"><strong>Teléfono:</strong> ${orderData.shipping?.phone || 'N/A'}</div>
      </div>

      <div class="section">
        <div class="section-title">📦 Dirección de Envío</div>
        <div class="item">${orderData.shipping.address}</div>
        <div class="item">${orderData.shipping.city}, ${orderData.shipping.province}</div>
        <div class="item"><strong>CP:</strong> ${orderData.shipping.zip}</div>
        <div class="item"><strong>Costo de envío:</strong> $${orderData.shipping.cost?.toLocaleString('es-AR')}</div>
        <div class="item"><strong>Servicio:</strong> ${orderData.shipping.service}</div>
        <div class="item"><strong>Tiempo estimado:</strong> ${orderData.shipping.days}</div>
        ${orderData.shipping.notes ? `<div class="item"><strong>Notas:</strong> ${orderData.shipping.notes}</div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">🛍️ Productos</div>
        ${orderData.items.map((item: any) => `
          <div class="item">
            ${item.title} × ${item.quantity} = $${(item.unit_price * item.quantity)?.toLocaleString('es-AR')}
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>Este es un email automático del sistema de notificaciones.</p>
        <p>Prepará el pedido y coordiná el envío con el cliente.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generar HTML para email de confirmación al cliente
 */
export function generateCustomerEmailHTML(orderData: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0A1F44; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .total { font-size: 18px; font-weight: bold; color: #0A1F44; text-align: right; margin-top: 15px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ ¡Gracias por tu compra!</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${orderData.payer_name}</strong>,</p>
      <p>Recibimos tu pago correctamente. Tu pedido está siendo preparado.</p>

      <div class="section">
        <h3>Detalles de tu pedido</h3>
        ${orderData.items.map((item: any) => `
          <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
            ${item.title} × ${item.quantity}
          </div>
        `).join('')}
        <div class="total">Total pagado: $${orderData.amount?.toLocaleString('es-AR')}</div>
      </div>

      <div class="section">
        <h3>📦 Información de envío</h3>
        <p><strong>Dirección:</strong> ${orderData.shipping.address}</p>
        <p><strong>Ciudad:</strong> ${orderData.shipping.city}, ${orderData.shipping.province}</p>
        <p><strong>Tiempo estimado:</strong> ${orderData.shipping.days}</p>
      </div>

      <div class="footer">
        <p>Te avisaremos cuando tu pedido sea despachado.</p>
        <p>Si tenés dudas, respondé a este email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
