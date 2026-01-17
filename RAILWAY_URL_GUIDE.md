# 🔗 Cómo Obtener la URL de Railway

## Paso 1: Acceder a Railway Dashboard

1. Ve a [Railway Dashboard](https://railway.app)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto `turnero-backend`

## Paso 2: Obtener la URL Pública

### Opción A: Desde el Dashboard
1. Click en tu servicio (el que tiene el backend)
2. Ve a la pestaña **"Settings"**
3. Busca la sección **"Networking"** o **"Domains"**
4. Verás una URL como:
   ```
   https://turnero-backend-production.up.railway.app
   ```
   o similar

### Opción B: Desde la pestaña Deployments
1. Click en tu servicio
2. Ve a **"Deployments"**
3. Click en el último deployment (debe estar "Active" en verde)
4. En la parte superior verás la URL pública

### Opción C: Generar un Dominio (si no existe)
1. Si no ves ninguna URL:
   - Ve a **Settings** → **Networking**
   - Click en **"Generate Domain"**
   - Railway creará una URL como `https://NOMBRE-production-XXXXX.up.railway.app`

## Paso 3: Verificar que el Backend está Activo

1. Copia la URL (ejemplo: `https://turnero-backend-production.up.railway.app`)
2. Abre una nueva pestaña del navegador
3. Visita: `https://TU-URL/health` o simplemente `https://TU-URL`
4. Deberías ver una respuesta (puede ser "Hello World" o un JSON)

## Paso 4: Configurar en Vercel

Una vez que tengas la URL de Railway:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `Appointment app`
3. Ve a **Settings** → **Environment Variables**
4. Agrega:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://tu-url-de-railway.up.railway.app
   ```
5. Selecciona **Production**, **Preview**, y **Development**
6. Click **"Save"**

## Paso 5: Redesplegar el Frontend

Después de guardar las variables:

1. Ve a **Deployments** en Vercel
2. Click en los **"..."** del último deployment
3. Click **"Redeploy"**
4. Espera que termine el deployment (~2 minutos)

---

## ⚠️ Importante

- La URL debe ser **sin barra final** (`/`):
  - ✅ Correcto: `https://turnero-backend.up.railway.app`
  - ❌ Incorrecto: `https://turnero-backend.up.railway.app/`

- La URL debe incluir **https://**, no http://

---

## 🔍 Troubleshooting

### Si Railway no tiene URL pública:
```bash
# Verifica que el servicio esté escuchando en el puerto correcto
# Railway asigna el puerto vía variable PORT
```

En `src/main.ts` debe tener:
```typescript
const port = process.env.PORT || 3001;
await app.listen(port, '0.0.0.0');
```

### Si el backend muestra "Application Failed":
1. Ve a **Logs** en Railway
2. Busca errores (generalmente variables de entorno faltantes)
3. Asegúrate de tener todas las variables configuradas (ver RAILWAY_SETUP.md)

### Si sigue mostrando 404:
1. Verifica que la URL en Vercel esté correcta
2. Abre la consola del navegador (F12)
3. Busca el log: `[API Client] Base URL configurada:`
4. Debe mostrar tu URL de Railway, no localhost

