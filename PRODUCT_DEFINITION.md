# 🎯 Definición del Producto: Turnero Web SaaS

## 📋 Índice
1. [User Personas](#user-personas)
2. [User Journeys](#user-journeys)
3. [Arquitectura del Producto](#arquitectura-del-producto)
4. [Arquitectura Técnica](#arquitectura-técnica)
5. [Diseño UX](#diseño-ux)
6. [Priorización MVP](#priorización-mvp)
7. [Riesgos y Consideraciones](#riesgos-y-consideraciones)

---

## 👥 User Personas

### 🎯 Persona Principal: Administrador del Negocio (CLIENTE B2B)

**Nombre:** Dr. Carlos Mendoza  
**Edad:** 45 años  
**Perfil:** Profesional independiente o dueño de clínica/centro de servicios  
**Rol:** **CLIENTE PRINCIPAL - QUIEN PAGA Y USA EL PRODUCTO**

**Características:**
- Maneja personal y agenda múltiple
- Nivel técnico medio (usa email, WhatsApp, Excel)
- Prioriza eficiencia operativa y control
- Necesita visibilidad de su negocio (KPIs)
- Trabaja con múltiples profesionales/servicios
- **Busca soluciones que ahorren tiempo y dinero**
- **Toma decisiones de compra basadas en ROI**
- **Necesita ver valor inmediato**

**Objetivos (como comprador/usuario):**
- **Evaluar el producto rápidamente** (time-to-value)
- Gestionar servicios y profesionales fácilmente
- Configurar horarios sin complicaciones
- Ver reportes de facturación y ocupación
- Tener control total sobre turnos y cancelaciones
- Mantener base de clientes organizada
- **Reducir llamadas telefónicas** (ahorro de tiempo)
- **Aumentar ocupación** (más ingresos)
- **Profesionalizar la imagen** del negocio
- **Automatizar procesos** administrativos

**Frustraciones (como comprador/usuario):**
- Sistemas complejos que requieren capacitación extensa
- Falta de flexibilidad en configuración
- No poder ver el estado del negocio de un vistazo
- Perder información de clientes
- Doble carga administrativa
- **Onboarding confuso o largo**
- **No ver resultados rápidamente**
- **Sistemas que no se adaptan a su negocio**
- **Falta de soporte o documentación**

**Contexto de uso:**
- 80% Desktop (gestión diaria, reportes, configuración)
- 20% Mobile (consultas rápidas, notificaciones, emergencias)

**Momento de compra:**
- Busca solución porque está saturado de llamadas
- Quiere profesionalizar su negocio
- Necesita automatizar procesos
- Competencia ya tiene sistema online

**Criterios de decisión:**
1. **Facilidad de uso** (no quiere aprender algo complejo)
2. **Time-to-value** (ver resultados en < 1 semana)
3. **Precio justo** (ROI claro)
4. **Personalización** (que se vea como su marca)
5. **Soporte** (que haya ayuda disponible)

---

### Persona Secundaria: Cliente Final (Usuario del servicio)

**Nombre:** María González  
**Edad:** 32 años  
**Perfil:** Cliente que reserva turnos a través del sistema del admin  
**Rol:** **USUARIO FINAL - NO PAGA, PERO SU EXPERIENCIA IMPACTA LA RETENCIÓN DEL ADMIN**

**Características:**
- Usa smartphone a diario, nivel técnico medio-alto
- Valora su tiempo, busca procesos rápidos (< 2 min)
- Prefiere reservar fuera del horario laboral (7am-9am, 7pm-10pm)
- Necesita confirmación inmediata y recordatorios
- Le importa la confiabilidad y seguridad de sus datos

**Objetivos:**
- Reservar turnos de forma rápida y sencilla
- Ver disponibilidad en tiempo real
- Recibir confirmación y recordatorios
- Cancelar o reagendar fácilmente si es necesario
- Acceder a información del profesional/servicio

**Frustraciones:**
- Sistemas lentos o complicados
- Falta de disponibilidad visible
- No recibir confirmación inmediata
- Perder tiempo llamando o esperando respuesta
- Olvidarse del turno

**Contexto de uso:**
- 60% Mobile (mientras viaja, en descansos)
- 40% Desktop (en casa, planificando la semana)

**Impacto en el negocio:**
- Si la experiencia es mala → admin pierde clientes → admin cancela suscripción
- Si la experiencia es buena → admin retiene clientes → admin renueva suscripción

---

## 🗺️ User Journeys

### Journey 1: Cliente - Reserva de Turno (Happy Path)

**Canal:** Mobile Web  
**Duración objetivo:** < 2 minutos  
**Momento:** 20:30 hs, desde su casa

1. **Awareness (0:00-0:10s)**
   - Cliente recibe link por WhatsApp/Email o busca en Google
   - Llega a landing del negocio (multi-tenant, branded)
   - Ve logo, colores personalizados del negocio
   - **Expectativa:** "Esto se ve profesional y confiable"

2. **Selección de Servicio (0:10-0:30s)**
   - Lista de servicios visible, con duración y precio
   - Filtros opcionales (si hay muchos servicios)
   - Selecciona "Consulta Médica General" ($500, 30 min)
   - **Expectativa:** Información clara, sin ambigüedades

3. **Selección de Profesional (0:30-0:45s)**
   - Ve profesionales disponibles para ese servicio
   - Si es solo uno, puede saltarse este paso
   - Selecciona "Dr. Carlos Mendoza"
   - **Expectativa:** Opción clara o skip inteligente

4. **Visualización de Disponibilidad (0:45-1:15s)**
   - Calendario mensual con días disponibles destacados
   - Click en día → muestra horarios disponibles (slots)
   - Slots en tiempo real, solo muestra disponibles
   - Selecciona "Jueves 15, 10:00 AM"
   - **Expectativa:** Ver solo lo disponible, sin clicks innecesarios

5. **Datos Personales (1:15-1:45s)**
   - Formulario mínimo: Nombre, Apellido, Email
   - Validación en tiempo real
   - Si ya es cliente (email existe), pre-llena datos
   - **Expectativa:** Proceso rápido, sin campos innecesarios

6. **Confirmación (1:45-2:00s)**
   - Resumen visual claro:
     - ✅ Servicio
     - ✅ Profesional
     - ✅ Fecha y hora
     - ✅ Ubicación (dirección/mapa)
   - Botón "Confirmar Turno"
   - **Expectativa:** Ver todo antes de confirmar

7. **Post-Confirmación (2:00s+)**
   - Pantalla de éxito con resumen
   - Botón "Agregar a mi calendario" (.ics)
   - Mensaje: "Recibirás un email de confirmación"
   - Opción de compartir o ver detalles
   - **Expectativa:** Confirmación inmediata, acciones claras

8. **Email de Confirmación (inmediato)**
   - Email con todos los detalles
   - Archivo .ics adjunto o link de descarga
   - Recordatorio configurable: "Confirma o cancela antes del 14/03"

9. **Recordatorio Pre-Turno (configurado)**
   - 24-48h antes: Email de recordatorio
   - Botón "Confirmo mi asistencia" / "Cancelar"
   - Link directo a gestión del turno

**Puntos de fricción a evitar:**
- ❌ Demasiados pasos
- ❌ Información faltante en cada paso
- ❌ Selección de horarios ocupados
- ❌ Formularios extensos
- ❌ Falta de confirmación inmediata

---

### Journey 2: Admin - Venta y Onboarding (CRÍTICO - CONVERSIÓN)

**Canal:** Desktop Web  
**Duración objetivo:** < 10 minutos para ver valor  
**Momento:** Desde landing page hasta primera reserva recibida

#### Fase 1: Landing y Registro (0:00-2:00)

1. **Landing Page (0:00-0:30)**
   - Hero: "Gestiona tus turnos online en minutos"
   - Beneficios claros:
     - ✅ Reduce llamadas telefónicas
     - ✅ Aumenta ocupación
     - ✅ Profesionaliza tu negocio
   - CTA: "Comenzar gratis" / "Probar ahora"
   - Social proof: "Usado por X negocios"
   - **Expectativa:** Ver valor inmediato, no solo features

2. **Registro Inicial (0:30-1:00)**
   - Formulario mínimo: Email, Nombre, Nombre del negocio
   - Checkbox: "Acepto términos y condiciones"
   - Botón: "Crear mi cuenta gratis"
   - **Expectativa:** Sin fricción, proceso rápido

3. **Magic Link (1:00-2:00)**
   - Email automático con link
   - Click → Login automático
   - Redirección a onboarding
   - **Expectativa:** Sin passwords, sin complicaciones

#### Fase 2: Onboarding Guiado (2:00-8:00) - CRÍTICO

**Objetivo:** Time-to-value < 10 minutos. Admin debe ver su turnero funcionando.

1. **Bienvenida y Contexto (2:00-2:30)**
   - Mensaje: "En 5 minutos tendrás tu turnero funcionando"
   - Progress bar: "Paso 1 de 4"
   - **Expectativa:** Transparencia, saber cuánto falta

2. **Configuración Básica (2:30-4:00)**
   - Paso 1: Nombre del negocio (ya lo tiene, pre-llenado)
   - Paso 2: Logo (upload o "Saltar por ahora")
   - Paso 3: Colores primarios (picker visual con preview)
   - Vista previa en tiempo real del turnero
   - **Expectativa:** Ver resultado inmediato, no solo configurar

3. **Primer Servicio (4:00-5:30)**
   - "Agrega tu primer servicio"
   - Formulario simple: Nombre, Duración (15/30/45/60), Precio (opcional)
   - Preview: "Así se verá para tus clientes"
   - Botón: "Agregar y continuar"
   - **Expectativa:** Proceso guiado, no abrumador

4. **Primer Profesional (5:30-6:30)**
   - "Agrega un profesional" (o "Soy yo mismo")
   - Formulario: Nombre, Foto (opcional)
   - Asignar servicios que puede ofrecer
   - **Expectativa:** Flexibilidad, no obligatorio todo

5. **Horarios (6:30-7:30)**
   - Vista de semana visual
   - Click para activar/desactivar horarios
   - "Horario sugerido: Lunes a Viernes 9-18hs" (pre-llenado)
   - Botón: "Usar horario sugerido" o "Personalizar"
   - **Expectativa:** Valores por defecto inteligentes

6. **¡Listo! Ver tu Turnero (7:30-8:00)**
   - Mensaje de éxito: "¡Tu turnero está listo!"
   - Link personalizado destacado: `turnero.com/tu-negocio`
   - Botón grande: "Ver mi turnero" (abre en nueva pestaña)
   - Botón secundario: "Ir al dashboard"
   - **Expectativa:** Ver el resultado final inmediatamente

#### Fase 3: Primera Vista del Dashboard (8:00-10:00)

1. **Dashboard Vacío pero Funcional (8:00-9:00)**
   - Mensaje: "Tu turnero está activo. Comparte el link con tus clientes"
   - Card destacado: Link para compartir (copiar con 1 click)
   - Preview del turnero público
   - **Expectativa:** Ver que funciona, no solo configuración

2. **Acciones Sugeridas (9:00-10:00)**
   - "Próximos pasos:"
     - ✅ Agregar más servicios
     - ✅ Configurar recordatorios
     - ✅ Personalizar emails
   - Tutorial interactivo (opcional, puede cerrarse)
   - **Expectativa:** Guía sin ser intrusiva

**Puntos críticos de conversión:**
- ✅ Ver el turnero funcionando en < 10 minutos
- ✅ Link para compartir visible y fácil de copiar
- ✅ Preview en tiempo real durante configuración
- ✅ Valores por defecto inteligentes (no empezar de cero)
- ✅ Opción de "Saltar" pasos opcionales
- ✅ No abrumar con opciones avanzadas

**Métricas de éxito:**
- Tasa de completación onboarding: >80%
- Tiempo promedio: < 10 minutos
- Tasa de primera reserva recibida: >60% en primera semana

---

### Journey 3: Admin - Configuración Avanzada (Post-Onboarding)

**Canal:** Desktop Web  
**Duración:** Según necesidad  
**Momento:** Cuando admin quiere personalizar más

2. **Configuración de Horarios (2:00-5:00)**
   - Vista de semana con slots por hora
   - Click para activar/desactivar horarios
   - Configuración global o por día
   - Guardar y continuar
   - **Expectativa:** Interface visual, intuitiva

3. **Creación de Primer Servicio (5:00-8:00)**
   - Formulario:
     - Nombre
     - Duración (selector visual: 15/30/45/60 min o custom)
     - Precio (opcional para mostrar)
     - Descripción (opcional)
   - Preview de cómo se verá en el frontend
   - **Expectativa:** Ver resultado inmediato

4. **Creación de Profesional (8:00-11:00)**
   - Formulario:
     - Nombre completo
     - Foto (opcional)
     - Especialidad/servicios asignados
     - Horarios (si difiere del global)
   - **Expectativa:** Asignación clara de servicios

5. **Personalización Visual (11:00-15:00)**
   - Upload de logo
   - Selector de colores (paleta sugerida)
   - Vista previa en tiempo real
   - Guardar y ver mi turnero
   - **Expectativa:** Personalización sin CSS/HTML

6. **Primera Vista del Dashboard (15:00+)**
   - Dashboard vacío pero funcional
   - Call-to-action: "Comparte tu link de turnos"
   - Link personalizado: `miturnero.com/mi-negocio`
   - **Expectativa:** Ver el resultado final inmediatamente

**Puntos de fricción a evitar:**
- ❌ Onboarding extenso
- ❌ Configuración técnica complicada
- ❌ Falta de vista previa
- ❌ No poder probar antes de publicar

---

### Journey 4: Admin - Gestión Diaria

**Canal:** Desktop Web  
**Frecuencia:** Diaria  
**Duración:** 5-10 minutos

1. **Login Rápido**
   - Magic Link por email (sin password)
   - O sesión persistente (30 días)

2. **Dashboard Matutino (2 min)**
   - Vista del día: Turnos confirmados hoy
   - Alertas: Turnos sin confirmar
   - Resumen rápido: Ingresos estimados, ocupación

3. **Gestión de Turnos (3-5 min)**
   - Lista de turnos del día/semana
   - Acciones rápidas:
     - Ver detalles
     - Cancelar (con motivo)
     - Reagendar
     - Marcar como completado
   - Filtros: Por profesional, estado, fecha

4. **Reportes Semanales (1 vez/semana, 5 min)**
   - Acceso a dashboard de reportes
   - Vista de: Facturación, ocupación, servicios más pedidos
   - Exportar a CSV (opcional)

5. **Configuración Ocasional (cuando necesario)**
   - Agregar nuevo servicio (2 min)
   - Modificar horarios (1 min)
   - Agregar profesional (3 min)

**Puntos clave:**
- ✅ Acceso rápido (sin fricción)
- ✅ Vista clara de lo importante
- ✅ Acciones rápidas (1-2 clicks)
- ✅ No abrumar con información

---

## 🏗️ Arquitectura del Producto

### Módulo 1: Autenticación y Multi-Tenancy
**Features:**
- Autenticación por magic link (Email)
- Sistema multi-tenant (tenant_id en todas las tablas críticas)
- Configuración por tenant (branding, horarios globales)
- Gestión de usuarios admin por tenant

**Objetivo técnico:**
- Aislamiento total de datos entre tenants
- Personalización visual por tenant
- Escalabilidad horizontal

---

### Módulo 2: Gestión de Servicios
**Features:**
- ABM de servicios
  - Nombre, descripción, duración, precio
  - Activo/inactivo
  - Categorías (opcional para MVP)
- Asignación de servicios a profesionales
- Preview de cómo se ve en frontend

**Objetivo de negocio:**
- Flexibilidad para distintos rubros
- Actualización rápida de oferta

---

### Módulo 3: Gestión de Profesionales
**Features:**
- ABM de profesionales
  - Nombre, foto, descripción/especialidad
  - Estado (activo/inactivo)
- Horarios por profesional (sobreescribe global)
- Asignación de servicios que puede ofrecer
- Vista de disponibilidad individual

**Objetivo de negocio:**
- Soporte para múltiples profesionales
- Personalización de horarios por persona

---

### Módulo 4: Configuración de Horarios
**Features:**
- Horarios globales del negocio (día/hora apertura/cierre)
- Horarios por profesional (específicos)
- Días especiales (feriados, cierre excepcional)
- Bloques de tiempo configurables (15/30/45/60 min)
- Gestión de pausas (almuerzo, descanso)

**Objetivo de negocio:**
- Flexibilidad máxima en disponibilidad
- Reducción de turnos no deseados

---

### Módulo 5: Reserva de Turnos (Cliente)
**Features:**
- Flujo de reserva paso a paso
- Visualización de disponibilidad en tiempo real
- Validación de slots disponibles
- Reserva de turno
- Generación de archivo .ics
- Envío de email de confirmación
- Página de confirmación/resumen

**Objetivo de negocio:**
- Experiencia fluida para cliente
- Reducción de abandonos
- Confirmación inmediata

---

### Módulo 6: Gestión de Turnos (Admin)
**Features:**
- Vista de turnos (calendario y lista)
- Creación manual de turnos
- Cancelación de turnos
- Reagendamiento
- Estados: Pendiente / Confirmado / Cancelado / Completado
- Filtros y búsqueda
- Exportación (CSV)

**Objetivo de negocio:**
- Control total sobre la agenda
- Gestión eficiente

---

### Módulo 7: Base de Clientes
**Features:**
- Registro automático al reservar
- Perfil de cliente (historial de turnos)
- Datos de contacto
- Búsqueda y filtros
- Exportación de base

**Objetivo de negocio:**
- Construcción de base de datos sin esfuerzo
- Historial para marketing/retención

---

### Módulo 8: Notificaciones y Recordatorios
**Features:**
- Email de confirmación (Resend/SendGrid)
- Email de recordatorio (24-48h antes, configurable)
- Email de cancelación
- Notificación al admin de nueva reserva
- Notificación al admin de cancelación
- Sistema de jobs programados (BullMQ/cron)

**Objetivo de negocio:**
- Reducción de no-shows
- Comunicación proactiva
- Mejora de experiencia

---

### Módulo 9: Dashboard y Reportes
**Features:**
- Dashboard principal:
  - Turnos hoy/próximos
  - Ingresos estimados
  - Ocupación semanal
  - Alertas
- Reportes:
  - Turnos (diario/semanal/mensual/rango)
  - Facturación global y por profesional
  - Servicios más utilizados
  - Profesionales más solicitados
  - Usuarios nuevos
  - Recurrencia de clientes
  - Turnos cancelados vs confirmados
- Exportación de reportes (CSV)

**Objetivo de negocio:**
- Visibilidad del negocio
- Toma de decisiones basada en datos
- Optimización de recursos

---

### Módulo 10: Personalización Visual (Branding)
**Features:**
- Upload de logo
- Selector de colores (primario, secundario)
- Tipografías (predefinidas, selección simple)
- Vista previa en tiempo real
- Configuración de texto/páginas (opcional MVP)

**Objetivo de negocio:**
- Identidad de marca por tenant
- Confianza del cliente final
- Diferenciación

---

### Módulo 11: Integración de Calendarios
**Features:**
- Generación de archivo .ics estándar
- Compatibilidad Google Calendar, Outlook, Apple
- Descarga directa o envío por email
- Link de agregar a calendario en confirmación

**Objetivo de negocio:**
- Mejora de UX (no olvidar turnos)
- Reducción de no-shows

---

## 🎨 Diseño UX

### Principios de Usabilidad

1. **Progreso Visible**
   - Steps indicators en flujo de reserva
   - Breadcrumbs en navegación admin
   - Estados claros (loading, success, error)

2. **Feedback Inmediato**
   - Validación en tiempo real
   - Confirmaciones de acciones
   - Mensajes de error claros y accionables

3. **Minimalismo**
   - Solo información necesaria por pantalla
   - Eliminar fricción innecesaria
   - CTA claros y únicos

4. **Consistencia**
   - Componentes reutilizables (shadcn/ui)
   - Patrones de diseño uniformes
   - Lenguaje consistente

5. **Accesibilidad**
   - Contraste WCAG AA mínimo
   - Navegación por teclado
   - Labels descriptivos
   - ARIA labels donde corresponda

---

### Flujos UX Detallados

#### Flujo 1: Reserva de Turno (Mobile)

**Pantalla 1: Landing**
- Logo del negocio (centrado, prominente)
- Mensaje de bienvenida (opcional, configurable)
- Botón grande "Reservar Turno" (CTA principal)
- Footer: Contacto, dirección

**Pantalla 2: Selección de Servicio**
- Lista de servicios (cards o lista simple)
- Cada card: Nombre, duración, precio
- Click → siguiente paso
- Filtros (si >5 servicios): Por categoría, precio

**Pantalla 3: Selección de Profesional**
- Solo si hay >1 profesional para ese servicio
- Cards con foto (si hay), nombre, especialidad
- Opción "Cualquiera disponible"
- Skip si solo hay uno

**Pantalla 4: Calendario de Disponibilidad**
- Vista mensual (días disponibles destacados)
- Click en día → muestra slots horarios
- Slots: "10:00 AM Disponible" / "10:30 AM Ocupado" (gris, disabled)
- Solo disponibles son clickeables
- Selector de mes (anterior/siguiente)

**Pantalla 5: Datos Personales**
- Formulario limpio:
  - Nombre (requerido)
  - Apellido (requerido)
  - Email (requerido, validación)
- Si email existe en BD, pre-llenar nombre/apellido
- Botón "Continuar"

**Pantalla 6: Confirmación**
- Resumen visual:
  ```
  📅 Fecha: Jueves 15 de Marzo, 2024
  ⏰ Hora: 10:00 AM
  👤 Profesional: Dr. Carlos Mendoza
  🏥 Servicio: Consulta Médica General
  💰 Precio: $500
  📍 Ubicación: Av. Corrientes 1234
  ```
- Botón "Confirmar Turno" (grande, destacado)
- Link "Modificar" (volver atrás)

**Pantalla 7: Éxito**
- ✅ Check mark grande
- "¡Turno confirmado!"
- Resumen nuevamente
- Botón "Agregar a mi calendario" (.ics)
- Mensaje: "Recibirás un email de confirmación en breve"
- Opción de ver detalles o compartir

---

#### Flujo 2: Dashboard Admin (Desktop)

**Layout Principal:**
- Sidebar izquierda (colapsable):
  - Logo del negocio
  - Navegación:
    - 🏠 Dashboard
    - 📅 Turnos
    - 👥 Profesionales
    - 🛍️ Servicios
    - ⚙️ Configuración
    - 📊 Reportes
    - 👤 Perfil
- Header superior:
  - Búsqueda global (opcional)
  - Notificaciones (bell icon)
  - Avatar + dropdown
- Contenido principal: Dinámico según sección

**Pantalla Dashboard:**
- Grid de widgets:
  - **Card 1:** Turnos de hoy
    - Número grande
    - Lista de próximos 3 turnos
    - Link "Ver todos"
  - **Card 2:** Ingresos estimados (mes)
    - Número grande
    - Gráfico pequeño (tendencia)
  - **Card 3:** Ocupación semanal
    - Gráfico de barras simple
    - % de ocupación
  - **Card 4:** Alertas
    - Turnos sin confirmar
    - Próximos vencimientos
- Acciones rápidas:
  - "Crear Turno Manual"
  - "Ver Reporte Semanal"

**Pantalla Turnos:**
- Vista dual: Calendario + Lista (toggle)
- Filtros:
  - Por fecha (rango)
  - Por profesional
  - Por estado
  - Por servicio
- Lista: Tabla con columnas:
  - Fecha/Hora
  - Cliente
  - Servicio
  - Profesional
  - Estado (badge)
  - Acciones (Ver/Editar/Cancelar)
- Click en turno → Modal con detalles completos

**Pantalla Servicios (ABM):**
- Lista de servicios existentes
- Botón "+ Nuevo Servicio"
- Cards/tabla con:
  - Nombre
  - Duración
  - Precio
  - Estado (activo/inactivo)
  - Acciones (Editar/Eliminar)
- Modal de creación/edición:
  - Formulario con todos los campos
  - Preview de cómo se ve en frontend

---

### Responsive Design Strategy

**Mobile First:**
- Flujo de cliente optimizado para mobile (90% de uso)
- Componentes adaptativos
- Navegación simplificada (hamburger menu)

**Desktop:**
- Admin principalmente en desktop
- Más información visible
- Hover states y interacciones avanzadas
- Tablas y datos complejos

**Breakpoints sugeridos:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🎯 Priorización MVP (Admin-First)

### ⚠️ CAMBIO DE ENFOQUE: Admin es el Cliente Principal

**El admin es quien:**
- Paga la suscripción
- Toma la decisión de compra
- Necesita ver valor inmediato
- Debe tener onboarding excepcional
- Requiere herramientas profesionales

**El cliente final (reservador) es importante porque:**
- Su experiencia impacta la retención del admin
- Si la UX es mala → admin cancela
- Si la UX es buena → admin renueva

---

### ✅ MVP Fase 1: Admin Core + Onboarding (Semanas 1-3) - PRIORIDAD MÁXIMA

**Objetivo:** Admin puede configurar su turnero y recibir su primera reserva en < 10 minutos.

#### 1. Landing y Registro (Semana 1)
- ✅ Landing page profesional con beneficios claros
- ✅ Formulario de registro mínimo (email, nombre, negocio)
- ✅ Magic link authentication
- ✅ Redirección automática a onboarding

#### 2. Onboarding Guiado (Semana 1-2) - CRÍTICO
- ✅ Wizard paso a paso con progress bar
- ✅ Configuración básica (nombre, logo, colores) con preview en tiempo real
- ✅ Creación de primer servicio (formulario simple)
- ✅ Creación de primer profesional (o "Soy yo mismo")
- ✅ Configuración de horarios (valores por defecto inteligentes)
- ✅ Vista final: Link para compartir + Preview del turnero
- ✅ Dashboard inicial con acciones sugeridas

#### 3. Dashboard Admin Básico (Semana 2)
- ✅ Vista de turnos del día
- ✅ Link para compartir destacado
- ✅ Estadísticas básicas: Turnos hoy, esta semana
- ✅ Acciones rápidas: Crear turno manual, Ver turnos

#### 4. ABM Core (Semana 2-3)
- ✅ ABM de Servicios (crear, editar, eliminar, activar/desactivar)
- ✅ ABM de Profesionales (crear, editar, eliminar, asignar servicios)
- ✅ Configuración de Horarios (vista semanal visual, click para activar/desactivar)

#### 5. Gestión de Turnos (Semana 3)
- ✅ Vista de turnos (lista y calendario básico)
- ✅ Creación manual de turnos
- ✅ Cancelación de turnos
- ✅ Filtros básicos (fecha, profesional, estado)

**Criterio de éxito Fase 1:**
- ✅ Admin completa onboarding en < 10 minutos
- ✅ Admin ve su turnero funcionando
- ✅ Admin puede gestionar servicios, profesionales y turnos
- ✅ Admin puede compartir link y recibir reservas

---

### ✅ MVP Fase 2: Experiencia Cliente (Semanas 3-4) - IMPORTANTE PERO NO BLOQUEANTE

**Objetivo:** Cliente puede reservar turno de forma fluida.

#### 6. Landing Pública Tenant-Branded (Semana 3)
- ✅ Página pública con branding del tenant (logo, colores)
- ✅ Información del negocio (opcional)
- ✅ CTA: "Reservar Turno"

#### 7. Flujo de Reserva Cliente (Semana 3-4)
- ✅ Selección de servicio
- ✅ Selección de profesional (si hay múltiples)
- ✅ Calendario de disponibilidad (mes + slots horarios)
- ✅ Formulario de datos (nombre, apellido, email)
- ✅ Confirmación con resumen
- ✅ Página de éxito

#### 8. Validación y Disponibilidad (Semana 4)
- ✅ Validación de slots disponibles en tiempo real
- ✅ Prevención de race conditions (locks en BD)
- ✅ Cálculo de disponibilidad basado en horarios y turnos existentes

#### 9. Emails Básicos (Semana 4)
- ✅ Email de confirmación al cliente
- ✅ Email de notificación al admin (nueva reserva)
- ✅ Templates básicos pero profesionales

#### 10. Base de Clientes (Semana 4)
- ✅ Registro automático al reservar
- ✅ Vista de clientes en admin
- ✅ Historial de turnos por cliente

**Criterio de éxito Fase 2:**
- ✅ Cliente puede reservar turno completo en < 2 minutos
- ✅ Admin recibe notificación de nueva reserva
- ✅ Emails funcionan correctamente

---

### ✅ MVP Fase 3: Multi-Tenancy y Infraestructura (Paralelo, Semanas 1-4)

#### 11. Multi-Tenancy (Semanas 1-4)
- ✅ Sistema multi-tenant con tenant_id en todas las tablas
- ✅ Middleware de tenant isolation
- ✅ Guards y validación estricta
- ✅ Tests de aislamiento

#### 12. Infraestructura (Semanas 1-4)
- ✅ Setup de Prisma + PostgreSQL
- ✅ Setup de Next.js + NestJS
- ✅ Variables de entorno
- ✅ Deploy básico (Vercel + Railway)

---

### 🚀 Post-MVP: Mejoras y Optimizaciones (Semanas 5+)

**Fase 4: Experiencia Cliente Mejorada (Semanas 5-6)**
- Calendario visual mejorado
- Generación de archivos .ics
- Recordatorios programados (24h antes)
- Confirmación de recordatorio (cliente confirma asistencia)

**Fase 5: Dashboard y Reportes (Semanas 7-8)**
- Dashboard completo con KPIs
- Reportes de facturación
- Reportes por profesional
- Reportes de servicios más utilizados
- Exportación a CSV

**Fase 6: Personalización Avanzada (Semanas 9-10)**
- Tipografías personalizables
- Textos personalizables (emails, páginas)
- Horarios por profesional (sobreescribe global)
- Configuración avanzada de notificaciones

---

### 📊 Métricas de Éxito MVP (Admin-First)

**Onboarding:**
- Tasa de completación: >80%
- Tiempo promedio: < 10 minutos
- Tasa de primera reserva recibida: >60% en primera semana

**Retención:**
- Tasa de activación (admin que recibe primera reserva): >70%
- Tasa de retención 30 días: >60%
- Tasa de retención 90 días: >50%

**Uso:**
- Admin usa el sistema al menos 3 veces por semana
- Admin recibe al menos 1 reserva por semana
- Admin configura al menos 2 servicios

**Experiencia Cliente:**
- Tasa de conversión (inicio → confirmación): >70%
- Tiempo promedio de reserva: < 2 minutos
- Tasa de no-show: < 20% (sin recordatorios)

---

### 🚀 Post-MVP (Should Have / Nice to Have)

**Fase 2: Experiencia y Optimización (Semanas 5-8)**
- Calendario visual en frontend (cliente)
- Generación de archivos .ics
- Recordatorios programados (24h antes)
- Dashboard admin con KPIs básicos
- Personalización avanzada (tipografías, textos)
- Horarios por profesional (sobreescribe global)

**Fase 3: Reportes y Analytics (Semanas 9-12)**
- Dashboard completo con gráficos
- Reportes de facturación
- Reportes por profesional
- Reportes de servicios más utilizados
- Exportación a CSV

**Fase 4: Funcionalidades Avanzadas (Semanas 13+)**
- Reagendamiento de turnos (cliente y admin)
- Confirmación de recordatorio (cliente confirma antes)
- Recurrencia de turnos
- Integraciones (WhatsApp, SMS)
- App mobile nativa (opcional, futuro)
- Pasarela de pagos (pre-pago de servicios)
- Códigos promocionales

---

## ⚠️ Riesgos y Consideraciones

### Riesgos Técnicos

1. **Multi-Tenancy**
   - **Riesgo:** Filtrado accidental de datos entre tenants
   - **Mitigación:** Middleware global que valida tenant_id en todas las queries
   - **Validación:** Tests automatizados de aislamiento

2. **Disponibilidad en Tiempo Real**
   - **Riesgo:** Race conditions (2 clientes reservan mismo slot)
   - **Mitigación:** Locks en base de datos (SELECT FOR UPDATE) o uso de transacciones
   - **Validación:** Tests de concurrencia

3. **Performance con Crecimiento**
   - **Riesgo:** Queries lentas con muchos turnos/tenants
   - **Mitigación:** Índices en BD (tenant_id, fecha), paginación, caching
   - **Validación:** Load testing

4. **Jobs Programados (Recordatorios)**
   - **Riesgo:** Falla en envío de emails
   - **Mitigación:** Queue system (BullMQ), retry logic, dead letter queue
   - **Validación:** Monitoring y alertas

### Riesgos de Negocio

1. **Adopción por Parte de Admin**
   - **Riesgo:** Configuración percibida como compleja
   - **Mitigación:** Onboarding guiado, videos tutoriales, soporte
   - **Validación:** User testing con usuarios reales

2. **Experiencia Cliente**
   - **Riesgo:** Abandono en flujo de reserva
   - **Mitigación:** Analytics de conversión, A/B testing, simplificar pasos
   - **Validación:** Métricas de conversión (>70% objetivo)

3. **Escalabilidad de Costos**
   - **Riesgo:** Emails y base de datos caros con crecimiento
   - **Mitigación:** Pricing escalonado, optimización de queries, email batching
   - **Validación:** Modelo de costos por tenant

---

## 📊 Métricas de Éxito

### KPIs Producto

1. **Tasa de Conversión (Cliente)**
   - Objetivo: >70% de inicio a confirmación
   - Métrica: Turnos confirmados / Inicios de reserva

2. **Tiempo de Reserva**
   - Objetivo: <2 minutos promedio
   - Métrica: Tiempo desde landing hasta confirmación

3. **Adopción Admin**
   - Objetivo: 80% completa configuración inicial
   - Métrica: Tenants con al menos 1 servicio configurado

4. **Retención de Tenants**
   - Objetivo: >80% después de 3 meses
   - Métrica: Tenants activos / Tenants creados hace 3 meses

5. **No-Show Rate**
   - Objetivo: <15% con recordatorios
   - Métrica: Turnos no completados / Turnos confirmados

---

## 🎨 Justificaciones de Diseño

### Why Magic Link Authentication?
- **UX:** Sin passwords que olvidar
- **Seguridad:** Más seguro que password débil
- **Onboarding:** Más rápido para usuarios no técnicos
- **Técnico:** Implementación simple con Auth.js

### Why Multi-Tenant desde el Inicio?
- **Escalabilidad:** Base única, recursos compartidos
- **Costo:** Infraestructura eficiente
- **Mantenimiento:** Una versión, múltiples clientes
- **Negocio:** Modelo SaaS nativo

### Why PostgreSQL + Prisma?
- **PostgreSQL:** Robusto, escalable, ACID compliance, JSON support
- **Prisma:** Type-safety, migrations fáciles, developer experience excelente
- **Flexibilidad:** Schema flexible para evolución del producto

### Why Next.js + NestJS?
- **Next.js:** SSR para SEO (landing pages), optimización automática, deploy fácil (Vercel)
- **NestJS:** Arquitectura modular, TypeScript nativo, fácil de escalar, patterns enterprise
- **Separación:** Frontend y backend independientes, escalables por separado

---

## 🔄 Roadmap Sugerido

### Sprint 1-2: Setup y Multi-Tenancy
- Setup de proyectos (Next.js + NestJS)
- Configuración de Prisma + PostgreSQL
- Sistema multi-tenant básico
- Autenticación magic link (admin)

### Sprint 3-4: Core Admin
- ABM de Servicios
- ABM de Profesionales
- Configuración de Horarios

### Sprint 5-6: Reserva Cliente
- Landing page tenant-branded
- Flujo de reserva completo
- Validación de disponibilidad

### Sprint 7-8: Gestión y Emails
- Vista de turnos admin
- Cancelación y creación manual
- Emails de confirmación

### Sprint 9-10: Polish y Testing
- UX improvements
- Testing end-to-end
- Bug fixing
- Preparación para producción

---

**Fin del Documento de Definición del Producto**

