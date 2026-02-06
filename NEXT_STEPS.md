# 🚀 Próximos Pasos - Plan de Desarrollo

## ✅ Estado Actual

- ✅ Frontend Next.js completo
- ✅ Componentes Admin migrados
- ✅ Componentes Cliente migrados
- ✅ Onboarding Wizard
- ✅ Landing pages
- ✅ Mock data funcionando

---

## 🎯 Fase 1: Backend Core (Prioridad ALTA)

### 1.1 Setup Backend NestJS

**Objetivo:** Crear la estructura base del backend

- [ ] Crear proyecto NestJS
- [ ] Configurar TypeScript
- [ ] Setup de Prisma
- [ ] Configurar variables de entorno
- [ ] Estructura de módulos básica

**Tiempo estimado:** 2-3 horas

---

### 1.2 Base de Datos (Prisma + PostgreSQL)

**Objetivo:** Implementar el modelo de datos completo

- [ ] Crear schema Prisma (basado en PRISMA_SCHEMA.md)
- [ ] Configurar PostgreSQL (local o cloud)
- [ ] Ejecutar migrations iniciales
- [ ] Crear seeds básicos
- [ ] Verificar modelo de datos

**Tiempo estimado:** 2-3 horas

**Opciones de PostgreSQL:**
- Local: `brew install postgresql` o Docker
- Cloud: Supabase (gratis), Railway, Render

---

### 1.3 Multi-Tenancy Core

**Objetivo:** Implementar aislamiento de datos por tenant

- [ ] Middleware de tenant (extraer tenant_id)
- [ ] Guard de tenant (validar tenant)
- [ ] Interceptor de tenant (inyectar en queries)
- [ ] Tests de aislamiento
- [ ] Validación en todos los endpoints

**Tiempo estimado:** 3-4 horas

**Crítico:** Sin esto, no podemos tener múltiples clientes.

---

## 🎯 Fase 2: Módulos Backend (Prioridad ALTA)

### 2.1 Módulo de Tenants

**Objetivo:** CRUD de tenants y configuración

- [ ] Controller de tenants
- [ ] Service de tenants
- [ ] DTOs (create, update, branding)
- [ ] Endpoints:
  - `GET /api/tenants/:slug` (público)
  - `PUT /api/admin/tenants` (admin)
- [ ] Validaciones

**Tiempo estimado:** 2-3 horas

---

### 2.2 Módulo de Servicios

**Objetivo:** ABM de servicios

- [ ] Controller de services
- [ ] Service de services
- [ ] DTOs
- [ ] Endpoints:
  - `GET /api/tenants/:slug/services` (público)
  - `GET/POST/PUT/DELETE /api/admin/services` (admin)
- [ ] Validaciones

**Tiempo estimado:** 2 horas

---

### 2.3 Módulo de Profesionales

**Objetivo:** ABM de profesionales

- [ ] Controller de professionals
- [ ] Service de professionals
- [ ] DTOs
- [ ] Relación many-to-many con servicios
- [ ] Endpoints completos

**Tiempo estimado:** 2-3 horas

---

### 2.4 Módulo de Horarios (Schedules)

**Objetivo:** Configuración de horarios

- [ ] Controller de schedules
- [ ] Service de schedules
- [ ] Lógica de horarios globales y por profesional
- [ ] Validaciones de horarios

**Tiempo estimado:** 3-4 horas

---

### 2.5 Módulo de Appointments (CRÍTICO)

**Objetivo:** Gestión de turnos

- [ ] Controller de appointments
- [ ] Service de appointments
- [ ] Cálculo de disponibilidad
- [ ] Validación de race conditions
- [ ] Endpoints:
  - `GET /api/availability` (público)
  - `POST /api/appointments` (público - crear turno)
  - `GET/PUT/DELETE /api/admin/appointments` (admin)

**Tiempo estimado:** 4-5 horas

**Crítico:** Este es el corazón del sistema.

---

