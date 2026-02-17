# 🚀 Desplegar a GitHub Pages

## Configuración completada ✅

Tu proyecto ya está configurado para GitHub Pages con:
- ✅ Next.js configurado para exportación estática
- ✅ GitHub Actions workflow creado
- ✅ Archivos necesarios agregados (.nojekyll)
- ✅ Commit realizado en la rama `main`

## Pasos para completar el despliegue

### 1. Crear repositorio en GitHub

Ve a [GitHub](https://github.com/new) y crea un nuevo repositorio llamado **E-commerce**

⚠️ **IMPORTANTE**: El nombre debe ser exactamente `E-commerce` para que funcione con la configuración actual.

### 2. Conectar tu repositorio local

```bash
git remote add origin https://github.com/TU_USUARIO/E-commerce.git
git push -u origin main
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

### 3. Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona **GitHub Actions**
5. ¡Listo! El workflow se ejecutará automáticamente

### 4. Acceder a tu sitio

Una vez que el workflow termine (toma unos minutos), tu sitio estará disponible en:

```
https://TU_USUARIO.github.io/E-commerce/
```

## ⚠️ Limitaciones importantes

**GitHub Pages sirve solo sitios estáticos**, por lo que:

### ❌ NO funcionarán:
- Las rutas API (`/api/create_preference` y `/api/process_payment`)
- La integración con Mercado Pago
- Cualquier funcionalidad del servidor

### ✅ SÍ funcionarán:
- Navegación entre páginas
- Carrito de compras (localStorage)
- Filtros de productos
- Banners y diseño responsive
- Todas las páginas estáticas

## 🔧 Soluciones alternativas

Si necesitas las funcionalidades de servidor (Mercado Pago), considera:

1. **Vercel** (recomendado para Next.js):
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Netlify**:
   - Deploy desde GitHub
   - Soporta funciones serverless

3. **Backend separado**:
   - Mantén GitHub Pages para el frontend
   - Crea un backend en Vercel/Render para las APIs

## 📝 Comandos útiles

```bash
# Build local para probar
npm run build

# Ver el sitio generado (carpeta out/)
npx serve out

# Forzar nuevo deploy
git commit --allow-empty -m "Trigger deploy"
git push
```

## 🔄 Futuras actualizaciones

Cada vez que hagas `git push` a la rama `main`, GitHub Actions automáticamente:
1. Instala dependencias
2. Genera el build estático
3. Despliega a GitHub Pages

¡Tu sitio se actualiza solo! 🎉

---

# 🚀 Desplegar a Vercel (RECOMENDADO para Mercado Pago)

## ¿Por qué Vercel?

Vercel es la plataforma oficial de Next.js y **soporta completamente**:
- ✅ API Routes (necesarias para Mercado Pago)
- ✅ Server-side rendering
- ✅ Variables de entorno
- ✅ Deploy automático desde GitHub
- ✅ HTTPS gratis
- ✅ CDN global

## Pasos para desplegar en Vercel

### 1. Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub (recomendado)

### 2. Importar proyecto

#### Opción A: Desde la web

1. Click en **Add New Project**
2. Importa tu repositorio `E-commerce` desde GitHub
3. Vercel detectará automáticamente que es Next.js
4. Click en **Deploy**

#### Opción B: Desde la terminal

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Sigue las instrucciones:
# - Login con GitHub
# - Selecciona scope/equipo
# - Confirma nombre del proyecto
```

### 3. Configurar variables de entorno

⚠️ **CRÍTICO**: Debes configurar las credenciales de Mercado Pago en Vercel.

1. Ve a tu proyecto en [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click en **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | `APP_USR-xxx...` | Public Key de Mercado Pago |
| `MP_ACCESS_TOKEN` | `APP_USR-xxx...` | Access Token de Mercado Pago |
| `DEBUG_CHECKOUT` | `false` | (Opcional) Para debug |

**Dónde obtener las credenciales:**
- Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/credentials)
- Copia tu **Public Key** y **Access Token**
- Para producción, usa las credenciales de **Producción**
- Para pruebas, usa las de **Prueba**

### 4. Re-deploy después de agregar variables

```bash
# Desde la terminal
vercel --prod

# O desde la web:
# Settings → Deployments → [último deploy] → Redeploy
```

### 5. Tu sitio está listo

Tu e-commerce estará disponible en:
```
https://tu-proyecto.vercel.app
```

O con dominio personalizado (configurable en Vercel).

## 🔧 Configuración de producción

### Actualizar credenciales de Mercado Pago

Para usar pagos reales (no de prueba):

1. Ve a [MP Developers](https://www.mercadopago.com.ar/developers/panel/credentials)
2. Cambia a **Credenciales de producción**
3. Copia las nuevas credenciales
4. Actualiza las variables en Vercel
5. Re-deploya

### Configurar dominio personalizado

1. En Vercel: **Settings** → **Domains**
2. Agrega tu dominio (ej: `mitienda.com`)
3. Sigue las instrucciones para actualizar DNS
4. Vercel configurará HTTPS automáticamente

## 📊 Monitoreo

Vercel te da:
- 📈 Analytics de tráfico
- 🐛 Logs de errores en tiempo real
- ⚡ Métricas de performance
- 🔔 Notificaciones de deploy

## 🔄 Deploy automático

Cada vez que hagas `git push` a GitHub:
1. Vercel detecta el cambio
2. Ejecuta el build automáticamente
3. Deploya la nueva versión
4. Te notifica por email

## 🆚 Comparación: GitHub Pages vs Vercel

| Característica | GitHub Pages | Vercel |
|----------------|--------------|--------|
| Hosting | ✅ Gratis | ✅ Gratis |
| Custom domain | ✅ | ✅ |
| HTTPS | ✅ | ✅ |
| API Routes | ❌ | ✅ |
| Mercado Pago | ❌ | ✅ |
| Server-side | ❌ | ✅ |
| Build automático | ✅ | ✅ |
| Recomendado para | Sitios estáticos | Next.js apps |

## ✅ Recomendación final

Para este proyecto **usa Vercel** porque:
1. Necesitas Mercado Pago (API routes)
2. Es la plataforma oficial de Next.js
3. Deploy más simple
4. Mejor experiencia de usuario

**GitHub Pages** es perfecto para portfolios y sitios estáticos, pero no para e-commerce con pagos.
