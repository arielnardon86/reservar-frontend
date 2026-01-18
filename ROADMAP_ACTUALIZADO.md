# 🗺️ Roadmap Actualizado - Turnero Web SaaS

**Última actualización:** Enero 2025

---

## ✅ Estado Actual - Completado

### Backend Core
- ✅ NestJS con TypeScript
- ✅ Prisma + PostgreSQL
- ✅ Multi-tenancy (Shared Database + Row-Level Security)
- ✅ Middleware, Guards, Interceptors de tenant

### Autenticación
- ✅ Magic link authentication (admin)
- ✅ JWT generation
- ✅ Token validation
- ✅ Protected routes

### Módulos Backend
- ✅ Tenants (CRUD completo)
- ✅ Services (ABM completo)
- ✅ Professionals (ABM completo)
- ✅ Schedules (global y por profesional)
- ✅ Appointments (CRUD + disponibilidad)
- ✅ Customers (registro automático)

### Notificaciones
- ✅ Resend integration
- ✅ Email de confirmación al cliente
- ✅ Email de cancelación
- ✅ Generación de archivos .ics (en email)
- ✅ Método `sendAppointmentReminder` (pendiente scheduler)

### Frontend Admin
- ✅ Landing page de venta
- ✅ Onboarding wizard (7 pasos)
- ✅ Dashboard con gestión de turnos
- ✅ Vista de turnos (diario/semanal)
- ✅ ABM de Servicios
- ✅ ABM de Profesionales
- ✅ Configuración de Horarios
- ✅ Personalización (logo, colores) con preview
- ✅ Sidebar navigation

### Frontend Cliente
- ✅ Landing page tenant-branded
- ✅ Flujo de reserva completo (5 pasos)
- ✅ Validación de disponibilidad
- ✅ Confirmación con .ics download

### Optimizaciones
- ✅ Prevención de duplicados (transacciones + validaciones)
- ✅ Filtrado de duplicados en UI
- ✅ Cálculo de ocupación diaria/semanal
- ✅ Slots libres para promoción

---

## 🎯 Próximos Pasos - Priorización

### Fase 2A: Recordatorios Automáticos (PRIORIDAD ALTA)

**Objetivo:** Enviar recordatorios automáticos 24h antes de cada turno.

**Tareas:**
1. **Setup BullMQ**
   - [ ] Instalar `@nestjs/bullmq` y `bullmq`
   - [ ] Configurar Redis (Upstash o Railway)
   - [ ] Crear módulo `JobsModule`
   - [ ] Configurar queue `appointment-reminders`

2. **Scheduler de Recordatorios**
   - [ ] Crear `ReminderScheduler` con `@Cron`
   - [ ] Job que se ejecute cada 6 horas
   - [ ] Buscar appointments 24h en el futuro
   - [ ] Crear jobs de recordatorio para cada uno
   - [ ] Evitar duplicados (verificar `reminderSentAt`)

3. **Processor de Recordatorios**
   - [ ] Crear `AppointmentReminderProcessor`
   - [ ] Usar `NotificationsService.sendAppointmentReminder`
   - [ ] Actualizar `reminderSentAt` en appointment
   - [ ] Retry logic (3 intentos con exponential backoff)

4. **Testing**
   - [ ] Test manual con appointment de prueba
   - [ ] Verificar que no se envían duplicados
   - [ ] Verificar retry en caso de fallo

**Tiempo estimado:** 4-5 horas

**Dependencias:**
- Redis (Upstash free tier o Railway)
- `NotificationsService` ya implementado

---

### Fase 2B: Dashboard de Métricas Completo (PRIORIDAD MEDIA)

**Objetivo:** Dashboard con KPIs reales y gráficos.

**Tareas Backend:**
1. **Endpoints de Métricas**
   - [ ] `GET /api/admin/metrics/overview` - KPIs generales
   - [ ] `GET /api/admin/metrics/revenue` - Facturación (diario/semanal/mensual)
   - [ ] `GET /api/admin/metrics/appointments` - Estadísticas de turnos
   - [ ] `GET /api/admin/metrics/services` - Servicios más utilizados
   - [ ] `GET /api/admin/metrics/professionals` - Profesionales más solicitados

2. **Cálculos de KPIs**
   - [ ] Total de turnos (mes actual)
   - [ ] Facturación total (mes actual)
   - [ ] Tasa de ocupación promedio
   - [ ] Tasa de cancelación
   - [ ] Nuevos clientes (mes actual)
   - [ ] Crecimiento mes a mes

