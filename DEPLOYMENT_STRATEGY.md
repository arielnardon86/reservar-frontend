# 🚀 Estrategia de Deployment a Producción

## 🎯 Página Principal: `/landing`

**La página principal es `/landing`** - Landing de venta para captar nuevos administradores.

### Flujo de Usuario en Producción

```
1. Usuario llega a tu dominio (ej: turnero.com)
   ↓
2. Redirige automáticamente a /landing
   ↓
3. Ve beneficios, pricing, CTA "Comenzar gratis"
   ↓
4. Click → /onboarding
   ↓
5. Completa configuración (7 pasos, ~10 min)
   ↓
6. Redirige a /admin/dashboard
   ↓
7. Obtiene link para compartir: turnero.com/[su-slug]
   ↓
8. Comparte link con clientes
   ↓
9. Clientes reservan en: turnero.com/[su-slug]/book
```

---

## 📍 Estructura de Rutas en Producción

### Rutas Públicas (Sin Autenticación)

| Ruta | Propósito | Público |
|------|-----------|---------|
| `/` | Home (redirige a `/landing`) | ✅ Todos |
| `/landing` | **PÁGINA PRINCIPAL** - Landing de venta | ✅ Todos |
| `/onboarding` | Wizard de configuración inicial | ✅ Nuevos admins |
| `/[tenantSlug]` | Landing pública del negocio | ✅ Clientes |
| `/[tenantSlug]/book` | Flujo de reserva de turnos | ✅ Clientes |
| `/book` | Flujo de reserva (fallback) | ✅ Clientes |

### Rutas Protegidas (Requieren Autenticación)

| Ruta | Propósito | Requiere |
|------|-----------|----------|
| `/admin/dashboard` | Dashboard del admin | ✅ Auth |
| `/login` | Login con magic link | ❌ (público) |
| `/auth/callback` | Callback de magic link | ❌ (público) |

---

## 🎯 Priorización de Deployment

### Fase 1: MVP Mínimo para Producción (CRÍTICO)

**Objetivo:** Poder recibir el primer cliente (admin) y que pueda configurar su turnero.

#### Backend (NestJS)
- ✅ **Multi-tenancy** funcionando
- ✅ **Autenticación** magic link
- ✅ **CRUD básico** (Tenants, Services, Professionals, Schedules, Appointments)
- ✅ **Emails** de confirmación
- ✅ **Cálculo de disponibilidad**

#### Frontend (Next.js)
- ✅ **`/landing`** - Landing de venta (PÁGINA PRINCIPAL)
- ✅ **`/onboarding`** - Wizard de configuración
- ✅ **`/admin/dashboard`** - Dashboard admin
- ✅ **`/[tenantSlug]/book`** - Flujo de reserva cliente

#### Infraestructura
- [ ] **Frontend**: Vercel (Next.js)
- [ ] **Backend**: Railway / Render / Fly.io
- [ ] **Database**: Supabase PostgreSQL (o Railway PostgreSQL)
- [ ] **Emails**: Resend (API key configurada)
- [ ] **Domain**: Dominio personalizado (ej: turnero.com)

**Tiempo estimado:** 2-3 horas de configuración

---

### Fase 2: Optimizaciones Pre-Lanzamiento

**Antes de lanzar públicamente, asegurar:**

1. **Variables de Entorno**
   - [ ] `NEXT_PUBLIC_API_URL` → URL del backend en producción
   - [ ] `DATABASE_URL` → Connection string de PostgreSQL
   - [ ] `RESEND_API_KEY` → API key de Resend
   - [ ] `JWT_SECRET` → Secret para JWT
   - [ ] `MAGIC_LINK_SECRET` → Secret para magic links

2. **Configuración de Dominio**
   - [ ] Dominio principal configurado (ej: `turnero.com`)
   - [ ] SSL/HTTPS habilitado
   - [ ] CORS configurado en backend (solo tu dominio)

3. **Testing Básico**
   - [ ] Flujo completo: Landing → Onboarding → Dashboard → Reserva
   - [ ] Emails funcionando (confirmación, magic link)
   - [ ] Multi-tenancy funcionando (crear 2 tenants, verificar aislamiento)

4. **Monitoreo Básico**
   - [ ] Logs configurados (Vercel logs, Railway logs)
   - [ ] Error tracking (opcional: Sentry)

---

## 🏗️ Plan de Deployment Paso a Paso

### Paso 1: Backend (NestJS)

**Opción A: Railway (Recomendado - Más fácil)**

```bash
# 1. Crear cuenta en Railway
# 2. Conectar repositorio de GitHub
# 3. Railway detecta NestJS automáticamente
# 4. Configurar variables de entorno:
#    - DATABASE_URL (Railway PostgreSQL o Supabase)
#    - RESEND_API_KEY
#    - JWT_SECRET
#    - MAGIC_LINK_SECRET
# 5. Deploy automático
```

**Opción B: Render**

```bash
# 1. Crear cuenta en Render
# 2. New Web Service → Conectar repositorio
# 3. Build Command: npm install && npm run build
# 4. Start Command: npm run start:prod
# 5. Configurar variables de entorno
```

**Opción C: Fly.io**

```bash
# 1. Instalar flyctl
# 2. fly launch
# 3. Configurar fly.toml
# 4. fly deploy
```

### Paso 2: Base de Datos (PostgreSQL)

