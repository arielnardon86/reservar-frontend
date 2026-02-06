# ⚙️ Configuración de Vercel - Variables de Entorno

## 🔴 Problema Actual

El frontend en Vercel está intentando conectarse a `http://localhost:3001` porque la variable de entorno `NEXT_PUBLIC_API_URL` no está configurada.

## ✅ Solución: Configurar Variable de Entorno en Vercel

### Paso 1: Obtener URL del Backend

**Primero, necesitas tener el backend desplegado:**

- Si usas **Railway**: La URL será algo como `https://turnero-backend-production.up.railway.app`
- Si usas **Render**: La URL será algo como `https://turnero-backend.onrender.com`
- Si usas **Fly.io**: La URL será algo como `https://turnero-backend.fly.dev`

**⚠️ IMPORTANTE:** El backend debe estar desplegado ANTES de configurar esta variable.

### Paso 2: Configurar en Vercel

1. **Ve a tu proyecto en Vercel**
   - Abre [vercel.com](https://vercel.com)
   - Selecciona tu proyecto `turnero-frontend`

2. **Ir a Settings → Environment Variables**
   - Click en **"Settings"** (en el menú superior)
   - Click en **"Environment Variables"** (en el menú lateral)

3. **Agregar Variable**
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://tu-backend.railway.app` (reemplaza con tu URL real)
   - **Environments**: Marca todas las opciones:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Guardar**
   - Click en **"Save"**

5. **Redeploy**
   - Vercel debería detectar el cambio automáticamente
   - O ve a **"Deployments"** → Click en los **3 puntos** del último deployment → **"Redeploy"**

---

## 🔍 Verificar que Funciona

### 1. Verificar en el Browser

1. Abre tu app en Vercel
2. Abre **DevTools** (F12)
3. Ve a la pestaña **Console**
4. Intenta crear un turno
5. Deberías ver en la consola:
   ```
   [API Client] Sending request with tenantId: xxx to: /appointments
   ```
6. Si ves errores de conexión, verifica:
   - Que la URL del backend es correcta
   - Que el backend está corriendo
   - Que no hay problemas de CORS

### 2. Verificar en Network Tab

1. Abre **DevTools** → **Network**
2. Intenta crear un turno
3. Deberías ver requests a tu backend (no a localhost)

---

## 🚨 Troubleshooting

### Error: "Failed to fetch" o "Network Error"

**Causa:** El backend no está accesible o la URL es incorrecta.

**Solución:**
1. Verifica que el backend está desplegado y corriendo
2. Prueba la URL del backend directamente en el navegador:
   ```
   https://tu-backend.railway.app/health
   ```
   (Debería responder algo, aunque sea un 404)

3. Verifica que la variable `NEXT_PUBLIC_API_URL` está configurada correctamente en Vercel

### Error: "CORS policy"

**Causa:** El backend no permite requests desde el dominio de Vercel.

**Solución:**
1. En el backend, configura CORS para permitir tu dominio de Vercel:
   ```typescript
   // main.ts
   app.enableCors({
     origin: [
       'https://tu-app.vercel.app',
       'https://www.tu-dominio.com',
       'http://localhost:3000', // Para desarrollo
     ],
   });
   ```

### Error: "404 Not Found" en las requests

**Causa:** La URL del backend es incorrecta o falta el prefijo `/api`.

**Solución:**
1. Verifica que la URL del backend es correcta
2. Si tu backend tiene un prefijo `/api`, agrégalo:
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
   ```

---

## 📋 Checklist Completo

### Backend
- [ ] Backend desplegado en Railway/Render/Fly.io
- [ ] Backend accesible (puedes hacer requests desde el navegador)
- [ ] CORS configurado para permitir tu dominio de Vercel
- [ ] Variables de entorno del backend configuradas (DATABASE_URL, JWT_SECRET, etc.)

### Frontend
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada en Vercel
- [ ] Valor de la variable es la URL correcta del backend (con https://)
- [ ] Deployment redeployado después de agregar la variable
- [ ] Verificado en la consola del navegador que las requests van al backend correcto

---

## 🔄 Después de Configurar

Una vez configurado, deberías poder:
- ✅ Crear turnos desde el frontend
- ✅ Ver turnos en el dashboard admin
- ✅ Recibir emails de confirmación
- ✅ Todo el flujo funcionando end-to-end

---

## 💡 Tip: Verificar Variables en Vercel

Puedes verificar que las variables están configuradas correctamente:

1. Ve a **Settings** → **Environment Variables**
2. Deberías ver `NEXT_PUBLIC_API_URL` listada
3. El valor debería ser la URL de tu backend (no localhost)

---

**¿Necesitas ayuda para desplegar el backend primero?** Ver `DEPLOYMENT_STRATEGY.md` para la guía completa.


