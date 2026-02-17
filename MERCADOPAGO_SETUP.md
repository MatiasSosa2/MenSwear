# 🎯 Configuración de Mercado Pago Checkout Bricks

## ✅ Ventajas de Checkout Bricks

- ✨ **Usuario nunca sale de tu sitio** - Todo el proceso de pago sucede en tu página
- 🎨 **Personalizable** - Adapta los colores y estilos a tu marca
- 💳 **Múltiples métodos** - Acepta tarjetas, efectivo, transferencias
- 📱 **Responsive** - Funciona perfecto en mobile y desktop
- 🔒 **Seguro** - Certificación PCI-DSS de Mercado Pago

## 🚀 Pasos de configuración

### 1. Obtener credenciales de Mercado Pago

1. Ingresa a tu cuenta de Mercado Pago
2. Ve a [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel/credentials)
3. Copia tus credenciales **de prueba** (para desarrollo):
   - **Public Key**: APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   - **Access Token**: APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copia .env.example a .env.local
cp .env.example .env.local
```

Edita `.env.local` y reemplaza con tus credenciales:

```env
NEXT_PUBLIC_MP_PUBLIC_KEY=TU_PUBLIC_KEY_AQUI
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN_AQUI
```

⚠️ **IMPORTANTE**: 
- `NEXT_PUBLIC_MP_PUBLIC_KEY` debe empezar con `NEXT_PUBLIC_` para estar disponible en el navegador
- `MP_ACCESS_TOKEN` solo se usa en el servidor (API routes)

### 3. Reiniciar el servidor

```bash
npm run dev
```

### 4. Probar el checkout

1. Agrega productos al carrito
2. Ve a `/checkout`
3. Completa los datos de contacto y entrega
4. Verás el formulario de pago integrado de Mercado Pago
5. Usa tarjetas de prueba:

#### Tarjetas de prueba (Argentina)

| Tarjeta | Número | CVV | Fecha |
|---------|--------|-----|-------|
| Mastercard Aprobada | 5031 7557 3453 0604 | 123 | 11/25 |
| Visa Aprobada | 4509 9535 6623 3704 | 123 | 11/25 |
| Rechazada | 5031 4332 1540 6351 | 123 | 11/25 |

**Datos del titular**: Cualquier nombre
**DNI**: 12345678

### 5. Producción

Cuando estés listo para producción:

1. Ve a [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel/credentials)
2. Cambia a **Credenciales de producción**
3. Actualiza `.env.local` con las credenciales de producción
4. Configura las mismas variables en Vercel/tu hosting

## 🎨 Personalización

El componente Payment Brick acepta personalización de colores y estilos. Edita en `src/app/checkout/Checkout.jsx`:

```javascript
const customization = {
  visual: {
    style: {
      theme: 'default', // 'default', 'dark', 'bootstrap', 'flat'
      customVariables: {
        textPrimaryColor: '#000000',
        textSecondaryColor: '#666666',
        inputBackgroundColor: '#FFFFFF',
        formBackgroundColor: '#FFFFFF',
        baseColor: '#0A1F44', // Color de tu marca
        borderColor: '#E5E5E5',
      }
    }
  },
  paymentMethods: {
    maxInstallments: 12,
    minInstallments: 1,
  }
};
```

## 🔄 Flujo de pago

1. **Usuario completa formulario** → Datos y dirección de envío
2. **Aparece Payment Brick** → Formulario de pago de Mercado Pago
3. **Usuario ingresa tarjeta** → Datos validados en tiempo real
4. **Submit** → Se llama a `/api/process_payment`
5. **Backend procesa** → Verifica pago con Mercado Pago
6. **Confirmación** → Usuario ve mensaje de éxito/error

## 🐛 Troubleshooting

### "Falta configurar NEXT_PUBLIC_MP_PUBLIC_KEY"

- Verifica que el archivo `.env.local` existe
- Asegúrate de que la variable empieza con `NEXT_PUBLIC_`
- Reinicia el servidor (`npm run dev`)

### "Error 401: Invalid token"

- Verifica que copiaste correctamente el Access Token
- Asegúrate de usar credenciales de prueba en desarrollo
- El Access Token debe empezar con `APP_USR-`

### El formulario no aparece

- Abre la consola del navegador (F12)
- Busca errores de JavaScript
- Verifica que tienes items en el carrito
- Confirma que completaste los datos de contacto y entrega

## 📚 Documentación oficial

- [Checkout Bricks - Docs](https://www.mercadopago.com/developers/es/docs/checkout-bricks/landing)
- [Payment Brick](https://www.mercadopago.com/developers/es/docs/checkout-bricks/payment-brick/introduction)
- [Tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks/additional-content/test-cards)

## 🎉 ¡Listo!

Tu checkout ahora acepta pagos directamente en tu página sin redirecciones. Los usuarios tendrán una experiencia fluida y profesional.
