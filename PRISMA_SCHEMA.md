# 📊 Modelo de Datos: Prisma Schema

## Schema Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// TENANT (Multi-tenancy)
// ============================================

model Tenant {
  id          String   @id @default(uuid())
  slug        String   @unique // URL slug (ej: "dr-mendoza")
  name        String   // Nombre del negocio
  email       String   // Email de contacto
  phone       String?  // Teléfono opcional
  
  // Branding
  logoUrl     String?  // URL del logo
  primaryColor String  @default("#3b82f6") // Color primario
  secondaryColor String? // Color secundario
  fontFamily   String?  // Tipografía (opcional)
  
  // Configuración
  timezone    String   @default("America/Argentina/Buenos_Aires")
  locale      String   @default("es-AR")
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  users       User[]
  services    Service[]
  professionals Professional[]
  schedules   Schedule[]
  appointments Appointment[]
  customers   Customer[]
  
  @@index([slug])
  @@map("tenants")
}

// ============================================
// USERS (Administradores)
// ============================================

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String?
  
  // Tenant relation
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Auth
  emailVerified DateTime?
  magicLinkToken String?  @db.Text
  magicLinkExpires DateTime?
  
  // Roles (si hay múltiples roles por tenant)
  role        String   @default("admin") // admin, manager, etc.
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastLoginAt DateTime?
  
  @@index([tenantId])
  @@index([email])
  @@map("users")
}

// ============================================
// SERVICES (Servicios ofrecidos)
// ============================================

model Service {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  name        String   // Nombre del servicio
  description String?  @db.Text
  duration    Int      // Duración en minutos (30, 45, 60, etc.)
  price       Decimal? @db.Decimal(10, 2) // Precio opcional
  
  // Estado
  isActive    Boolean  @default(true)
  
  // Relación con profesionales
  professionals ProfessionalService[]
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([tenantId])
  @@index([tenantId, isActive])
  @@map("services")
}

// ============================================
// PROFESSIONALS (Profesionales)
// ============================================

model Professional {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  firstName   String
  lastName    String
  fullName    String   // Calculado o almacenado
  email       String?
  phone       String?
  photoUrl    String?  // URL de foto
  bio         String?  @db.Text // Descripción/especialidad
  
  // Estado
  isActive    Boolean  @default(true)
  
  // Relación con servicios
  services    ProfessionalService[]
  
  // Horarios específicos del profesional
  schedules   Schedule[]
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([tenantId])
  @@index([tenantId, isActive])
  @@map("professionals")
}

// ============================================
// PROFESSIONAL-SERVICE (Many-to-Many)
// ============================================

model ProfessionalService {
  id             String   @id @default(uuid())
  professionalId String
  serviceId      String
  
  professional   Professional @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  service        Service      @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime @default(now())
  
  @@unique([professionalId, serviceId])
  @@index([professionalId])
  @@index([serviceId])
  @@map("professional_services")
}

// ============================================
// SCHEDULES (Horarios)
// ============================================

model Schedule {
  id             String   @id @default(uuid())
  tenantId       String?
  tenant         Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  professionalId String?  // Si es null, es horario global del tenant
  professional   Professional? @relation(fields: [professionalId], references: [id], onDelete: Cascade)
  
  dayOfWeek      Int      // 0-6 (Domingo-Sábado)
  startTime      String   // "09:00" (HH:mm format)
  endTime        String   // "18:00" (HH:mm format)
  
  // Pausas (almuerzo, descanso) - JSON opcional
  breaks         Json?    // [{start: "13:00", end: "14:00"}]
  
  // Excepciones (feriados, cierres)
  isException    Boolean  @default(false) // Si es true, este día está cerrado
  exceptionDate  DateTime? // Para días específicos (no recurrentes)
  
  // Metadata
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([tenantId])
  @@index([professionalId])
  @@index([tenantId, dayOfWeek])
  @@map("schedules")
}

// ============================================
// CUSTOMERS (Clientes)
// ============================================

model Customer {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  firstName   String
  lastName    String
  email       String   // Email único por tenant (no globalmente)
  phone       String?
  
  // Metadata adicional (opcional)
  notes       String?  @db.Text
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  appointments Appointment[]
  
  @@unique([tenantId, email]) // Email único por tenant
  @@index([tenantId])
  @@index([tenantId, email])
  @@map("customers")
}

// ============================================
// APPOINTMENTS (Turnos)
// ============================================

