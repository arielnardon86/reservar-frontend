# 🔧 Configuración de CORS en el Backend (NestJS)

## 📝 Código para agregar en `src/main.ts`

Si tienes acceso al código del backend, agrega esta configuración de CORS:

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
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
```

## 🔑 Variables de Entorno en Railway

Después de agregar el código, configura en Railway:

**Variable:**
```
ALLOWED_ORIGINS=https://turnero-frontend.vercel.app,http://localhost:3000
```

⚠️ **Reemplaza** `turnero-frontend.vercel.app` con tu dominio real de Vercel.

## 📋 Pasos Completos

1. **Modifica `src/main.ts`** en el backend con el código de arriba
2. **Agrega `ALLOWED_ORIGINS` en Railway** con tu dominio de Vercel
3. **Commit y push** los cambios del backend
4. **Redeploy el backend** en Railway
5. **Prueba** crear un tenant desde el frontend

## ✅ Verificación

Después del deploy, deberías ver en los logs del backend:
```
CORS enabled for origins: https://turnero-frontend.vercel.app,http://localhost:3000
```

Y en el frontend, las requests deberían funcionar sin errores de CORS.

