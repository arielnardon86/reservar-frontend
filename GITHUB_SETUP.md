# 📦 Guía para Subir Código a GitHub

## 🎯 Estrategia: Dos Repositorios Separados

**Recomendación:** Tener dos repositorios separados:
- `turnero-frontend` (Next.js)
- `turnero-backend` (NestJS)

**Ventajas:**
- ✅ Deployment independiente (Vercel para frontend, Railway para backend)
- ✅ Permisos diferentes si trabajas en equipo
- ✅ Más fácil de mantener y escalar

---

## 📋 Paso 1: Preparar Frontend (Next.js)

### 1.1 Inicializar Git

```bash
cd "/Users/marianonardon/Documents/Appointment app"

# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Initial commit: Next.js frontend for Turnero SaaS"
```

### 1.2 Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Click en **"New repository"** (o el botón **+** → **New repository**)
3. Nombre: `turnero-frontend`
4. Descripción: `Frontend Next.js para sistema de turnos SaaS`
5. **NO marques** "Initialize with README" (ya tenemos archivos)
6. Click en **"Create repository"**

### 1.3 Conectar y Subir

```bash
# Agregar remote (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/turnero-frontend.git

# Renombrar branch a main (si es necesario)
git branch -M main

# Subir código
git push -u origin main
```

---

## 📋 Paso 2: Preparar Backend (NestJS)

### 2.1 Inicializar Git

```bash
cd "/Users/marianonardon/Documents/turnero-backend"

# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Initial commit: NestJS backend for Turnero SaaS"
```

### 2.2 Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Click en **"New repository"**
3. Nombre: `turnero-backend`
4. Descripción: `Backend NestJS para sistema de turnos SaaS`
5. **NO marques** "Initialize with README"
6. Click en **"Create repository"**

### 2.3 Conectar y Subir

```bash
# Agregar remote (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/turnero-backend.git

# Renombrar branch a main
git branch -M main

# Subir código
git push -u origin main
```

---

## 🔐 Archivos que NO se Suben (Gracias a .gitignore)

### Frontend
- ✅ `.env` y `.env.local` (variables de entorno)
- ✅ `node_modules/` (dependencias)
- ✅ `.next/` (build de Next.js)
- ✅ `.vercel/` (configuración de Vercel)

### Backend
- ✅ `.env` (variables de entorno)
- ✅ `node_modules/` (dependencias)
- ✅ `dist/` (build compilado)
- ✅ Logs

**⚠️ IMPORTANTE:** Nunca subas archivos `.env` con secrets. Estos se configuran en las plataformas de deployment.

---

## 📝 Archivos de Ejemplo para Variables de Entorno

### Frontend: Crear `.env.example`

```bash
cd "/Users/marianonardon/Documents/Appointment app"

# Crear archivo de ejemplo
cat > .env.example << 'EOF'
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# Agregar al repositorio
git add .env.example
git commit -m "Add .env.example for frontend"
```

### Backend: Crear `.env.example`

```bash
cd "/Users/marianonardon/Documents/turnero-backend"

# Crear archivo de ejemplo
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/turnero?schema=public

# JWT
JWT_SECRET=your-jwt-secret-here
MAGIC_LINK_SECRET=your-magic-link-secret-here

# Email
RESEND_API_KEY=re_your_api_key_here

# Port
PORT=3001
EOF

# Agregar al repositorio
git add .env.example
git commit -m "Add .env.example for backend"
```

---

## ✅ Checklist Pre-Push

### Frontend
- [ ] `.gitignore` está configurado correctamente
- [ ] No hay archivos `.env` en el staging
- [ ] `package.json` está actualizado
- [ ] README.md está actualizado (opcional pero recomendado)
- [ ] Build funciona localmente (`npm run build`)

### Backend
- [ ] `.gitignore` está configurado correctamente
- [ ] No hay archivos `.env` en el staging
- [ ] `package.json` está actualizado
- [ ] `prisma/schema.prisma` está incluido
- [ ] Build funciona localmente (`npm run build`)

---

## 🚀 Comandos Rápidos (Copy-Paste)

### Frontend

```bash
cd "/Users/marianonardon/Documents/Appointment app"

# Si es la primera vez
git init
git add .
git commit -m "Initial commit: Next.js frontend"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/turnero-frontend.git
git push -u origin main

# Para commits futuros
git add .
git commit -m "Descripción del cambio"
git push
```

### Backend

```bash
cd "/Users/marianonardon/Documents/turnero-backend"

# Si es la primera vez
git init
git add .
git commit -m "Initial commit: NestJS backend"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/turnero-backend.git
git push -u origin main

# Para commits futuros
git add .
git commit -m "Descripción del cambio"
git push
```

---

## 🔄 Alternativa: Monorepo (Una Sola Opción)

Si prefieres un solo repositorio:

```bash
# Crear carpeta raíz
mkdir turnero-saas
cd turnero-saas

# Mover proyectos
mv "/Users/marianonardon/Documents/Appointment app" frontend
mv "/Users/marianonardon/Documents/turnero-backend" backend

# Inicializar Git
git init
git add .
git commit -m "Initial commit: Monorepo with frontend and backend"

# Crear repositorio en GitHub: turnero-saas
git remote add origin https://github.com/TU_USUARIO/turnero-saas.git
git branch -M main
git push -u origin main
```

**Nota:** Con monorepo, necesitarás configurar Railway y Vercel para apuntar a las subcarpetas correctas.

---

## 📚 Próximos Pasos

Una vez subido a GitHub:

1. ✅ Conectar frontend a Vercel
2. ✅ Conectar backend a Railway
3. ✅ Configurar variables de entorno en cada plataforma
4. ✅ Deploy automático con cada push

Ver `DEPLOYMENT_STRATEGY.md` para los siguientes pasos.

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/turnero-frontend.git
```

### Error: "failed to push some refs"
```bash
# Si alguien más hizo cambios (o creaste README en GitHub)
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Verificar qué se va a subir
```bash
git status
git ls-files  # Ver todos los archivos trackeados
```

---

**¿Listo para subir? Empieza con el frontend y luego el backend.** 🚀