**Opción A: Supabase (Recomendado - Free tier generoso)**

```bash
# 1. Crear proyecto en Supabase
# 2. Obtener connection string
# 3. Ejecutar migrations:
#    cd turnero-backend
#    npx prisma migrate deploy
# 4. (Opcional) Seed inicial
```

**Opción B: Railway PostgreSQL**

```bash
# 1. Crear PostgreSQL service en Railway
# 2. Obtener DATABASE_URL automáticamente
# 3. Ejecutar migrations
```

### Paso 3: Frontend (Next.js)

**Vercel (Recomendado - Optimizado para Next.js)**

```bash
# 1. Crear cuenta en Vercel
# 2. Importar repositorio de GitHub
# 3. Vercel detecta Next.js automáticamente
# 4. Configurar variables de entorno:
#    - NEXT_PUBLIC_API_URL → https://tu-backend.railway.app
# 5. Deploy automático
```

### Paso 4: Configuración de Dominio

```bash
# 1. Comprar dominio (ej: turnero.com)
# 2. En Vercel: Settings → Domains → Agregar dominio
# 3. Configurar DNS según instrucciones de Vercel
# 4. Esperar propagación DNS (puede tardar horas)
```

---

## 🔐 Variables de Entorno Necesarias

### Frontend (.env.production)

```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
```

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# JWT
JWT_SECRET=tu-secret-super-seguro-aqui
MAGIC_LINK_SECRET=otro-secret-super-seguro

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx

# CORS (opcional, si necesitas restringir)
ALLOWED_ORIGINS=https://turnero.com,https://www.turnero.com

# Port (Railway/Render lo configuran automáticamente)
PORT=3001
```

---

## ✅ Checklist Pre-Deployment

### Backend
- [ ] Todas las variables de entorno configuradas
- [ ] Migrations ejecutadas en producción
- [ ] CORS configurado (si es necesario)
- [ ] Logs funcionando
- [ ] Health check endpoint (`/health`)

### Frontend
- [ ] `NEXT_PUBLIC_API_URL` apunta al backend de producción
- [ ] Build sin errores (`npm run build`)
- [ ] Todas las rutas funcionando
- [ ] Imágenes optimizadas (si hay)

### Testing
- [ ] Flujo completo probado en staging/producción
- [ ] Emails funcionando
- [ ] Multi-tenancy funcionando
- [ ] No hay errores en consola

### Seguridad
- [ ] Secrets no están en el código
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Rate limiting (opcional, pero recomendado)

---

## 🚀 Comandos de Deployment

### Backend (Primera vez)

```bash
cd turnero-backend

# 1. Ejecutar migrations en producción
npx prisma migrate deploy

# 2. (Opcional) Generar Prisma Client
npx prisma generate

# 3. Build
npm run build

# 4. Deploy (depende de la plataforma)
# Railway: automático con git push
# Render: automático con git push
# Fly.io: fly deploy
```

### Frontend (Primera vez)

```bash
cd "Appointment app"

# 1. Build local para verificar
npm run build

# 2. Deploy (Vercel)
# - Conectar repositorio en Vercel
# - Deploy automático con git push
```

---

## 📊 Monitoreo Post-Deployment

### Métricas a Monitorear

1. **Uptime**: ¿El servicio está disponible?
2. **Response Time**: ¿Las requests son rápidas?
3. **Error Rate**: ¿Hay errores frecuentes?
4. **Database Connections**: ¿Hay problemas de conexión?

### Herramientas Sugeridas

- **Vercel Analytics**: Para frontend (incluido)
- **Railway Metrics**: Para backend (incluido)
- **Sentry**: Para error tracking (opcional)
- **Uptime Robot**: Para monitoreo de uptime (opcional)

---

## 🎯 Estrategia de Lanzamiento

### Fase 1: Soft Launch (Beta Privada)
- Invitar 5-10 admins de prueba
- Recibir feedback
- Corregir bugs críticos
- Validar flujo completo

### Fase 2: Lanzamiento Público
- Abrir `/landing` públicamente
- Marketing básico (redes sociales, SEO)
- Monitorear métricas de adopción
- Soporte activo

### Fase 3: Escalamiento
- Optimizar basado en feedback
- Agregar funcionalidades solicitadas
- Mejorar onboarding
- Expandir marketing

---

## 💡 Recomendaciones Finales

1. **Empezar Simple**: Deploy solo lo esencial (MVP)
2. **Monitorear Activamente**: Primera semana crítica
3. **Tener Rollback Plan**: Saber cómo volver atrás si algo falla
4. **Documentar Todo**: Variables, procesos, decisiones
5. **Testing Continuo**: Probar en staging antes de producción

---

## 🆘 Troubleshooting Común

### Backend no responde
- Verificar que el servicio está corriendo
- Verificar variables de entorno
- Verificar logs de errores

### Frontend no conecta con backend
- Verificar `NEXT_PUBLIC_API_URL`
- Verificar CORS en backend
- Verificar que el backend está accesible

### Emails no se envían
- Verificar `RESEND_API_KEY`
- Verificar logs de Resend
- Verificar que el email no está en spam

### Database connection errors
- Verificar `DATABASE_URL`
- Verificar que la IP está permitida (si aplica)
- Verificar que las migrations están ejecutadas

---

**¿Listo para deployar? Empecemos con el backend en Railway y el frontend en Vercel.** 🚀