### 2.6 Módulo de Customers

**Objetivo:** Base de clientes

- [ ] Controller de customers
- [ ] Service de customers
- [ ] Registro automático al reservar
- [ ] Endpoints admin

**Tiempo estimado:** 1-2 horas

---

## 🎯 Fase 3: Autenticación (Prioridad ALTA)

### 3.1 Magic Link Authentication

**Objetivo:** Autenticación sin passwords para admins

- [ ] Setup de NextAuth o implementación custom
- [ ] Generación de tokens temporales
- [ ] Envío de emails con magic link
- [ ] Validación de tokens
- [ ] Generación de JWT
- [ ] Guards de autenticación

**Tiempo estimado:** 3-4 horas

**Dependencias:**
- Resend o SendGrid para emails
- JWT para tokens

---

## 🎯 Fase 4: Integración Frontend-Backend

### 4.1 API Routes en Next.js

**Objetivo:** Conectar frontend con backend

- [ ] Crear API routes (proxies a NestJS)
- [ ] Configurar cliente HTTP (fetch/axios)
- [ ] Hooks de React Query
- [ ] Manejo de errores
- [ ] Loading states

**Tiempo estimado:** 3-4 horas

---

### 4.2 Reemplazar Mock Data

**Objetivo:** Usar datos reales del backend

- [ ] Reemplazar en componentes Admin
- [ ] Reemplazar en componentes Cliente
- [ ] Manejo de estados vacíos
- [ ] Optimistic updates

**Tiempo estimado:** 2-3 horas

---

## 🎯 Fase 5: Emails y Notificaciones

### 5.1 Emails Básicos

**Objetivo:** Envío de emails de confirmación

- [ ] Setup de Resend o SendGrid
- [ ] Templates de emails
- [ ] Email de confirmación al cliente
- [ ] Email de notificación al admin
- [ ] Testing de emails

**Tiempo estimado:** 2-3 horas

---

### 5.2 Jobs Programados (Recordatorios)

**Objetivo:** Recordatorios automáticos

- [ ] Setup de BullMQ o cron
- [ ] Jobs de recordatorios (24h antes)
- [ ] Scheduler de jobs
- [ ] Retry logic

**Tiempo estimado:** 3-4 horas

---

## 🎯 Fase 6: Funcionalidades Avanzadas

### 6.1 Generación de .ics

**Objetivo:** Archivos de calendario

- [ ] Generación de archivos .ics
- [ ] Endpoint para descargar
- [ ] Compatibilidad Google/Outlook/Apple

**Tiempo estimado:** 1-2 horas

---

### 6.2 Reportes y Dashboard

**Objetivo:** Analytics para admin

- [ ] Endpoints de reportes
- [ ] Cálculos de KPIs
- [ ] Exportación a CSV
- [ ] Gráficos en frontend

**Tiempo estimado:** 4-5 horas

---

## 📊 Priorización Recomendada

### MVP (Semanas 1-2)

1. **Backend Core** (Fase 1)
2. **Módulos Básicos** (Fase 2.1-2.5)
3. **Autenticación** (Fase 3)
4. **Integración** (Fase 4)
5. **Emails Básicos** (Fase 5.1)

**Objetivo:** Admin puede configurar y cliente puede reservar turnos.

---

### Post-MVP (Semanas 3-4)

6. **Recordatorios** (Fase 5.2)
7. **.ics Files** (Fase 6.1)
8. **Reportes** (Fase 6.2)

---

## 🛠️ Stack Tecnológico Backend

- **Framework:** NestJS 10+
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT + Magic Links
- **Emails:** Resend o SendGrid
- **Jobs:** BullMQ o cron
- **Validation:** class-validator

---

## 🚀 Recomendación: Empezar con Backend Core

**Siguiente paso inmediato:**

1. Crear proyecto NestJS
2. Setup de Prisma + PostgreSQL
3. Implementar multi-tenancy básico

¿Quieres que empecemos con esto ahora?


