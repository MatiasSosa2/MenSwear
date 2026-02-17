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
