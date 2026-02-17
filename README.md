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

## 💳 Mercado Pago - Checkout Bricks

Este proyecto integra **Mercado Pago Checkout Bricks** para procesar pagos directamente en tu página sin redirecciones.

### ✨ Características

- ✅ **Pago integrado** - Formulario de pago dentro de tu sitio
- ✅ **Sin redirecciones** - Usuario nunca sale de tu página
- ✅ **Múltiples métodos** - Tarjetas, efectivo, transferencias
- ✅ **Personalizable** - Adapta colores y estilos
- ✅ **Responsive** - Funciona en mobile y desktop
- ✅ **Seguro** - PCI-DSS compliant

### 🚀 Configuración rápida

1. **Crea `.env.local`** en la raíz del proyecto:

```bash
cp .env.example .env.local
```

2. **Obtén tus credenciales** en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/credentials)

3. **Agrega las credenciales** a `.env.local`:

```env
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. **Inicia el servidor**:

```bash
npm run dev
```

5. **Prueba el checkout** en [http://localhost:3000/checkout](http://localhost:3000/checkout)

### 🧪 Tarjetas de prueba

| Tarjeta | Número | CVV | Vencimiento | Resultado |
|---------|--------|-----|-------------|-----------|
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | ✅ Aprobado |
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | ✅ Aprobado |
| Rechazada | 5031 4332 1540 6351 | 123 | 11/25 | ❌ Rechazado |

**Titular**: Cualquier nombre  
**DNI**: 12345678

### 📚 Documentación completa

- **[MERCADOPAGO_SETUP.md](MERCADOPAGO_SETUP.md)** - Guía completa de configuración
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Instrucciones para deploy en Vercel

### 🏗️ Arquitectura

**Frontend** (`src/app/checkout/Checkout.jsx`):
- Usa `@mercadopago/sdk-react` 
- Componente `<Payment>` renderiza el formulario
- Recolecta datos del cliente y envío
- Envía pago a API backend

**Backend** (`src/app/api/process_payment/route.ts`):
- Procesa el pago con Mercado Pago SDK
- Valida status y maneja errores
- Retorna resultado al frontend

### 🔧 Personalización

Edita `src/app/checkout/Checkout.jsx` para cambiar colores:

```javascript
const customization = {
  visual: {
    style: {
      theme: 'default',
      customVariables: {
        baseColor: '#0A1F44', // Tu color de marca
      }
    }
  }
};
```

### ⚠️ Importante

- En **desarrollo**: Usa credenciales de **prueba**
- En **producción**: Cambia a credenciales de **producción**
- `NEXT_PUBLIC_MP_PUBLIC_KEY` debe tener el prefijo `NEXT_PUBLIC_`
- Reinicia el servidor después de cambiar `.env.local`
