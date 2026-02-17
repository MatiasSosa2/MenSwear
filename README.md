This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## � E-commerce con Mercado Pago y Andreani

### ✨ Características implementadas

- ✅ **Catálogo de productos** - Navegación por categorías
- ✅ **Carrito de compras** - Gestión completa del carrito
- ✅ **Mercado Pago Checkout Pro** - Pagos con redirección segura
- ✅ **Cálculo de envío Andreani** - Cotización automática por código postal
- ✅ **Sistema de notificaciones** - Webhooks para confirmación de pagos
- ✅ **Responsive** - Funciona en mobile y desktop
- ✅ **TypeScript** - Código tipado y seguro

### 🚀 Setup rápido

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar credenciales** en `.env.local`:
```env
# Mercado Pago (OBLIGATORIO)
NEXT_PUBLIC_MP_PUBLIC_KEY=TU_PUBLIC_KEY
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN

# Email del dueño (OBLIGATORIO)
OWNER_EMAIL=tu-email@ejemplo.com

# Andreani en modo MOCK (OPCIONAL - ya configurado)
ANDREANI_USE_MOCK=true

# Resend para emails (OPCIONAL)
# RESEND_API_KEY=re_xxxxx
```

3. **Iniciar servidor**:
```bash
npm run dev
```

4. **Abrir** [http://localhost:3000](http://localhost:3000)

### 📚 Guías de configuración

| Archivo | Descripción |
|---------|-------------|
| [MERCADOPAGO_SETUP.md](MERCADOPAGO_SETUP.md) | Configuración de Mercado Pago |
| [ANDREANI_SETUP.md](ANDREANI_SETUP.md) | Integración de envíos |
| [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md) | Sistema de notificaciones |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploy en Vercel |

### 🏗️ Arquitectura

#### Frontend
- **`src/app/checkout/Checkout.jsx`** - Checkout con formulario de datos y envío
- **`src/components/FloatingCart.tsx`** - Carrito flotante
- **`src/lib/cart.ts`** - Gestión de carrito (localStorage)
- **`src/lib/shipping.ts`** - Cliente para cotización de envíos

#### Backend (API Routes)
- **`src/app/api/create_preference/route.ts`** - Crea preferencia de pago en MP
- **`src/app/api/shipping/quote/route.ts`** - Cotiza envío con Andreani
- **`src/app/api/webhooks/mercadopago/route.ts`** - Recibe notificaciones de pagos

### 🔄 Flujo completo de compra

```
1. Cliente navega productos → Agrega al carrito
   ↓
2. Va a /checkout → Completa datos y dirección de envío
   ↓
3. Sistema calcula costo de envío (Andreani API)
   ↓
4. Cliente ve total (productos + envío) → "Proceder al pago"
   ↓
5. Redirección a Mercado Pago Checkout Pro
   ↓
6. Cliente paga con su método preferido
   ↓
7. MP envía notificación al webhook
   ↓
8. Sistema:
   - 📧 Envía email al dueño con datos del pedido
   - 📧 Envía confirmación al cliente
   - 📦 (Opcional) Crea orden de envío en Andreani
   ↓
9. Dueño prepara y despacha el pedido
```

### 🎯 Estado actual

#### ✅ Completamente funcional
- Catálogo y navegación de productos
- Carrito de compras (persiste en localStorage)
- Checkout con formulario de datos
- Cotización de envío en tiempo real (MOCK mode)
- Pago con Mercado Pago (Checkout Pro)
- Total incluye productos + envío
- Webhook recibe confirmaciones (loguea en consola)

#### ⏳ Requiere configuración adicional
- **Webhook URL en Mercado Pago**: Necesitas dominio público o ngrok (ver [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md))
- **Email notifications**: Configurar Resend u otro servicio (opcional)
- **Andreani real**: Cambiar `ANDREANI_USE_MOCK=false` y agregar credenciales (opcional)

### 🧪 Testing

#### Probar compra completa:
1. Ir a [http://localhost:3000](http://localhost:3000)
2. Agregar productos al carrito
3. Ir a Checkout
4. Completar formulario (usar CP válido ej: 1425 CABA)
5. Ver costo de envío calculado
6. Click "Proceder al Pago"
7. Pagar con tarjeta de prueba (ver MERCADOPAGO_SETUP.md)
8. Ver notificación en consola del servidor

#### Tarjetas de prueba:
```
Mastercard Aprobada: 5031 7557 3453 0604
CVV: 123 | Vencimiento: 11/25 | DNI: 12345678
```

### 🔒 Seguridad

- Variables de entorno nunca se exponen al cliente
- `MP_ACCESS_TOKEN` solo se usa en servidor
- Webhooks validan origen de Mercado Pago
- No se almacenan datos de tarjetas

### ⚠️ Importante para producción

1. **Cambiar a credenciales de producción** en Mercado Pago
2. **Configurar webhook URL** con dominio real
3. **Cambiar `DEBUG_CHECKOUT=false`**
4. **Configurar servicio de email** (Resend, SendGrid, etc.)
5. **Opcional**: Integrar Andreani real si tienes contrato