**Tareas Frontend:**
1. **Componente MetricsDashboard**
   - [ ] Reemplazar mock data con API calls
   - [ ] Gráficos de línea (facturación mensual)
   - [ ] Gráficos de barras (servicios más usados)
   - [ ] Gráficos de dona (distribución de estados)
   - [ ] Cards con KPIs principales

**Tiempo estimado:** 5-6 horas

**Librerías sugeridas:**
- `recharts` o `chart.js` para gráficos

---

### Fase 2C: Reportes y Exportación (PRIORIDAD MEDIA)

**Objetivo:** Reportes descargables en CSV.

**Tareas Backend:**
1. **Módulo de Reportes**
   - [ ] `GET /api/admin/reports/appointments` - Reporte de turnos (filtros: fecha, profesional, estado)
   - [ ] `GET /api/admin/reports/revenue` - Reporte de facturación
   - [ ] `GET /api/admin/reports/customers` - Reporte de clientes
   - [ ] Generación de CSV en backend

**Tareas Frontend:**
1. **Vista de Reportes**
   - [ ] Filtros de fecha (rango personalizado)
   - [ ] Filtros por profesional/servicio
   - [ ] Botón "Exportar CSV"
   - [ ] Preview de datos antes de exportar

**Tiempo estimado:** 4-5 horas

---

### Fase 3: Funcionalidades Avanzadas (PRIORIDAD BAJA)

**Tareas:**
1. **Reagendamiento**
   - [ ] Cliente puede reagendar desde email
   - [ ] Admin puede reagendar desde dashboard
   - [ ] Validación de disponibilidad al reagendar

2. **Confirmación de Recordatorio**
   - [ ] Cliente confirma asistencia desde email
   - [ ] Actualizar estado del appointment

3. **Personalización Avanzada**
   - [ ] Tipografías personalizadas
   - [ ] Textos personalizables (mensajes, emails)
   - [ ] Páginas personalizadas (términos, privacidad)

4. **Integraciones**
   - [ ] WhatsApp notifications (Twilio)
   - [ ] SMS reminders
   - [ ] Google Calendar sync (bidireccional)

**Tiempo estimado:** 2-3 semanas

---

## 📊 Priorización Recomendada

### Esta Semana (Sprint 1)
1. ✅ **Recordatorios Automáticos** (Fase 2A)
   - Impacto: Alto (reduce no-shows)
   - Esfuerzo: Medio (4-5 horas)
   - Dependencias: Redis

### Próxima Semana (Sprint 2)
2. ✅ **Dashboard de Métricas** (Fase 2B)
   - Impacto: Medio (mejora experiencia admin)
   - Esfuerzo: Medio (5-6 horas)
   - Dependencias: Ninguna

### Semana 3 (Sprint 3)
3. ✅ **Reportes y Exportación** (Fase 2C)
   - Impacto: Medio (valor para admin)
   - Esfuerzo: Medio (4-5 horas)
   - Dependencias: Ninguna

---

## 🛠️ Stack Tecnológico Pendiente

### Para Recordatorios
- **BullMQ**: `@nestjs/bullmq`, `bullmq`
- **Redis**: Upstash (free tier) o Railway Redis
- **Cron**: `@nestjs/schedule` (ya incluido en NestJS)

### Para Métricas
- **Gráficos**: `recharts` (React) o `chart.js`
- **CSV**: `csv-writer` o `papaparse`

---

## 📝 Notas Importantes

1. **Redis para BullMQ:**
   - Upstash ofrece free tier (10,000 requests/día)
   - Railway Redis también tiene free tier
   - Necesario solo para producción (dev puede usar Redis local)

2. **Testing de Recordatorios:**
   - Crear appointment de prueba con fecha cercana
   - Verificar que el job se crea correctamente
   - Verificar que el email se envía

3. **Performance de Métricas:**
   - Considerar agregar índices adicionales si las queries son lentas
   - Cachear métricas si es necesario (Redis)

---

## 🎯 Objetivo Final

**MVP Completo:**
- Admin puede configurar turnero en < 10 min
- Cliente puede reservar turno en < 2 min
- Recordatorios automáticos reducen no-shows
- Dashboard profesional con métricas reales
- Reportes exportables para análisis

**Métricas de Éxito:**
- Tasa de no-show: < 15% (con recordatorios)
- Adopción admin: > 80% completa configuración
- Retención: > 80% después de 3 meses

---

**¿Empezamos con Recordatorios Automáticos?** 🚀