model Appointment {
  id             String   @id @default(uuid())
  tenantId       String
  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Cliente
  customerId     String
  customer       Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  // Servicio y profesional
  serviceId      String
  service        Service  @relation(fields: [serviceId], references: [id])
  
  professionalId String
  professional   Professional @relation(fields: [professionalId], references: [id])
  
  // Fecha y hora
  startTime      DateTime // Inicio del turno
  endTime        DateTime // Fin calculado (startTime + service.duration)
  
  // Estado
  status         AppointmentStatus @default(PENDING)
  
  // Confirmación
  isConfirmed    Boolean  @default(false)
  confirmedAt    DateTime?
  
  // Cancelación
  cancelledAt    DateTime?
  cancellationReason String? @db.Text
  cancelledBy   String?   // "customer" | "admin" | "system"
  
  // Notificaciones
  reminderSentAt DateTime?
  confirmationSentAt DateTime?
  
  // Metadata
  notes          String?  @db.Text // Notas internas del admin
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([tenantId])
  @@index([tenantId, startTime])
  @@index([tenantId, status])
  @@index([tenantId, professionalId, startTime])
  @@index([customerId])
  @@index([startTime]) // Para queries de disponibilidad
  @@map("appointments")
}

enum AppointmentStatus {
  PENDING    // Pendiente de confirmación
  CONFIRMED  // Confirmado
  CANCELLED  // Cancelado
  COMPLETED  // Completado
  NO_SHOW    // No asistió
}

// ============================================
// APPOINTMENT_HISTORY (Historial de cambios)
// ============================================

model AppointmentHistory {
  id             String   @id @default(uuid())
  appointmentId  String
  
  // Cambio realizado
  action         String   // "created", "updated", "confirmed", "cancelled", etc.
  previousStatus AppointmentStatus?
  newStatus      AppointmentStatus?
  changes        Json?    // Cambios en JSON
  
  // Metadata
  changedBy      String?  // "customer" | "admin" | userId
  createdAt      DateTime @default(now())
  
  @@index([appointmentId])
  @@index([createdAt])
  @@map("appointment_history")
}

// ============================================
// MAGIC_LINK_TOKENS (Tokens temporales)
// ============================================

model MagicLinkToken {
  id         String   @id @default(uuid())
  email      String
  token      String   @unique
  expiresAt  DateTime
  used       Boolean  @default(false)
  createdAt  DateTime @default(now())
  
  @@index([token])
  @@index([email, expiresAt])
  @@map("magic_link_tokens")
}
```

---

## Índices Importantes

### Performance

1. **Tenant Isolation:**
   - `tenantId` en todas las tablas críticas
   - Índices compuestos: `[tenantId, ...]` para queries filtradas

2. **Availability Queries:**
   - `appointments.startTime` para búsquedas de disponibilidad
   - `[tenantId, professionalId, startTime]` para queries específicas

3. **Customer Lookup:**
   - `[tenantId, email]` único para búsquedas rápidas

4. **Reporting:**
   - `[tenantId, startTime]` para reportes por fecha
   - `[tenantId, status]` para filtros por estado

---

## Relaciones Clave

### One-to-Many
- `Tenant` → `User[]`
- `Tenant` → `Service[]`
- `Tenant` → `Professional[]`
- `Tenant` → `Appointment[]`
- `Tenant` → `Customer[]`
- `Customer` → `Appointment[]`
- `Service` → `Appointment[]` (directa, pero mejor por relación)
- `Professional` → `Appointment[]`

### Many-to-Many
- `Professional` ↔ `Service` (vía `ProfessionalService`)

### Optional Relations
- `Schedule` puede ser global (`tenantId`) o por profesional (`professionalId`)

---

## Migrations Strategy

### Initial Migration
```bash
npx prisma migrate dev --name init
```

### Future Migrations
```bash
# Desarrollo
npx prisma migrate dev --name add_new_feature

# Producción
npx prisma migrate deploy
```

---

## Seeds (Opcional)

### seed.ts
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear tenant de ejemplo
  const tenant = await prisma.tenant.create({
    data: {
      slug: 'demo-clinic',
      name: 'Clínica Demo',
      email: 'demo@example.com',
      primaryColor: '#3b82f6',
    },
  });

  // Crear admin
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin Demo',
      tenantId: tenant.id,
    },
  });

  // Crear servicio
  const service = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: 'Consulta General',
      duration: 30,
      price: 500,
    },
  });

  // Crear profesional
  const professional = await prisma.professional.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Dr. Carlos',
      lastName: 'Mendoza',
      fullName: 'Dr. Carlos Mendoza',
      email: 'carlos@example.com',
    },
  });

  // Asignar servicio a profesional
  await prisma.professionalService.create({
    data: {
      professionalId: professional.id,
      serviceId: service.id,
    },
  });

  // Crear horarios globales
  const days = [1, 2, 3, 4, 5]; // Lunes a Viernes
  for (const day of days) {
    await prisma.schedule.create({
      data: {
        tenantId: tenant.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
      },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

**Fin del Documento de Schema Prisma**



