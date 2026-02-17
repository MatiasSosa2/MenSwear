# 🔧 Solución de problemas - Mercado Pago

## ✅ Problemas corregidos

### 1. "MercadoPago has already been initialized"
**Causa**: Inicialización múltiple de MercadoPago  
**Solución**: Movido a useEffect con ref para inicializar solo una vez

### 2. "entityType only receives the value individual or association"
**Causa**: Faltaba el campo `entity_type` en el payer  
**Solución**: Agregado `entity_type: 'individual'` en initialization y onSubmit

### 3. Error 400 en API de Mercado Pago
**Causa**: Datos incompletos o formato incorrecto  
**Solución**: Validación mejorada y entity_type agregado

## 🚀 Próximos pasos

### 1. Verifica tu .env.local

Asegúrate de que el archivo `.env.local` tenga:

```env
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANTE**: Usa credenciales de PRUEBA para desarrollo.

### 2. Reinicia el servidor

```bash
# Detén el servidor (Ctrl+C)
# Inicia nuevamente
npm run dev
```

### 3. Prueba el checkout

1. Ve a http://localhost:3000/checkout
2. Completa los datos de contacto
3. Completa la dirección de envío
4. Deberías ver el formulario de pago de Mercado Pago
5. Usa una tarjeta de prueba:
   - **Número**: 5031 7557 3453 0604
   - **CVV**: 123
   - **Vencimiento**: 11/25
   - **Titular**: APRO
   - **DNI**: 12345678

## 🐛 Si aún hay errores

### Error: "Falta configurar NEXT_PUBLIC_MP_PUBLIC_KEY"

**Solución**:
1. Verifica que el archivo `.env.local` existe en la raíz del proyecto
2. Verifica que la variable comience con `NEXT_PUBLIC_`
3. Reinicia el servidor

### Error: "Payment Brick no aparece"

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores de JavaScript
3. Verifica que completaste los datos de contacto y entrega
4. Verifica que hay items en el carrito

### Error 401: "Invalid token"

**Solución**:
1. Verifica que copiaste correctamente el Access Token
2. Asegúrate de usar credenciales de **PRUEBA** en desarrollo
3. El token debe empezar con `APP_USR-`

### Error: "Cannot read properties of undefined"

**Solución**:
1. Limpia el localStorage: `localStorage.clear()` en consola
2. Recarga la página (F5)
3. Agrega productos al carrito nuevamente

## 📋 Checklist de verificación

Antes de probar, confirma que:

- [ ] El archivo `.env.local` existe
- [ ] Tiene `NEXT_PUBLIC_MP_PUBLIC_KEY` correcto
- [ ] Tiene `MP_ACCESS_TOKEN` correcto
- [ ] Usas credenciales de **PRUEBA** (no producción)
- [ ] El servidor está corriendo (`npm run dev`)
- [ ] No hay errores en la consola del navegador (F12)
- [ ] Hay productos en el carrito
- [ ] Completaste datos de contacto y dirección

## 🎓 Información adicional

### Credenciales de prueba vs producción

**PRUEBA** (development):
- No procesa dinero real
- Para testear la integración
- Obtén en: Panel Developers → Credenciales de **Prueba**

**PRODUCCIÓN** (cuando estés listo):
- Procesa dinero real
- Para recibir pagos de clientes
- Obtén en: Panel Developers → Credenciales de **Producción**

### Cambiar a producción

Cuando estés listo para aceptar pagos reales:

1. Ve a https://www.mercadopago.com.ar/developers/panel/credentials
2. Cambia a **Credenciales de producción**
3. Copia las nuevas credenciales
4. Actualiza `.env.local` (local) o variables de Vercel (producción)
5. Re-deploya tu aplicación

## 📞 Recursos útiles

- [Documentación Checkout Bricks](https://www.mercadopago.com/developers/es/docs/checkout-bricks/landing)
- [Tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-bricks/additional-content/test-cards)
- [Panel de desarrolladores](https://www.mercadopago.com.ar/developers/panel)
- [MERCADOPAGO_SETUP.md](./MERCADOPAGO_SETUP.md) - Guía completa
