# 📅 Turnero Web SaaS

Sistema profesional de gestión de turnos online, multi-tenant, escalable y altamente configurable.

---

## 🎯 Visión del Producto

**Turnero Web** es una plataforma SaaS **B2B** que permite a negocios de cualquier rubro (salud, estética, servicios, profesionales) gestionar sus turnos online con total flexibilidad y personalización.

### 🎯 Cliente Principal: Administrador del Negocio

**El admin es nuestro cliente:**
- ✅ Quien paga la suscripción
- ✅ Quien toma la decisión de compra
- ✅ Quien necesita ver valor inmediato
- ✅ Quien requiere onboarding excepcional
- ✅ Quien necesita herramientas profesionales

**El cliente final (reservador) es importante porque:**
- Su experiencia impacta la retención del admin
- Si la UX es mala → admin cancela suscripción
- Si la UX es buena → admin renueva y recomienda

### Características Principales

- 🌐 **Multi-tenant**: Soporte para múltiples empresas en una sola plataforma
- 🎨 **Personalización**: Logo, colores y tipografías por empresa
- 📱 **Responsive**: Mobile-first con experiencia optimizada para desktop
- 🔐 **Seguro**: Autenticación sin passwords (magic link)
- 📧 **Notificaciones**: Emails automáticos y recordatorios
- 📊 **Analytics**: Dashboards y reportes completos
- 🗓️ **Calendarios**: Integración con Google, Outlook y Apple Calendar

---

## 📚 Documentación

### Documentos Principales

1. **[PRODUCT_DEFINITION.md](./PRODUCT_DEFINITION.md)**
   - User Personas
   - User Journeys
   - Arquitectura del Producto
   - Diseño UX
   - Priorización MVP

2. **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)**
   - Arquitectura general
   - Estructura Frontend (Next.js)
   - Estructura Backend (NestJS)
   - APIs y Endpoints
   - Deployment

3. **[PRISMA_SCHEMA.md](./PRISMA_SCHEMA.md)**
   - Modelo de datos completo
   - Schema Prisma
   - Relaciones e índices

4. **[QUICK_START.md](./QUICK_START.md)**
   - Guía rápida de setup
   - Comandos esenciales
   - Primeros pasos

5. **[BUSINESS_MODEL.md](./BUSINESS_MODEL.md)**
   - Modelo de negocio B2B
   - Pricing y estrategia de ventas
   - Métricas de negocio (KPIs)
   - Go-to-Market strategy

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14+** (App Router)
- **React 18+** con TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **CSS Variables** para theming

### Backend
- **NestJS 10+** con TypeScript
- **Prisma ORM** + **PostgreSQL**
- **BullMQ** para jobs programados
- **Resend** para emails

### Infraestructura
- **Frontend**: Vercel
- **Backend**: Railway / Render / Fly.io
- **Database**: PostgreSQL Managed
- **Redis**: Upstash / Railway Redis

---

## 🚀 MVP (Minimum Viable Product) - Admin-First

### ⚠️ Enfoque: Admin es el Cliente Principal

El MVP está priorizado para que el **admin** (quien paga) pueda:
1. Configurar su turnero en < 10 minutos
2. Ver valor inmediato (su turnero funcionando)
3. Recibir su primera reserva rápidamente
4. Gestionar todo desde un dashboard profesional

### Fase 1: Admin Core + Onboarding (Semanas 1-3) - PRIORIDAD MÁXIMA

#### Backend
- ✅ Multi-tenancy básico
- ✅ Autenticación magic link (admin)
- ✅ ABM de Servicios
- ✅ ABM de Profesionales
- ✅ Configuración de Horarios (global)
- ✅ CRUD de Appointments
- ✅ Emails de confirmación básicos
- ✅ Base de Clientes (registro automático)

#### Frontend Admin (PRIORIDAD)
- ✅ Landing page de venta (para captar admins)
- ✅ Onboarding guiado paso a paso (< 10 min)
- ✅ Dashboard admin profesional
- ✅ ABM de Servicios (admin)
- ✅ ABM de Profesionales (admin)
- ✅ Configuración de Horarios (admin)
- ✅ Vista de Turnos (admin)
- ✅ Personalización básica (logo, colores) con preview

#### Frontend Cliente (Importante pero no bloqueante)
- ✅ Landing page tenant-branded
- ✅ Flujo de reserva completo (paso a paso)

### Fase 2: Optimización (Semanas 5-8)
- 📅 Calendario visual en frontend
- 📧 Generación de archivos .ics
- 🔔 Recordatorios programados (24h antes)
- 📊 Dashboard con KPIs básicos
- ⚙️ Horarios por profesional

### Fase 3: Reportes (Semanas 9-12)
- 📈 Reportes de facturación
- 📊 Reportes por profesional
- 📉 Reportes de servicios más utilizados
- 📤 Exportación a CSV

---

## 📋 Funcionalidades Cliente

### Flujo de Reserva

1. **Landing** → Ver información del negocio
2. **Selección de Servicio** → Lista de servicios disponibles
3. **Selección de Profesional** → (Si hay múltiples)
4. **Calendario de Disponibilidad** → Ver y seleccionar fecha/hora
5. **Datos Personales** → Nombre, apellido, email
6. **Confirmación** → Resumen del turno
7. **Éxito** → Confirmación y opción de agregar a calendario

