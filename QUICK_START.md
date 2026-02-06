# 🚀 Guía Rápida de Inicio

Guía paso a paso para configurar y comenzar el desarrollo del Turnero Web SaaS.

---

## 📋 Prerequisitos

- Node.js 18+ y npm/yarn/pnpm
- PostgreSQL 14+ (local o cloud)
- Git
- Editor de código (VS Code recomendado)

---

## 🏗️ Setup Inicial

### 1. Estructura del Proyecto

**Opción A: Monorepo** (Recomendado para MVP)
```
appointment-saas/
├── apps/
│   ├── frontend/      # Next.js
│   └── backend/       # NestJS
├── packages/
│   └── prisma/        # Schema compartido
└── package.json
```

**Opción B: Repositorios Separados**
```
appointment-frontend/  # Next.js
appointment-backend/   # NestJS
```

### 2. Setup Frontend (Next.js)

```bash
# Crear proyecto Next.js
npx create-next-app@latest frontend --typescript --tailwind --app

cd frontend

# Instalar dependencias
npm install @tanstack/react-query zod react-hook-form
npm install date-fns
npm install @radix-ui/react-* # Para shadcn/ui

# Instalar shadcn/ui
npx shadcn-ui@latest init

# Agregar componentes necesarios
npx shadcn-ui@latest add button card input select calendar dialog
```

**Estructura de carpetas**:
```
frontend/
├── app/
├── components/
├── lib/
├── types/
└── styles/
```

### 3. Setup Backend (NestJS)

```bash
# Instalar NestJS CLI
npm i -g @nestjs/cli

# Crear proyecto NestJS
nest new backend

cd backend

# Instalar dependencias principales
npm install @prisma/client
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install class-validator class-transformer
npm install @nestjs/bullmq bullmq
npm install resend
npm install ics
npm install @nestjs/config

# Dev dependencies
npm install -D prisma
npm install -D @types/passport-jwt
```

**Estructura de carpetas**:
```
backend/
├── src/
│   ├── auth/
│   ├── tenants/
│   ├── services/
│   ├── professionals/
│   ├── appointments/
│   ├── schedules/
│   ├── customers/
│   ├── notifications/
│   ├── jobs/
│   ├── reports/
│   └── calendar/
└── prisma/
```

### 4. Setup Prisma

```bash
# En la carpeta backend (o packages/prisma)
npm install -D prisma
npx prisma init

# Configurar .env con DATABASE_URL
# DATABASE_URL="postgresql://user:password@localhost:5432/turnero_db?schema=public"
```

**Crear schema inicial**:
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// [Copiar schema completo de PRISMA_SCHEMA.md]
```

**Ejecutar migrations**:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Seed inicial** (opcional):
```bash
npx prisma db seed
```

---

## 🔧 Configuración de Variables de Entorno

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-aqui-genera-uno-seguro
```

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/turnero_db?schema=public"

# JWT
JWT_SECRET=tu-jwt-secret-aqui-genera-uno-seguro
JWT_EXPIRATION=7d
MAGIC_LINK_EXPIRATION=15m

# Email (Resend)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@turnero.com

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# App
NODE_ENV=development
PORT=3001
```

---

## 🚀 Comandos Esenciales

### Frontend

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Linting
npm run lint
```

### Backend

```bash
# Desarrollo
npm run start:dev

# Build
npm run build

# Producción
npm run start:prod

# Prisma Studio (GUI para BD)
npx prisma studio

# Migrations
npx prisma migrate dev
npx prisma migrate deploy
```

---

## 📝 Primeros Pasos de Desarrollo

### 1. Crear Primer Módulo (Tenants)

**Backend - NestJS:**

```bash
# Generar módulo de tenants
nest generate module tenants
nest generate controller tenants
nest generate service tenants
```

**Implementar básico**:
- Entity (usando Prisma)
- DTOs
- Controller con CRUD básico
- Service con lógica de negocio

### 2. Setup Multi-Tenancy

**Crear middleware**:
```typescript
// src/common/middleware/tenant.middleware.ts
// [Implementar según TECHNICAL_ARCHITECTURE.md]
```

**Crear guard**:
```typescript
// src/common/guards/tenant.guard.ts
// [Implementar según TECHNICAL_ARCHITECTURE.md]
```

### 3. Crear Primer Módulo Frontend

**Componente básico**:
```typescript
// app/components/ui/ServiceCard.tsx
// Componente para mostrar servicios
```

**API client**:
```typescript
// lib/api/services.ts
// Cliente para llamadas API
```

---

## 🧪 Testing

### Backend (NestJS)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend (Next.js)

```bash
# Tests (si configuras Jest/Vitest)
npm run test
```

---

## 📦 Deployment

### Frontend (Vercel)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en push

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Backend (Railway/Render)

1. Conectar repositorio
2. Configurar build command: `npm run build`
3. Start command: `npm run start:prod`
4. Configurar variables de entorno

### Database

**Opciones**:
- Supabase (gratis tier disponible)
- Railway PostgreSQL
- Render PostgreSQL
- Neon

**Migrations en producción**:
```bash
npx prisma migrate deploy
```

---

## 🐛 Troubleshooting

### Problema: Prisma Client no se genera

```bash
npx prisma generate
```

### Problema: Migrations fallan

```bash
# Reset database (solo desarrollo)
npx prisma migrate reset

# O resolver manualmente
npx prisma migrate resolve --applied "nombre_migration"
```

### Problema: CORS en desarrollo

**Backend - main.ts**:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

---

## 📚 Recursos Adicionales

- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación NestJS](https://docs.nestjs.com)
- [Documentación Prisma](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## ✅ Checklist de Setup

- [ ] PostgreSQL configurado y corriendo
- [ ] Frontend Next.js creado y funcionando
- [ ] Backend NestJS creado y funcionando
- [ ] Prisma configurado con schema inicial
- [ ] Migrations ejecutadas
- [ ] Variables de entorno configuradas
- [ ] Primer endpoint funcionando (health check)
- [ ] Frontend conectado al backend
- [ ] Multi-tenancy básico implementado

---

**¡Listo para comenzar el desarrollo! 🎉**



