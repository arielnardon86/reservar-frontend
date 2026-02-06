# 🔧 Solución: Error de CORS en Railway

## 🔴 Problema Identificado

El error en la consola muestra claramente:

```
Access to fetch at 'https://turnero-backend-production.up.railway.app//tenants' 
from origin 'https://turnero-frontend.vercel.app' 
has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causa:** El backend en Railway no está configurado para permitir requests desde tu dominio de Vercel.

---

## ✅ Solución: Configurar CORS en el Backend

### Paso 1: Agregar Variable de Entorno en Railway

1. **Ve a tu proyecto en Railway**
   - Abre `turnero-backend`

2. **Ve a "Variables"** (o "Settings" → "Variables")

3. **Agrega una nueva variable:**
   - **Key:** `ALLOWED_ORIGINS`
   - **Value:** `https://turnero-frontend.vercel.app,http://localhost:3000`
   
   ⚠️ **IMPORTANTE:** Reemplaza `turnero-frontend.vercel.app` con tu dominio real de Vercel si es diferente.

4. **Guarda** la variable

5. **Redeploy el servicio** (Railway debería hacerlo automáticamente, o hazlo manualmente)

---

### Paso 2: Configurar CORS en el Código del Backend (NestJS)

Si tienes acceso al código del backend, asegúrate de que el archivo `main.ts` tenga la configuración de CORS:

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${port}`);
}
bootstrap();
```

**Si no tienes acceso al código del backend**, solo necesitas configurar la variable `ALLOWED_ORIGINS` en Railway y el backend debería leerla automáticamente (si está configurado para hacerlo).

---

## 🔍 Verificar que Funciona

### 1. Verifica la Variable en Railway

- Ve a Variables en Railway
- Confirma que `ALLOWED_ORIGINS` está configurada con tu dominio de Vercel

### 2. Verifica que el Backend se Redeployó

- Ve a Deployments en Railway
- Confirma que hay un nuevo deployment después de agregar la variable

### 3. Prueba en el Frontend

1. Abre tu app en Vercel
2. Abre DevTools (F12) → Console
3. Intenta crear un turno o hacer cualquier acción
4. **Deberías ver:**
   - ✅ Requests exitosas (sin errores de CORS)
   - ✅ Status 200 o 201 en Network tab

### 4. Verifica en Network Tab

1. DevTools → Network
2. Busca la request a `/tenants` o `/appointments`
3. **Deberías ver:**
   - Status: `200` o `201` (no `(failed)` o `CORS error`)
   - Headers de respuesta incluyen `Access-Control-Allow-Origin`

---

## 🚨 Si Sigue Sin Funcionar

### Opción 1: Permitir Todos los Orígenes (Solo para Desarrollo/Testing)

Si necesitas una solución rápida para probar, puedes permitir todos los orígenes:

**En Railway, cambia `ALLOWED_ORIGINS` a:**
```
ALLOWED_ORIGINS=*
```

⚠️ **ADVERTENCIA:** Esto permite requests desde cualquier dominio. Solo úsalo para testing. En producción, especifica los dominios exactos.

### Opción 2: Verificar el Código del Backend

Si tienes acceso al código del backend:

1. Verifica que `main.ts` tiene `app.enableCors()` configurado
2. Verifica que está leyendo `ALLOWED_ORIGINS` de las variables de entorno
3. Verifica que el backend se está redeployando correctamente

### Opción 3: Verificar el Dominio Exacto

Asegúrate de que el dominio en `ALLOWED_ORIGINS` coincide **exactamente** con el dominio de Vercel:

- ✅ `https://turnero-frontend.vercel.app` (con https://)
- ❌ `turnero-frontend.vercel.app` (sin https://)
- ❌ `http://turnero-frontend.vercel.app` (con http:// en lugar de https://)

---

## 📋 Checklist Completo

- [ ] Variable `ALLOWED_ORIGINS` agregada en Railway
- [ ] Valor incluye tu dominio de Vercel (con `https://`)
- [ ] Valor incluye `http://localhost:3000` para desarrollo local
- [ ] Backend redeployado después de agregar la variable
- [ ] CORS configurado en el código del backend (si tienes acceso)
- [ ] Verificado en Network tab que las requests son exitosas
- [ ] No hay más errores de CORS en la consola

---

## 💡 Nota sobre el Doble Slash

También noté que la URL tiene un doble slash: `//tenants`. Esto ya está corregido en el código del cliente API. Después del próximo deploy de Vercel, esto debería estar resuelto.

---

## 🎯 Próximos Pasos

1. **Agrega `ALLOWED_ORIGINS` en Railway** con tu dominio de Vercel
2. **Espera a que el backend se redeploye** (o hazlo manualmente)
3. **Prueba crear un turno** en el frontend
4. **Verifica que no hay más errores de CORS** en la consola

Si después de esto sigue fallando, comparte:
- Los logs del backend en Railway
- El valor exacto de `ALLOWED_ORIGINS` que configuraste
- Si tienes acceso al código del backend para verificar la configuración de CORS


