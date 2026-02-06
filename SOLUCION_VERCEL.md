# 🔧 Solución Rápida: Error al Guardar Turnos en Vercel

## 🔴 Problema

El frontend en Vercel no puede guardar turnos porque está intentando conectarse a `localhost:3001` en lugar de tu backend en producción.

## ✅ Solución en 3 Pasos

### Paso 1: Obtener URL del Backend

**¿Ya tienes el backend desplegado?**

- **Railway**: Ve a tu proyecto → Settings → Domains → Copia la URL (ej: `https://turnero-backend-production.up.railway.app`)
- **Render**: Ve a tu servicio → Copia la URL (ej: `https://turnero-backend.onrender.com`)
- **Fly.io**: Ve a tu app → Copia la URL (ej: `https://turnero-backend.fly.dev`)

**⚠️ Si NO tienes el backend desplegado:**
1. Primero despliega el backend (ver `DEPLOYMENT_STRATEGY.md`)
2. Luego continúa con los pasos siguientes

---

### Paso 2: Configurar Variable en Vercel

1. **Abre Vercel**: [vercel.com](https://vercel.com) → Tu proyecto

2. **Settings → Environment Variables**
   - Click en **"Settings"** (arriba)
   - Click en **"Environment Variables"** (lateral)

3. **Agregar Variable:**
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://tu-backend.railway.app  (tu URL real)
   ```

4. **Seleccionar Environments:**
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

5. **Save** → **Redeploy** (o espera el próximo push)

---

### Paso 3: Configurar CORS en Backend

**Si el backend ya está desplegado**, actualiza la variable de entorno:

**En Railway/Render/Fly.io, agrega:**
```
ALLOWED_ORIGINS=https://tu-app.vercel.app,https://www.tu-dominio.com,http://localhost:3000
```

**O si prefieres permitir todos en desarrollo:**
```
ALLOWED_ORIGINS=*
```

**Luego redeploy el backend.**

---

## 🧪 Verificar que Funciona

1. **Abre tu app en Vercel**
2. **Abre DevTools** (F12) → **Console**
3. **Intenta crear un turno**
4. **Deberías ver:**
   ```
   [API Client] Sending request with tenantId: xxx to: /appointments
   ```
5. **Si ves errores de CORS**, verifica que `ALLOWED_ORIGINS` incluye tu dominio de Vercel

---

## 📋 Resumen Rápido

**Frontend (Vercel):**
- Variable: `NEXT_PUBLIC_API_URL` = `https://tu-backend.railway.app`

**Backend (Railway/Render):**
- Variable: `ALLOWED_ORIGINS` = `https://tu-app.vercel.app,http://localhost:3000`

**Luego redeploy ambos.**

---

## 🆘 Si Sigue Sin Funcionar

1. **Verifica que el backend responde:**
   - Abre en el navegador: `https://tu-backend.railway.app/health` (o cualquier endpoint)
   - Debería responder algo (aunque sea 404, significa que está vivo)

2. **Verifica en la consola del navegador:**
   - ¿A qué URL está intentando conectarse?
   - ¿Qué error exacto aparece?

3. **Verifica CORS:**
   - En Network tab, busca la request fallida
   - Si dice "CORS", el backend no está permitiendo tu dominio

---

**¿Necesitas ayuda con algún paso específico?** 🚀


