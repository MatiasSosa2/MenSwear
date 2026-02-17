# 🚀 Guía de Deploy en Vercel

## Pasos para publicar tu e-commerce

### 1. Subir a GitHub
✅ Ya completado! Tu código está en GitHub.

### 2. Conectar Vercel

1. **Ir a Vercel**: https://vercel.com
2. **Iniciar sesión** con tu cuenta de GitHub (o crear cuenta)
3. Click en **"Add New Project"** o **"Import Project"**
4. **Autorizar** Vercel para acceder a tu cuenta de GitHub
5. **Seleccionar** tu repositorio `ecommerce-matias` (o el nombre que usaste)
6. Click en **"Import"**

### 3. Configurar el proyecto

Vercel detectará automáticamente que es un proyecto Next.js. Configuración:

- **Framework Preset**: Next.js ✅ (auto-detectado)
- **Root Directory**: `./` (dejar por defecto)
- **Build Command**: `npm run build` ✅ (auto-detectado)  
- **Output Directory**: `.next` ✅ (auto-detectado)
- **Install Command**: `npm install` ✅ (auto-detectado)

### 4. ⚠️ IMPORTANTE: Configurar Variables de Entorno

Antes de hacer deploy, necesitas agregar las variables de entorno. Click en **"Environment Variables"**:

#### Variables OBLIGATORIAS:

```env
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-8c797bcd-b767-4779-adc7-bb5683475d13
MP_ACCESS_TOKEN=APP_USR-2736928672519226-021719-e132fa0a221ca61125714366d9ee2dfc-2570442822
OWNER_EMAIL=tu-email@ejemplo.com
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

⚠️ **IMPORTANTE**: 
- Reemplaza `OWNER_EMAIL` con tu email real
- `NEXT_PUBLIC_SITE_URL` lo configurarás después (primero deploy, luego actualizas)
- Mantén las credenciales de Mercado Pago que ya tienes

#### Variables OPCIONALES (puedes agregarlas después):

```env
DEBUG_CHECKOUT=false
ANDREANI_USE_MOCK=true
```

Si quieres emails automáticos (recomendado):
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 5. Deploy

1. Click en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel construye tu proyecto
3. ✅ **Listo!** Vercel te dará una URL como: `https://ecommerce-matias.vercel.app`

### 6. Actualizar NEXT_PUBLIC_SITE_URL

Después del primer deploy:

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Environment Variables"**
3. Busca `NEXT_PUBLIC_SITE_URL`
4. Cambia el valor a tu URL de Vercel (ej: `https://ecommerce-matias.vercel.app`)
5. Click **"Save"**
6. **Redeploy**: Ve a "Deployments" → Click en los 3 puntos de la última versión → "Redeploy"

### 7. Configurar Webhook de Mercado Pago

Para recibir notificaciones de pagos:

1. Ve a: https://www.mercadopago.com.ar/developers/panel/app
2. Selecciona tu aplicación
3. Click en **"Webhooks"** en el menú lateral
4. Click en **"Agregar endpoint"**
5. **URL de notificación**: `https://tu-proyecto.vercel.app/api/webhooks/mercadopago`
6. **Eventos**: Selecciona **"Pagos"**
7. Click **"Guardar"**

¡Ahora recibirás notificaciones automáticas de cada venta!

### 8. (Opcional) Configurar Dominio Personalizado

Si tienes un dominio propio:

1. En Vercel: **Settings** → **Domains**
2. Agregar tu dominio (ej: `tusitio.com`)
3. Seguir las instrucciones de Vercel para configurar DNS
4. Actualizar `NEXT_PUBLIC_SITE_URL` al nuevo dominio

## ✅ Checklist Post-Deploy

- [ ] Sitio accesible en la URL de Vercel
- [ ] Variables de entorno configuradas
- [ ] `OWNER_EMAIL` configurado con tu email real
- [ ] `NEXT_PUBLIC_SITE_URL` actualizado con la URL de Vercel
- [ ] Webhook de Mercado Pago configurado
- [ ] Probar una compra de prueba
- [ ] Verificar que recibes notificación en logs (Vercel → Functions → Logs)
- [ ] (Opcional) Configurar Resend para emails automáticos

## 🧪 Probar el sitio en producción

1. Abre tu sitio en Vercel
2. Agrega productos al carrito
3. Ve a checkout
4. Completa el formulario con:
   - Código postal válido (ej: 1425 para CABA)
   - Email real
   - Datos de envío
5. Click "Proceder al Pago"
6. Pagar con tarjeta de prueba:
   ```
   Número: 5031 7557 3453 0604
   CVV: 123
   Vencimiento: 11/25
   Titular: Cualquier nombre
   DNI: 12345678
   ```
7. Verificar que recibes notificación en:
   - Vercel Functions Logs (si tienes webhook configurado)
   - Tu email (si configuraste Resend)

## 🔍 Ver logs en producción

Para ver si las notificaciones están funcionando:

1. Ve a tu proyecto en Vercel
2. Click en **"Functions"** en el menú superior
3. Busca `/api/webhooks/mercadopago`
4. Click en la función para ver los logs
5. Verás las notificaciones de cada pago

## ⚠️ Troubleshooting

### Error: "Missing required environment variables"
- Verifica que agregaste todas las variables obligatorias en Vercel
- Redeploy el proyecto después de agregar variables

### No recibo notificaciones de Mercado Pago
- Verifica que configuraste el webhook en Mercado Pago
- La URL debe ser HTTPS (Vercel lo provee automáticamente)
- Revisa los logs en Vercel → Functions

### El envío no calcula
- Verifica que `ANDREANI_USE_MOCK=true` esté configurado
- Si quieres usar Andreani real, necesitas credenciales

### Auto-return error
- Vercel usa HTTPS, el auto_return funcionará automáticamente
- En `.env` de Vercel NO pongas localhost

## 📚 Recursos

- **Vercel Docs**: https://vercel.com/docs
- **Mercado Pago Webhooks**: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
- **Resend (emails)**: https://resend.com/docs
- **Andreani API**: https://developers.andreani.com/

---

## 🎉 ¡Felicidades!

Tu e-commerce está en producción. Cada venta será notificada automáticamente y Mercado Pago procesará los pagos de forma segura.