### Funcionalidades Post-Reserva

- 📧 Email de confirmación con detalles
- 📅 Descarga de archivo .ics
- 🔔 Recordatorio 24h antes (configurable)
- ❌ Cancelación del turno (si está permitido)

---

## 📋 Funcionalidades Admin

### Gestión

- **Servicios**: ABM completo (nombre, duración, precio)
- **Profesionales**: ABM completo (nombre, foto, especialidad)
- **Horarios**: Configuración global y por profesional
- **Turnos**: Vista, creación manual, cancelación, reagendamiento
- **Clientes**: Base de clientes con historial

### Configuración

- **Branding**: Logo, colores, tipografías
- **Horarios**: Días y horarios de apertura/cierre
- **Notificaciones**: Configuración de emails y recordatorios

### Reportes

- Turnos (diario/semanal/mensual/rango)
- Facturación global y por profesional
- Servicios más utilizados
- Profesionales más solicitados
- Usuarios nuevos y recurrencia
- Turnos cancelados vs confirmados

---

## 🏗️ Arquitectura Multi-Tenant

### Estrategia: Shared Database, Row-Level Security

- Una base de datos para todos los tenants
- Columna `tenant_id` en todas las tablas críticas
- Middleware/interceptor en NestJS para filtrar automáticamente
- Índices en `tenant_id` para performance

### Ventajas

- ✅ Costo eficiente
- ✅ Fácil de mantener
- ✅ Migrations simples
- ✅ Backup centralizado

### Mitigaciones

- Middleware global de validación
- Guards estrictos en todos los endpoints
- Tests automatizados de aislamiento

---

## 🔐 Autenticación

### Magic Link (Admin)

1. Admin ingresa email
2. Sistema envía email con link temporal (15 min)
3. Click en link → genera JWT
4. JWT se guarda en cookie httpOnly
5. Todas las requests incluyen JWT en header

### Cliente (Público)

- No requiere login para reservar
- Se crea automáticamente en base de clientes
- Email único por tenant

---

## 📊 Modelo de Datos Clave

### Entidades Principales

- **Tenant**: Empresas/negocios
- **User**: Administradores del tenant
- **Service**: Servicios ofrecidos
- **Professional**: Profesionales
- **Schedule**: Horarios de disponibilidad
- **Customer**: Clientes
- **Appointment**: Turnos/reservas

Ver [PRISMA_SCHEMA.md](./PRISMA_SCHEMA.md) para detalles completos.

---

## 🚦 Roadmap

### ✅ Sprint 1-2: Setup y Multi-Tenancy
- Setup de proyectos (Next.js + NestJS)
- Configuración de Prisma + PostgreSQL
- Sistema multi-tenant básico
- Autenticación magic link

### ✅ Sprint 3-4: Core Admin
- ABM de Servicios
- ABM de Profesionales
- Configuración de Horarios

### ✅ Sprint 5-6: Reserva Cliente
- Landing page tenant-branded
- Flujo de reserva completo
- Validación de disponibilidad

### ✅ Sprint 7-8: Gestión y Emails
- Vista de turnos admin
- Cancelación y creación manual
- Emails de confirmación

### ✅ Sprint 9-10: Polish y Testing
- UX improvements
- Testing end-to-end
- Bug fixing
- Preparación para producción

---

## 📝 Próximos Pasos

1. **Setup Inicial**
   ```bash
   # Crear repositorios (monorepo o separados)
   # Setup de Next.js
   # Setup de NestJS
   # Setup de Prisma
   ```

2. **Database**
   ```bash
   # Crear PostgreSQL (local o cloud)
   # Ejecutar migrations
   # Seed inicial de datos
   ```

3. **Desarrollo**
   ```bash
   # Implementar multi-tenancy
   # Implementar autenticación
   # Implementar módulos MVP
   ```

Ver [QUICK_START.md](./QUICK_START.md) para guía detallada.

---

## 🔍 Métricas de Éxito

### KPIs Producto

- **Tasa de Conversión Cliente**: >70% (inicio → confirmación)
- **Tiempo de Reserva**: <2 minutos promedio
- **Adopción Admin**: 80% completa configuración inicial
- **Retención Tenants**: >80% después de 3 meses
- **No-Show Rate**: <15% con recordatorios

---

## ⚠️ Consideraciones y Riesgos

### Técnicos

1. **Multi-Tenancy**: Filtrado accidental de datos
   - **Mitigación**: Middleware global, tests automatizados

2. **Race Conditions**: 2 clientes reservan mismo slot
   - **Mitigación**: Locks en BD, transacciones

3. **Performance**: Queries lentas con crecimiento
   - **Mitigación**: Índices, paginación, caching

### Negocio

1. **Adopción Admin**: Configuración percibida como compleja
   - **Mitigación**: Onboarding guiado, videos tutoriales

2. **Experiencia Cliente**: Abandono en flujo de reserva
   - **Mitigación**: Analytics, A/B testing, simplificar pasos

---

## 📞 Soporte y Contribución

Este es un proyecto en desarrollo. Para contribuir:

1. Revisar documentación completa
2. Seguir las guías de arquitectura
3. Respetar los principios de multi-tenancy
4. Testing antes de commits

---

## 📄 Licencia

[Definir licencia según corresponda]

---

**Desarrollado con ❤️ para negocios que buscan simplificar la gestión de turnos**

