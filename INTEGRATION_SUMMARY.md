# 🔗 Resumen de Integración Frontend-Backend

## ✅ Lo que se ha completado

### 1. Cliente API (`lib/api/`)
- ✅ **`client.ts`**: Cliente HTTP con soporte para multi-tenancy
- ✅ **`types.ts`**: Tipos TypeScript para todas las entidades
- ✅ **`endpoints.ts`**: Funciones para todos los endpoints del API
- ✅ **`hooks.ts`**: React Query hooks para usar el API de forma reactiva

### 2. Providers y Context
- ✅ **`QueryProvider.tsx`**: Provider de React Query configurado
- ✅ **`TenantContext.tsx`**: Context para manejar el tenant actual
- ✅ **`layout.tsx`**: Actualizado con QueryProvider

### 3. Componentes Actualizados
- ✅ **`OnboardingWizard.tsx`**: Ahora crea tenant, servicio, profesional y horarios en el backend

---

## 📋 Estructura de Archivos Creados

```
lib/
├── api/
│   ├── client.ts          # Cliente HTTP base
│   ├── types.ts           # Tipos TypeScript
│   ├── endpoints.ts       # Funciones de endpoints
│   └── hooks.ts           # React Query hooks
├── providers/
│   └── QueryProvider.tsx  # Provider de React Query
└── context/
    └── TenantContext.tsx  # Context de tenant

components/
└── admin/
    └── OnboardingWizard.tsx  # Actualizado para usar API real
```

---

## 🔧 Configuración Necesaria

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Cómo Usar los Hooks

### Ejemplo: Obtener Servicios

```tsx
'use client'

import { useServices } from '@/lib/api/hooks'
import { useTenantContext } from '@/lib/context/TenantContext'

export function MyComponent() {
  const { tenantId } = useTenantContext()
  const { data: services, isLoading, error } = useServices(tenantId || '')

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {services?.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
    </div>
  )
}
```

### Ejemplo: Crear Servicio

```tsx
'use client'

import { useCreateService } from '@/lib/api/hooks'
import { toast } from 'sonner'

export function CreateServiceForm() {
  const createService = useCreateService()

  const handleSubmit = async (data: CreateServiceDto) => {
    try {
      await createService.mutateAsync(data)
      toast.success('Servicio creado exitosamente')
    } catch (error) {
      toast.error('Error al crear servicio')
    }
  }

  return (
    // ... formulario
  )
}
```

---

## 📡 Endpoints Disponibles

Todos los hooks están disponibles en `lib/api/hooks.ts`:

### Tenants
- `useTenants()` - Listar todos
- `useTenant(id)` - Obtener por ID
- `useTenantBySlug(slug)` - Obtener por slug
- `useCreateTenant()` - Crear
- `useUpdateTenant()` - Actualizar
- `useDeleteTenant()` - Eliminar

### Services
- `useServices(tenantId)` - Listar
- `useService(id)` - Obtener por ID
- `useCreateService()` - Crear
- `useUpdateService()` - Actualizar
- `useDeleteService()` - Eliminar

### Professionals
- `useProfessionals(tenantId)` - Listar
- `useProfessional(id)` - Obtener por ID
- `useCreateProfessional()` - Crear
- `useUpdateProfessional()` - Actualizar
- `useDeleteProfessional()` - Eliminar

### Schedules
- `useSchedules(tenantId)` - Listar
- `useCreateSchedule()` - Crear
- `useUpdateSchedule()` - Actualizar
- `useDeleteSchedule()` - Eliminar

### Appointments
- `useAppointments(tenantId)` - Listar
- `useAppointment(id)` - Obtener por ID
- `useCreateAppointment()` - Crear
- `useUpdateAppointment()` - Actualizar
- `useDeleteAppointment()` - Eliminar
- `useAvailability(query)` - Consultar disponibilidad

### Customers
- `useCustomers(tenantId)` - Listar
- `useCreateCustomer()` - Crear

### Auth
- `useLogin()` - Solicitar magic link
- `useVerifyToken()` - Verificar token

---

## 🔐 Multi-tenancy

El cliente API automáticamente agrega el header `x-tenant-id` cuando se configura el tenant:

```tsx
import { apiClient } from '@/lib/api/client'

// Configurar tenant
apiClient.setTenantId('tenant-uuid')

// Todas las requests ahora incluyen x-tenant-id header
```

O usar el TenantContext:

```tsx
import { useTenantContext } from '@/lib/context/TenantContext'

const { tenant, setTenant } = useTenantContext()
```

---

## 📝 Próximos Pasos

### Componentes por Actualizar

1. **ServicesManager** - Usar `useServices`, `useCreateService`, etc.
2. **ProfessionalsManager** - Usar `useProfessionals`, `useCreateProfessional`, etc.
3. **AppointmentsManager** - Usar `useAppointments`, `useCreateAppointment`, etc.
4. **DashboardOverview** - Usar datos reales del API
5. **ClientBooking** - Usar `useServices`, `useProfessionals`, `useAvailability`, `useCreateAppointment`

### Funcionalidades Pendientes

1. **Autenticación Completa**
   - Implementar login con magic link
   - Proteger rutas del admin
   - Manejar sesiones

2. **Manejo de Errores**
   - Mostrar errores de API de forma amigable
   - Retry automático en caso de fallos

3. **Optimistic Updates**
   - Actualizar UI antes de confirmar con el servidor
   - Rollback en caso de error

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@/lib/api/...'"
- Verifica que los archivos estén en `lib/api/`
- Verifica que `tsconfig.json` tenga los paths configurados

### Error: "API_URL is not defined"
- Crea el archivo `.env.local` con `NEXT_PUBLIC_API_URL`
- Reinicia el servidor de desarrollo

### Error: "Network request failed"
- Verifica que el backend esté corriendo en `http://localhost:3001`
- Verifica CORS en el backend (si es necesario)

---

## ✅ Checklist

- [x] Cliente API creado
- [x] Tipos TypeScript definidos
- [x] React Query hooks implementados
- [x] QueryProvider configurado
- [x] TenantContext creado
- [x] OnboardingWizard actualizado
- [ ] ServicesManager actualizado
- [ ] ProfessionalsManager actualizado
- [ ] AppointmentsManager actualizado
- [ ] ClientBooking actualizado
- [ ] Autenticación implementada

---

**¡La integración base está lista!** 🚀

Ahora puedes usar los hooks en cualquier componente para interactuar con el backend.


