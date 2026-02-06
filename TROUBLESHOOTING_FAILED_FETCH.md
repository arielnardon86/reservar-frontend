# 🔧 Troubleshooting: Error "Failed to fetch"

## 🔍 Pasos de Diagnóstico

### 1. Verificar en la Consola del Navegador

Abre DevTools (F12) → Console y busca estos logs:

#### ✅ Si la variable está configurada correctamente:
```
[API Client] Base URL configurada: https://turnero-backend-production.up.railway.app
[API Client] NEXT_PUBLIC_API_URL: https://turnero-backend-production.up.railway.app
```

#### ❌ Si la variable NO está configurada:
```
[API Client] Base URL configurada: http://localhost:3001
[API Client] NEXT_PUBLIC_API_URL: NO CONFIGURADA
[API Client] ⚠️ ADVERTENCIA: Intentando conectarse a localhost en producción
```

### 2. Verificar en Network Tab

1. Abre DevTools → **Network**
2. Intenta crear un turno
3. Busca la request a `/appointments`
4. Verifica:
   - **Request URL**: ¿A qué URL está intentando conectarse?
   - **Status**: ¿Qué código de error aparece? (CORS, 404, 500, etc.)
   - **Headers**: ¿Qué headers se están enviando?

### 3. Verificar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Verifica que `NEXT_PUBLIC_API_URL` existe y tiene el valor correcto
4. **IMPORTANTE**: Después de agregar/modificar variables, necesitas hacer **Redeploy**

### 4. Verificar que el Backend está Accesible

Abre en el navegador:
```
https://turnero-backend-production.up.railway.app
```

- Si responde algo (aunque sea 404), el backend está accesible ✅
- Si no responde o da timeout, el backend no está disponible ❌

### 5. Verificar CORS en el Backend

El error puede ser de CORS si:
- En Network tab ves: `CORS policy: No 'Access-Control-Allow-Origin' header`
- El status es `(failed)` o `CORS error`

**Solución**: Configura `ALLOWED_ORIGINS` en Railway con tu dominio de Vercel:
```
ALLOWED_ORIGINS=https://tu-app.vercel.app,http://localhost:3000
```

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Variable no se está leyendo

**Síntomas:**
- Logs muestran `localhost:3001`
- `NEXT_PUBLIC_API_URL: NO CONFIGURADA`

**Solución:**
1. Verifica que la variable está en Vercel (Settings → Environment Variables)
2. **Haz un Redeploy completo** (no solo un push)
3. En Vercel: Deployments → 3 puntos → Redeploy

### Problema 2: Error de CORS

**Síntomas:**
- Error en consola: `CORS policy: ...`
- Status en Network: `(failed)` o `CORS error`

**Solución:**
1. En Railway, agrega variable de entorno:
   ```
   ALLOWED_ORIGINS=https://tu-app.vercel.app,http://localhost:3000
   ```
2. Redeploy el backend
3. Verifica que el dominio de Vercel esté incluido

### Problema 3: Backend no responde

**Síntomas:**
- Timeout en las requests
- Error: `Failed to fetch` o `Network error`

**Solución:**
1. Verifica que el backend está corriendo en Railway
2. Prueba la URL directamente en el navegador
3. Verifica los logs del backend en Railway

### Problema 4: Endpoint no existe

**Síntomas:**
- Status 404 en Network tab
- Error: `Not Found`

**Solución:**
1. Verifica que el endpoint `/appointments?tenantSlug=...` existe en el backend
2. Verifica que el backend tiene la ruta configurada correctamente

## 📋 Checklist Completo

- [ ] Variable `NEXT_PUBLIC_API_URL` configurada en Vercel
- [ ] Valor de la variable es `https://turnero-backend-production.up.railway.app` (con https://)
- [ ] Deployment redeployado después de agregar la variable
- [ ] Backend accesible (puedes abrir la URL en el navegador)
- [ ] CORS configurado en el backend con tu dominio de Vercel
- [ ] Logs en consola muestran la URL correcta (no localhost)
- [ ] Network tab muestra requests a la URL correcta

## 🔍 Información de Debug

Cuando reportes el error, incluye:

1. **Logs de la consola** (especialmente los que empiezan con `[API Client]`)
2. **Network tab**: Screenshot de la request fallida
3. **URL exacta** que aparece en Network tab
4. **Status code** de la request
5. **Mensaje de error completo**

## 💡 Próximos Pasos

Si después de verificar todo lo anterior sigue fallando:

1. Verifica los logs del backend en Railway
2. Prueba hacer un request directo al backend con curl o Postman
3. Verifica que el endpoint `/appointments` acepta POST con `tenantSlug` como query param


