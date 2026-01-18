# 🏗️ Arquitectura Técnica: Turnero Web SaaS

## 📋 Índice
1. [Arquitectura General](#arquitectura-general)
2. [Frontend: Next.js](#frontend-nextjs)
3. [Backend: NestJS](#backend-nestjs)
4. [Base de Datos: Prisma + PostgreSQL](#base-de-datos-prisma--postgresql)
5. [Modelo de Datos](#modelo-de-datos)
6. [Multi-Tenancy Strategy](#multi-tenancy-strategy)
7. [APIs y Endpoints](#apis-y-endpoints)
8. [Autenticación](#autenticación)
9. [Jobs y Notificaciones](#jobs-y-notificaciones)
10. [Deployment](#deployment)

---

## 🎯 Arquitectura General

### Visión General
```
┌─────────────────┐
│   Cliente       │
│   (Browser)     │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼─────────────────┐
│   Next.js (Frontend)     │
│   - Vercel               │
│   - SSR/SSG              │
│   - API Routes           │
└────────┬─────────────────┘
         │
         │ REST API
         │
┌────────▼─────────────────┐
│   NestJS (Backend)       │
│   - Railway/Render       │
│   - REST API             │
│   - GraphQL (opcional)   │
└────────┬─────────────────┘
         │
         │ Prisma ORM
         │
┌────────▼─────────────────┐
│   PostgreSQL             │
│   - Managed DB           │
│   - Migrations           │
└──────────────────────────┘
         │
┌────────▼─────────────────┐
│   Servicios Externos     │
│   - Resend (Emails)      │
│   - BullMQ (Jobs)        │
└──────────────────────────┘
```

---

## 🎨 Frontend: Next.js

### Estructura de Carpetas

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx              # Login admin (magic link)
│   └── callback/
│       └── page.tsx              # Callback auth
│
├── (public)/
│   ├── [tenantSlug]/             # Tenant-branded pages
│   │   ├── layout.tsx            # Layout con branding
│   │   ├── page.tsx              # Landing del negocio
│   │   ├── book/
│   │   │   ├── page.tsx          # Flujo de reserva
│   │   │   ├── service/
│   │   │   │   └── [serviceId]/
│   │   │   │       └── page.tsx  # Selección profesional
│   │   │   ├── professional/
│   │   │   │   └── [professionalId]/
│   │   │   │       └── page.tsx  # Selección fecha/hora
│   │   │   └── confirm/
│   │   │       └── page.tsx      # Confirmación
│   │   └── success/
│   │       └── [appointmentId]/
│   │           └── page.tsx      # Éxito
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      # NextAuth handlers
│       ├── appointments/
│       │   ├── route.ts          # GET/POST appointments
│       │   ├── [id]/
│       │   │   ├── route.ts      # GET/PUT/DELETE appointment
│       │   │   └── cancel/
│       │   │       └── route.ts  # Cancelar appointment
│       ├── availability/
│       │   └── route.ts          # GET disponibilidad
│       ├── tenants/
│       │   ├── route.ts          # GET tenants (public)
│       │   └── [slug]/
│       │       └── route.ts      # GET tenant por slug
│       ├── services/
│       │   └── route.ts          # GET servicios por tenant
│       ├── professionals/
│       │   └── route.ts          # GET profesionales por tenant
│       └── ics/
│           └── [appointmentId]/
│               └── route.ts      # Generar .ics file
│
├── (admin)/
│   ├── layout.tsx                # Layout admin (sidebar, header)
│   ├── page.tsx                  # Dashboard
│   ├── appointments/
│   │   ├── page.tsx              # Lista de turnos
│   │   └── [id]/
│   │       └── page.tsx          # Detalle de turno
│   ├── services/
│   │   ├── page.tsx              # ABM servicios
│   │   └── [id]/
│   │       └── page.tsx          # Editar servicio
│   ├── professionals/
│   │   ├── page.tsx              # ABM profesionales
│   │   └── [id]/
│   │       └── page.tsx          # Editar profesional
│   ├── schedule/
│   │   └── page.tsx              # Configurar horarios
│   ├── customers/
│   │   ├── page.tsx              # Base de clientes
│   │   └── [id]/
│   │       └── page.tsx          # Detalle cliente
│   ├── reports/
│   │   └── page.tsx              # Reportes y dashboards
│   └── settings/
│       ├── page.tsx              # Configuración general
│       ├── branding/
│       │   └── page.tsx          # Personalización visual
│       └── team/
│           └── page.tsx          # Gestión de admins
│
├── api/
│   └── ...                      # API Routes (proxies a NestJS)
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── calendar.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── public/                  # Componentes públicos
│   │   ├── ServiceCard.tsx      # Card de servicio
│   │   ├── ProfessionalCard.tsx # Card de profesional
│   │   ├── AppointmentForm.tsx  # Formulario de reserva
│   │   ├── BookingFlow.tsx      # Flujo completo
│   │   ├── AvailabilityCalendar.tsx # Calendario de disponibilidad
│   │   └── AppointmentSummary.tsx # Resumen de turno
│   │
│   ├── admin/                   # Componentes admin
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── DashboardCards.tsx
│   │   ├── AppointmentsTable.tsx
│   │   ├── AppointmentsCalendar.tsx
│   │   ├── ServiceForm.tsx
│   │   ├── ProfessionalForm.tsx
│   │   ├── ScheduleConfigurator.tsx
│   │   ├── ReportCharts.tsx
│   │   └── ...
│   │
│   ├── shared/                  # Componentes compartidos
│   │   ├── Logo.tsx             # Logo del tenant
│   │   ├── ThemeProvider.tsx    # Theme provider con CSS variables
│   │   └── LoadingSpinner.tsx
│   │
│   └── layouts/
│       ├── PublicLayout.tsx     # Layout público (tenant-branded)
│       └── AdminLayout.tsx      # Layout admin
│
├── lib/
│   ├── api/                     # Clientes API
│   │   ├── client.ts            # Axios/fetch config
│   │   ├── appointments.ts      # Endpoints de appointments
│   │   ├── services.ts          # Endpoints de services
│   │   ├── professionals.ts     # Endpoints de professionals
│   │   ├── tenants.ts           # Endpoints de tenants
│   │   └── availability.ts      # Endpoints de availability
│   │
│   ├── auth/
│   │   └── config.ts            # NextAuth config
│   │
│   ├── utils/
│   │   ├── date.ts              # Utilidades de fechas
│   │   ├── validation.ts        # Validaciones
│   │   └── formatters.ts        # Formatters
│   │
│   └── hooks/
│       ├── useTenant.ts         # Hook para tenant data
│       ├── useAvailability.ts   # Hook para disponibilidad
│       └── useAppointments.ts   # Hook para appointments
│
├── styles/
│   ├── globals.css              # Estilos globales
│   └── variables.css            # CSS variables para theming
│
├── types/
│   ├── appointment.ts           # Types de appointments
│   ├── service.ts               # Types de services
│   ├── professional.ts          # Types de professionals
│   ├── tenant.ts                # Types de tenant
│   └── api.ts                   # Types de API responses
│
├── middleware.ts                # Middleware para tenant routing
├── layout.tsx                   # Root layout
└── page.tsx                     # Home (redirect a /admin o tenant)

```

### Tecnologías Frontend

**Core:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui

**State Management:**
- React Query (TanStack Query) para server state
- Zustand o Context API para client state (si necesario)

**Forms:**
- React Hook Form
- Zod para validación

**Date/Time:**
- date-fns o Day.js
- react-day-picker (shadcn/ui calendar)

---

## ⚙️ Backend: NestJS

### Estructura de Módulos

```
src/
├── main.ts                      # Entry point
├── app.module.ts                # Root module
│
├── common/                      # Módulo común
│   ├── decorators/
│   │   ├── tenant.decorator.ts  # @TenantId decorator
│   │   └── roles.decorator.ts   # @Roles decorator
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── auth.guard.ts        # JWT guard
│   │   ├── tenant.guard.ts      # Tenant validation
│   │   └── roles.guard.ts       # Role-based access
│   ├── interceptors/
│   │   └── tenant.interceptor.ts # Inject tenant_id
│   ├── middleware/
│   │   └── tenant.middleware.ts  # Extract tenant from request
│   └── pipes/
│       └── validation.pipe.ts
│
├── auth/                        # Módulo de autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts       # POST /auth/login, /auth/callback
│   ├── auth.service.ts          # Login, token generation
│   ├── strategies/
│   │   └── magic-link.strategy.ts
│   └── dto/
│       ├── login.dto.ts
│       └── callback.dto.ts
│
├── tenants/                     # Módulo de tenants
│   ├── tenants.module.ts
│   ├── tenants.controller.ts    # CRUD tenants
│   ├── tenants.service.ts       # Lógica de negocio
│   ├── entities/
│   │   └── tenant.entity.ts     # Prisma entity
│   └── dto/
│       ├── create-tenant.dto.ts
│       ├── update-tenant.dto.ts
│       └── tenant-branding.dto.ts
│
├── services/                    # Módulo de servicios
│   ├── services.module.ts
│   ├── services.controller.ts   # CRUD servicios
│   ├── services.service.ts      # Lógica de negocio
│   ├── entities/
│   │   └── service.entity.ts
│   └── dto/
│       ├── create-service.dto.ts
│       └── update-service.dto.ts
│
├── professionals/               # Módulo de profesionales
│   ├── professionals.module.ts
│   ├── professionals.controller.ts # CRUD profesionales
│   ├── professionals.service.ts # Lógica de negocio
│   ├── entities/
│   │   └── professional.entity.ts
│   └── dto/
│       ├── create-professional.dto.ts
│       └── update-professional.dto.ts
│
├── appointments/                # Módulo de turnos
│   ├── appointments.module.ts
│   ├── appointments.controller.ts # CRUD appointments
│   ├── appointments.service.ts  # Lógica de negocio + validación
│   ├── entities/
│   │   └── appointment.entity.ts
│   ├── dto/
│   │   ├── create-appointment.dto.ts
│   │   ├── update-appointment.dto.ts
│   │   ├── cancel-appointment.dto.ts
│   │   └── availability-query.dto.ts
│   └── utils/
│       └── availability-calculator.ts # Calcular disponibilidad
│
├── schedules/                   # Módulo de horarios
│   ├── schedules.module.ts
│   ├── schedules.controller.ts  # CRUD schedules
│   ├── schedules.service.ts     # Lógica de horarios
│   ├── entities/
│   │   └── schedule.entity.ts
│   └── dto/
│       ├── create-schedule.dto.ts
│       └── update-schedule.dto.ts
│
├── customers/                   # Módulo de clientes
│   ├── customers.module.ts
│   ├── customers.controller.ts  # CRUD customers
│   ├── customers.service.ts     # Lógica de clientes
│   ├── entities/
│   │   └── customer.entity.ts
│   └── dto/
│       └── create-customer.dto.ts
│
├── notifications/               # Módulo de notificaciones
│   ├── notifications.module.ts
│   ├── notifications.service.ts # Envío de emails
│   ├── templates/
│   │   ├── appointment-confirmation.hbs
│   │   ├── appointment-reminder.hbs
│   │   └── appointment-cancellation.hbs
│   └── providers/
│       └── resend.provider.ts   # Resend integration
│
├── jobs/                        # Módulo de jobs programados
│   ├── jobs.module.ts
│   ├── jobs.controller.ts       # Trigger manual (opcional)
│   ├── jobs.service.ts          # Configuración de jobs
│   ├── processors/
│   │   └── appointment-reminder.processor.ts # BullMQ processor
│   └── schedulers/
│       └── reminder.scheduler.ts # Cron jobs
│
├── reports/                     # Módulo de reportes
│   ├── reports.module.ts
│   ├── reports.controller.ts    # GET /reports/*
│   ├── reports.service.ts       # Lógica de reportes
│   └── dto/
│       ├── appointments-report.dto.ts
│       ├── revenue-report.dto.ts
│       └── occupancy-report.dto.ts
│
├── calendar/                    # Módulo de calendarios (.ics)
│   ├── calendar.module.ts
│   ├── calendar.controller.ts   # GET /calendar/:id/appointment.ics
│   ├── calendar.service.ts      # Generación de .ics
│   └── utils/
│       └── ics-generator.ts     # ics.js library
│
└── prisma/
    ├── prisma.service.ts        # Prisma client singleton
    └── prisma.module.ts         # Prisma module
```

### Tecnologías Backend

**Core:**
- NestJS 10+
- TypeScript
- Prisma ORM
- PostgreSQL

**Validation:**
- class-validator
- class-transformer

**Authentication:**
- @nestjs/jwt
- @nestjs/passport
- passport-jwt (opcional, si usamos JWT)

**Jobs:**
- @nestjs/bullmq (BullMQ)
- BullMQ

**Email:**
- Resend SDK
- Handlebars (templates)

**Calendar:**
- ics (npm package)

---

## 🗄️ Base de Datos: Prisma + PostgreSQL

### Estrategia de Multi-Tenancy

**Opción Elegida: Shared Database, Row-Level Security**

- Una sola base de datos para todos los tenants
- Columna `tenant_id` en todas las tablas críticas
- Middleware/interceptor en NestJS para filtrar por tenant_id
- Índices en `tenant_id` para performance

**Ventajas:**
- ✅ Costo eficiente
- ✅ Fácil de mantener
- ✅ Migrations simples
- ✅ Backup centralizado

**Desventajas:**
- ⚠️ Requiere validación estricta (middleware, guards)
- ⚠️ Riesgo de filtrado accidental (mitigado con tests)

---

## 📊 Modelo de Datos

Ver archivo separado: `PRISMA_SCHEMA.md`

---

## 🔐 Multi-Tenancy Strategy

### Middleware de Tenant

```typescript
// src/common/middleware/tenant.middleware.ts
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Extraer tenant_id de:
    // 1. Subdomain (tenant1.turnero.com)
    // 2. Path (/tenant1/...)
    // 3. Header (X-Tenant-Id)
    // 4. JWT token (si admin)
    
    const tenantId = this.extractTenantId(req);
    req['tenantId'] = tenantId;
    next();
  }
}
```

### Interceptor de Tenant

```typescript
// src/common/interceptors/tenant.interceptor.ts
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId;
    
    // Inyectar tenantId en Prisma queries
    // Filtrar automáticamente por tenant_id
    return next.handle();
  }
}
```

### Guard de Tenant

```typescript
// src/common/guards/tenant.guard.ts
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Validar que tenant_id existe y es válido
    return !!request.tenantId;
  }
}
```

---

## 🔌 APIs y Endpoints

### API Pública (Sin Autenticación)

```
GET  /api/tenants/:slug              # Info del tenant (branding)
GET  /api/tenants/:slug/services     # Servicios disponibles
GET  /api/tenants/:slug/professionals # Profesionales
GET  /api/availability               # Disponibilidad (query params)
POST /api/appointments               # Crear appointment (cliente)
GET  /api/appointments/:id           # Ver appointment
PUT  /api/appointments/:id/cancel    # Cancelar appointment
GET  /api/calendar/:id/appointment.ics # Descargar .ics
```

### API Admin (Con Autenticación)

```
# Auth
POST /api/auth/login                 # Enviar magic link
GET  /api/auth/callback              # Callback del magic link

# Tenants
GET  /api/admin/tenants              # Info del tenant del admin
PUT  /api/admin/tenants              # Actualizar tenant (branding)

# Services
GET    /api/admin/services           # Listar servicios
POST   /api/admin/services           # Crear servicio
GET    /api/admin/services/:id       # Obtener servicio
PUT    /api/admin/services/:id       # Actualizar servicio
DELETE /api/admin/services/:id       # Eliminar servicio

# Professionals
GET    /api/admin/professionals
POST   /api/admin/professionals
GET    /api/admin/professionals/:id
PUT    /api/admin/professionals/:id
DELETE /api/admin/professionals/:id

# Schedules
GET  /api/admin/schedules            # Horarios globales
PUT  /api/admin/schedules            # Actualizar horarios
GET  /api/admin/professionals/:id/schedules # Horarios por profesional
PUT  /api/admin/professionals/:id/schedules

# Appointments
GET    /api/admin/appointments       # Listar appointments
POST   /api/admin/appointments       # Crear manual
GET    /api/admin/appointments/:id   # Obtener appointment
PUT    /api/admin/appointments/:id   # Actualizar appointment
DELETE /api/admin/appointments/:id   # Cancelar appointment

# Customers
GET  /api/admin/customers            # Listar clientes
GET  /api/admin/customers/:id        # Detalle cliente

# Reports
GET  /api/admin/reports/appointments # Reporte de turnos
GET  /api/admin/reports/revenue      # Reporte de facturación
GET  /api/admin/reports/occupancy    # Reporte de ocupación
```

---

## 🔑 Autenticación

### Flujo Magic Link (Admin)

1. Admin ingresa email en `/login`
2. Frontend → `POST /api/auth/login` con email
3. Backend genera token temporal (15 min)
4. Backend envía email con link: `/auth/callback?token=xxx`
5. Admin hace click en link
6. Frontend → `GET /api/auth/callback?token=xxx`
7. Backend valida token y genera JWT
8. Frontend guarda JWT en cookie/httpOnly
9. Todas las requests incluyen JWT en header

### Implementación

```typescript
// Auth Service
@Injectable()
export class AuthService {
  async sendMagicLink(email: string) {
    const token = this.generateTempToken();
    await this.saveTokenToDB(email, token);
    await this.emailService.sendMagicLink(email, token);
  }

  async verifyMagicLink(token: string) {
    const tokenData = await this.validateToken(token);
    const jwt = this.generateJWT(tokenData.userId, tokenData.tenantId);
    return jwt;
  }
}
```

---

## 📧 Jobs y Notificaciones

### BullMQ Configuration

```typescript
// Jobs Module
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'appointment-reminders',
    }),
  ],
})
```

### Reminder Job

```typescript
// Appointment Reminder Processor
@Processor('appointment-reminders')
export class AppointmentReminderProcessor {
  @Process('send-reminder')
  async handleReminder(job: Job) {
    const appointment = job.data;
    await this.notificationsService.sendReminder(appointment);
  }
}
```

### Scheduler

```typescript
// Cron para crear jobs de recordatorios
@Cron('0 */6 * * *') // Cada 6 horas
async scheduleReminders() {
  // Buscar appointments 24h en el futuro
  // Crear jobs de recordatorio
  await this.jobsService.scheduleReminders();
}
```

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.turnero.com"
  }
}
```

### Backend (Railway/Render/Fly.io)

**Railway:**
- Dockerfile o Node.js directo
- Variables de entorno: DATABASE_URL, JWT_SECRET, etc.

**Render:**
- Build command: `npm run build`
- Start command: `npm run start:prod`

### Database (PostgreSQL Managed)

**Opciones:**
- Supabase
- Railway PostgreSQL
- Render PostgreSQL
- Neon

### Redis (BullMQ)

**Opciones:**
- Upstash (serverless Redis)
- Railway Redis
- Render Redis

---

## 📝 Variables de Entorno

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.turnero.com
NEXT_PUBLIC_APP_URL=https://turnero.com
NEXTAUTH_URL=https://turnero.com
NEXTAUTH_SECRET=xxx
```

### Backend (.env)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=xxx
JWT_EXPIRATION=7d
MAGIC_LINK_EXPIRATION=15m

RESEND_API_KEY=xxx
RESEND_FROM_EMAIL=noreply@turnero.com

REDIS_HOST=xxx
REDIS_PORT=6379

NODE_ENV=production
PORT=3000
```

---

**Fin del Documento de Arquitectura Técnica**



