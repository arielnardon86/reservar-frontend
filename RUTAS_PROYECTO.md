# 🗺️ Rutas del Proyecto

## 📍 Rutas Disponibles

### Para Administradores (Venta/Configuración)

- **`/`** → Redirige a `/landing`
- **`/landing`** → Landing page de venta (para captar nuevos admins)
- **`/onboarding`** → Wizard de configuración inicial (para nuevos admins)
- **`/admin/dashboard`** → Dashboard completo del admin

### Para Clientes Finales (Reserva de Turnos)

- **`/book`** → Flujo completo de reserva de turnos
- **`/[tenantSlug]`** → Landing pública del negocio (ej: `/mi-negocio`)

---

## 🎯 Cómo Acceder a Cada Vista

### Vista Admin (Configuración)
```
http://localhost:3000/admin/dashboard
```

### Vista Cliente (Reservar Turno)
```
http://localhost:3000/book
```

### Landing Pública del Negocio
```
http://localhost:3000/mi-negocio
```
(En producción, esto sería dinámico según el tenant)

### Landing de Venta (Para Admins)
```
http://localhost:3000/landing
```

### Onboarding (Para Nuevos Admins)
```
http://localhost:3000/onboarding
```

---

## 🔄 Flujo Completo

### Flujo Admin (Nuevo Usuario)
1. `/landing` → Ve la landing de venta
2. `/onboarding` → Completa configuración
3. `/admin/dashboard` → Gestiona su negocio

### Flujo Cliente (Reservar Turno)
1. `/[tenantSlug]` → Ve la landing del negocio
2. Click en "Reservar Turno" → `/book`
3. Completa el flujo de reserva

---

## 💡 Tips

- **Para probar la vista de cliente**: Ve directamente a `http://localhost:3000/book`
- **Para probar el admin**: Ve a `http://localhost:3000/admin/dashboard`
- **Para ver el onboarding**: Ve a `http://localhost:3000/onboarding`


