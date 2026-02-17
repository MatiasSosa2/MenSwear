# ✅ Integración de Andreani - Cálculo de Envíos

## 🎯 Qué incluye esta integración

- ✅ **Cotización automática de envíos** según código postal
- ✅ **Modo de prueba (MOCK)** que simula respuestas sin llamar a Andreani 
- ✅ **Listo para producción** cuando tengas credenciales reales
- ✅ **Integrado con el checkout** - calcula envío en tiempo real

---

## 🚀 Cómo funciona

### **En el Checkout:**

1. El usuario completa **Código Postal** y **Provincia**
2. La app calcula automáticamente el costo de envío con Andreani
3. El resumen muestra:
   - Subtotal de productos
   - **Envío** (con servicio y días de entrega)
   - Total final (productos + envío)

### **Modo Actual: MOCK (Prueba)**

Actualmente está en **modo simulación** (`ANDREANI_USE_MOCK=true`):
- NO hace llamadas reales a Andreani
- Simula costos según zona geográfica
- Perfecto para desarrollo y pruebas

**Costos simulados por zona:**
- CABA y GBA (CP 1xxx): $2,500 (2-3 días)
- Centro (Córdoba, Santa Fe): $4,500 (4-6 días)  
- Interior: $3,500 (3-5 días)
- Patagonia: $7,500 (7-10 días)

---

## 📦 Cuando tengas credenciales reales de Andreani

### **1. Registrarte en Andreani**

Ve a https://www.andreani.com/ → Sección Empresas

- Necesitarás CUIT/CUIL
- Te darán un **número de contrato**
- Obtendrás **API Key** para sandbox y producción

### **2. Configurar credenciales**

Edita tu `.env.local`:

```env
# Cambiar de mock a API real
ANDREANI_USE_MOCK=false

# Credenciales de Andreani SANDBOX (para pruebas)
ANDREANI_API_KEY=TU_API_KEY_SANDBOX_AQUI
ANDREANI_ENV=sandbox

# Para producción (cuando estés listo):
# ANDREANI_ENV=production
# ANDREANI_API_KEY=TU_API_KEY_PRODUCCION_AQUI
```

### **3. Actualizar número de contrato**

En `src/app/api/shipping/quote/route.ts`, línea 57:

```typescript
contrato: "400006711", // ← Reemplazar con TU número de contrato
```

---

## 🧪 Cómo probar

1. **Ve al checkout**: http://localhost:3000/checkout
2. Agrega productos al carrito
3. Completa tus datos
4. En la sección **Entrega**, ingresa:
   - Código Postal (ej: `1000` para CABA, `5000` para Córdoba)
   - Provincia (ej: `CABA`, `Córdoba`)
5. El costo de envío se calculará automáticamente

**Ejemplos de códigos postales para probar:**
- `1000` - CABA → $2,500
- `1600` - GBA → $2,500
- `5000` - Córdoba → $4,500
- `9000` - Patagonia → $7,500

---

## 📂 Archivos creados

```
src/
├── lib/
│   └── shipping.ts                    # Funciones para cotizar envíos
└── app/
    ├── checkout/
    │   └── Checkout.jsx               # ✅ Actualizado con cálculo de envío
    └── api/
        └── shipping/
            └── quote/
                └── route.ts           # API endpoint para Andreani
```

---

## 🔧 Configuración (`.env.local`)

```env
# Andreani Shipping Configuration
ANDREANI_USE_MOCK=true                  # true = simulación, false = API real
ANDREANI_API_KEY=                       # Tu API key (vacío = usa mock)
ANDREANI_ENV=sandbox                    # sandbox | production
```

---

## 🎨 Características adicionales

### **Validaciones incluidas:**
- ✅ Código postal mínimo 4 dígitos
- ✅ Provincia requerida
- ✅ Debounce de 500ms (no llama API en cada tecla)
- ✅ Loading state mientras calcula
- ✅ Manejo de errores

### **Integración con Mercado Pago:**
- El total con envío se envía automáticamente a Mercado Pago
- El usuario paga productos + envío en un solo pago

---

## 📱 API de Andreani - Endpoints disponibles

Cuando uses la API real, tendrás acceso a:

### **1. Cotización de Tarifas** (ya implementado)
```
POST /v2/tarifas
```

### **2. Crear Orden de Envío** (para implementar después)
```
POST /v2/envios
```

### **3. Tracking** (para implementar después)
```
GET /v1/envios/{numeroEnvio}
```

### **4. Puntos de Retiro** (para implementar después)
```
GET /v1/sucursales
```

---

## 🚀 Próximos pasos sugeridos

1. ✅ **Probar en modo mock** (ya funciona)
2. 🔜 Registrarte en Andreani y obtener credenciales
3. 🔜 Configurar credenciales de sandbox
4. 🔜 Probar con API real en sandbox
5. 🔜 Cuando funcione, pasar a producción

---

## ❓ Dudas frecuentes

**¿Por qué está en modo mock?**
Porque no queremos enviar datos reales a Andreani sin tener credenciales válidas. El mock simula todo el flujo de forma realista.

**¿Puedo cambiar los costos de la simulación?**
Sí, edita la función `mockShippingQuote()` en `src/app/api/shipping/quote/route.ts`

**¿Qué pasa si no tengo credenciales de Andreani?**
La app funcionará perfecto en modo mock. Los envíos se calcularán de forma simulada pero realista.

**¿Cuánto cuesta la integración con Andreani?**
Andreani NO cobra por el uso de su API. Solo pagas los envíos que efectivamente realizas.

---

## 📞 Contacto Andreani

- **Web**: https://www.andreani.com/
- **Email empresas**: empresas@andreani.com
- **Teléfono**: 0810-122-1111
- **Documentación API**: https://developers.andreani.com/

---

✨ **La integración está lista para usar en modo prueba y lista para conectar con Andreani cuando tengas las credenciales!**
