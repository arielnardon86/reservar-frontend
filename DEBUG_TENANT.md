# 🐛 Debug: Problema con TenantId

## Pasos para Debuggear

1. **Abre la consola del navegador** (F12 → Console)

2. **Ve a** `/admin/dashboard?tenantId=TU_TENANT_ID`

3. **Busca estos logs:**

### En el Frontend (Consola del Navegador):
- `[TenantContext] Initial tenantId set: ...` - Debe aparecer al cargar
- `[TenantContext] useEffect - tenantId set: ...` - Debe aparecer después
- `[API Client] Sending request with tenantId: ...` - Debe aparecer en cada request
- `[useServices] Fetching services...` - Cuando se intenta cargar servicios
- `[useServices] Services received: ...` - Los servicios recibidos

### En el Backend (Terminal donde corre el backend):
- `[TenantMiddleware] Request to: /services` - Debe aparecer
- `[TenantMiddleware] Extracted tenantId: ...` - El tenantId extraído
- `[TenantGuard] Checking tenantId: ...` - Verificación del guard

## Posibles Problemas

### 1. "No tenantId set for request"
**Causa:** El tenantId no se está configurando antes de las queries
**Solución:** Verificar que el TenantProvider se esté renderizando antes de los componentes que usan los hooks

### 2. "Tenant ID is required" (Backend)
**Causa:** El header no está llegando al backend
**Solución:** 
- Verificar CORS
- Verificar que el header se esté enviando (ver logs del frontend)
- Verificar que el middleware esté aplicándose

### 3. Datos vacíos pero sin errores
**Causa:** El tenantId está llegando pero no hay datos para ese tenant
**Solución:** Verificar en Supabase que existan datos para ese tenantId

## Verificar en Supabase

1. Ve a Supabase Dashboard
2. Table Editor
3. Revisa las tablas:
   - `services` - Verifica que tengan el `tenantId` correcto
   - `professionals` - Verifica que tengan el `tenantId` correcto
   - `appointments` - Verifica que tengan el `tenantId` correcto

## Test Manual

Abre la consola del navegador y ejecuta:

```javascript
// Verificar tenantId en localStorage
localStorage.getItem('tenantId')

// Verificar tenantId en apiClient (desde la consola)
// Esto no es accesible directamente, pero puedes verificar en los logs
```

## Solución Temporal

Si nada funciona, puedes probar agregar el tenantId como query param temporalmente:

```typescript
// En endpoints.ts, temporalmente:
export const servicesApi = {
  getAll: (tenantId?: string) => {
    const url = tenantId ? `/services?tenantId=${tenantId}` : '/services';
    return apiClient.get<Service[]>(url);
  },
  // ...
};
```

Pero esto NO es la solución final, solo para debuggear.


