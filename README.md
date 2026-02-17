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

## Mercado Pago (Payment Bricks)

Integración de Checkout API con Payment Brick para experiencia transparente.

### Variables de entorno

Crear `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-XXXXXXXXXXXXXXX
MP_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXX
```

### Instalación

```
npm install mercadopago
npm run dev
```

### Frontend

- Página: `src/app/checkout/page.tsx` carga el SDK v2 (`https://sdk.mercadopago.com/js/v2`) y renderiza el Payment Brick dentro de `#paymentBrick_container`.
- Configura `initialization` con `amount` y `payer.email` y `callbacks` (`onReady`, `onSubmit`, `onError`).
- En `onSubmit` se hace `POST` a `/process_payment` (reescritura a `/api/process_payment`).

### Backend

- Endpoint: `/api/process_payment` en `src/app/api/process_payment/route.ts`.
- Usa la librería oficial `mercadopago` y el `MP_ACCESS_TOKEN` para crear el pago.
- Maneja estados `approved`, `rejected`, `pending`/`in_process` y mapea errores comunes de tarjetas (fondos insuficientes, tarjeta vencida, etc.).

### Prueba rápida

1. Completa el e-mail del pagador y monto en `/checkout`.
2. Renderiza el Brick y elige el medio de pago (tarjeta, Rapipago/Pago Fácil, transferencia).
3. Confirma el pago; verás el estado retornado por el backend.
