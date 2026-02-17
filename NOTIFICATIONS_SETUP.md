# 🔔 Sistema de Notificaciones - Mercado Pago

## ✅ Ya implementado

1. **Webhook endpoint**: `/api/webhooks/mercadopago`
   - Recibe notificaciones automáticas de Mercado Pago cuando cambia el estado de un pago
   - Procesa pagos aprobados, rechazados y pendientes
   - Extrae toda la información del pedido (productos, envío, cliente)

2. **Logging detallado**: El sistema por ahora muestra en consola todos los datos de cada venta

## 🚀 Próximos pasos

### 1. Configurar Webhook en Mercado Pago

**Opción A: Para producción (dominio público)**
1. Ir a: https://www.mercadopago.com.ar/developers/panel/app
2. Seleccionar tu aplicación
3. Ir a "Webhooks" en el menú lateral
4. Agregar URL de notificación:
   ```
   https://tudominio.com/api/webhooks/mercadopago
   ```
5. Seleccionar eventos a escuchar: **"Pagos"**
6. Guardar

**Opción B: Para desarrollo local (con ngrok)**
```powershell
# Instalar ngrok
winget install ngrok

# Exponer tu servidor local
ngrok http 3000

# Copiar la URL HTTPS que te da (ej: https://abc123.ngrok.io)
# Configurar en Mercado Pago:
# https://abc123.ngrok.io/api/webhooks/mercadopago
```

**Opción C: Para testing (webhook local)**
- Mercado Pago NO puede enviar webhooks a localhost
- Debes usar ngrok o publicar el sitio

### 2. Configurar Email (Resend - Recomendado)

#### Paso 1: Crear cuenta en Resend
1. Ir a: https://resend.com
2. Crear cuenta gratis (100 emails/día)
3. Obtener API Key desde el Dashboard

#### Paso 2: Agregar variables de entorno
Editar `.env.local`:
```env
# Email notifications
RESEND_API_KEY=re_xxxxxxxxxxxxxx
OWNER_EMAIL=tu-email@ejemplo.com
```

#### Paso 3: Instalar dependencia
```powershell
npm install resend
```

#### Paso 4: El webhook ya está listo para usar Resend
Solo necesitas descomentar las líneas en el archivo:
`src/app/api/webhooks/mercadopago/route.ts`

### 3. Configurar Andreani (Opcional)

Solo si quieres que después del pago se genere automáticamente la orden de envío en Andreani:

```env
# Andreani para crear envíos automáticamente
ANDREANI_API_KEY=tu_api_key_andreani
ANDREANI_CONTRACT_NUMBER=tu_numero_contrato
```

Documentación: https://developers.andreani.com/

## 📋 Flujo completo de notificaciones

```
1. Cliente paga en Mercado Pago
   ↓
2. MP envía notificación al webhook (/api/webhooks/mercadopago)
   ↓
3. El webhook verifica el estado del pago
   ↓
4. Si está APROBADO:
   ├─ 📧 Envía email al dueño del negocio (OWNER_EMAIL)
   ├─ 📧 Envía confirmación al cliente
   ├─ 📦 Crea orden en Andreani (opcional)
   └─ 💾 Guarda en base de datos (opcional)
   ↓
5. Listo! El dueño tiene todos los datos para preparar el envío
```

## 🧪 Testing

### Ver logs de webhooks
Con `DEBUG_CHECKOUT=true` en `.env.local`, verás en terminal:

```
[Webhook MP] Notificación recibida: { type: 'payment', data: { id: '123' } }
[Webhook MP] Pago obtenido: { id: 123, status: 'approved', amount: 15000 }
[Webhook MP] ✅ Pago APROBADO: 123
[Email] 📧 Enviando notificación al dueño: tu-email@ejemplo.com

╔═══════════════════════════════════════════════╗
║       🎉 NUEVA VENTA CONFIRMADA 🎉           ║
╚═══════════════════════════════════════════════╝

💰 Pago ID: 123
💵 Monto: $15000
📧 Cliente: cliente@email.com
...
```

### Simular webhook (para testing local)

```powershell
# Crear un archivo test-webhook.json:
{
  "type": "payment",
  "data": {
    "id": "12345678"
  }
}

# Enviar petición POST:
curl -X POST http://localhost:3000/api/webhooks/mercadopago `
  -H "Content-Type: application/json" `
  -d @test-webhook.json
```

## ⚠️ Importante

1. **Sin webhook configurado en MP**: No recibirás notificaciones automáticas
   - Tendrías que revisar manualmente el dashboard de Mercado Pago cada cierto tiempo

2. **Sin email configurado**: Las ventas se logearán en consola del servidor
   - Útil para desarrollo, pero no práctico para producción

3. **Seguridad**: Mercado Pago firma las notificaciones con `x-signature`
   - En producción deberías validar estas firmas
   - Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#editor_3

## 📊 Alternativas a Resend

Si no quieres usar Resend, también puedes usar:

- **SendGrid**: 100 emails/día gratis
- **Nodemailer + Gmail**: Gratis pero necesitas configurar Gmail
- **Amazon SES**: Muy económico
- **Mailgun**: 5000 emails/mes gratis los primeros 3 meses

## 🎯 Estado actual

✅ **YA FUNCIONA**:
- Mercado Pago suma el costo de envío al total
- El webhook recibe la notificación cuando se paga
- Se loguea toda la información en consola

⏳ **FALTA CONFIGURAR** (tú decides si lo necesitas):
- URL del webhook en Mercado Pago (requiere dominio público o ngrok)
- Servicio de email (Resend u otro)
- Andreani para generación automática de envíos
