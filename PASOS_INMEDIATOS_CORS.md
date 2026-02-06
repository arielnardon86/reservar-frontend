# 🚨 Pasos Inmediatos para Solucionar CORS

## ⚠️ Problema Actual

El error muestra claramente que el backend **NO está permitiendo requests desde tu dominio de Vercel**:

```
Access to fetch at 'https://turnero-backend-production.up.railway.app//tenants' 
from origin 'https://turnero-frontend.vercel.app' 
has been blocked by CORS policy
```

---

## ✅ Solución en 3 Pasos

### Paso 1: Configurar CORS en Railway (5 minutos)

1. **Abre Railway** → Tu proyecto `turnero-backend`

2. **Ve a "Variables"** (o Settings → Variables)

3. **Agrega esta variable:**
   ```
   Key: ALLOWED_ORIGINS
   Value: https://turnero-frontend.vercel.app,http://localhost:3000
   ```
   
   ⚠️ **IMPORTANTE:** Si tu dominio de Vercel es diferente, reemplázalo. Debería ser algo como:
   - `https://tu-proyecto.vercel.app`
   - O `https://www.tu-dominio.com` si tienes dominio personalizado

4. **Guarda** la variable

5. **Railway redeployará automáticamente** (o hazlo manualmente desde Deployments)

---

### Paso 2: Verificar que el Backend Tiene CORS Configurado

**Si tienes acceso al código del backend**, verifica que `src/main.ts` tenga esto:

```typescript
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

**Si NO tienes acceso al código del backend**, solo configura la variable `ALLOWED_ORIGINS` en Railway. Si el backend está bien configurado, debería leerla automáticamente.

---

### Paso 3: Redeploy del Frontend (para corregir doble slash)

El doble slash (`//tenants`) ya está corregido en el código, pero necesitas que Vercel redeploye:

1. **Opción A:** Espera al próximo push a GitHub (si tienes auto-deploy)
2. **Opción B:** Ve a Vercel → Deployments → Redeploy del último deployment

---

## 🔍 Verificar que Funciona

### 1. Verifica en Railway

- ✅ Variable `ALLOWED_ORIGINS` está configurada
- ✅ El servicio se redeployó después de agregar la variable
- ✅ El servicio está "Active" (verde)

### 2. Prueba el Backend Directamente

Abre en el navegador:
```
https://turnero-backend-production.up.railway.app
```

- Si responde algo (aunque sea 404) → ✅ Backend está vivo
- Si no responde → ❌ Backend no está funcionando

### 3. Prueba en el Frontend

1. Abre tu app en Vercel
2. Abre DevTools (F12) → Console
3. Intenta completar el onboarding
4. **Deberías ver:**
   - ✅ Requests exitosas (sin errores de CORS)
   - ✅ Status 200 o 201 en Network tab
   - ❌ NO más errores de "CORS policy"

---

## 🚨 Si Sigue Sin Funcionar

### Opción 1: Permitir Todos los Orígenes (Temporal)

**Solo para testing rápido**, cambia `ALLOWED_ORIGINS` en Railway a:
```
ALLOWED_ORIGINS=*
```

⚠️ **ADVERTENCIA:** Esto permite requests desde cualquier dominio. Solo para testing.

### Opción 2: Verificar el Dominio Exacto

Asegúrate de que el dominio en `ALLOWED_ORIGINS` coincide **exactamente**:

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Copia el dominio exacto (con `https://`)
4. Úsalo en `ALLOWED_ORIGINS`

### Opción 3: Verificar Logs del Backend

En Railway → Logs, busca:
- Errores al iniciar
- Mensajes sobre CORS
- Si está leyendo `ALLOWED_ORIGINS`

---

## 📋 Checklist Rápido

- [ ] Variable `ALLOWED_ORIGINS` agregada en Railway
- [ ] Valor incluye tu dominio de Vercel (con `https://`)
- [ ] Backend redeployado después de agregar la variable
- [ ] Backend está "Active" en Railway
- [ ] Puedes abrir el dominio del backend en el navegador
- [ ] Frontend redeployado (para corregir doble slash)
- [ ] No hay más errores de CORS en la consola

---

## 💡 Información que Necesito

Si después de seguir estos pasos sigue fallando, comparte:

1. **Screenshot de Variables en Railway** (para verificar `ALLOWED_ORIGINS`)
2. **Logs del backend en Railway** (últimas 50 líneas)
3. **¿Tienes acceso al código del backend?** (para verificar configuración de CORS)
4. **¿El backend se redeployó después de agregar la variable?**

---

## 🎯 Resumen

**El problema es 100% CORS.** El backend no está permitiendo requests desde Vercel.

**Solución:**
1. Agrega `ALLOWED_ORIGINS` en Railway con tu dominio de Vercel
2. Espera a que el backend se redeploye
3. Prueba de nuevo

Si el backend no está configurado para leer `ALLOWED_ORIGINS`, necesitarás modificar el código del backend para configurar CORS correctamente.

