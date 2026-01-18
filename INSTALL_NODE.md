# 📦 Guía de Instalación de Node.js y npm

## Opción 1: Instalación Directa (Recomendada - Más Rápida)

### Paso 1: Descargar Node.js

1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (Long Term Support) - Recomendada
3. Ejecuta el instalador `.pkg` descargado
4. Sigue el asistente de instalación (solo haz click en "Siguiente")

### Paso 2: Verificar Instalación

Abre una nueva terminal y ejecuta:

```bash
node --version
npm --version
```

Deberías ver algo como:
```
v20.x.x
10.x.x
```

### Paso 3: Instalar Dependencias del Proyecto

```bash
cd "/Users/marianonardon/Documents/Appointment app"
npm install
```

### Paso 4: Ejecutar el Proyecto

```bash
npm run dev
```

---

## Opción 2: Instalar con Homebrew (Para Desarrolladores)

Si planeas desarrollar más proyectos, Homebrew es útil.

### Paso 1: Instalar Homebrew

Ejecuta en la terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Sigue las instrucciones que aparezcan.

### Paso 2: Instalar Node.js con Homebrew

```bash
brew install node
```

### Paso 3: Verificar Instalación

```bash
node --version
npm --version
```

### Paso 4: Instalar Dependencias y Ejecutar

```bash
cd "/Users/marianonardon/Documents/Appointment app"
npm install
npm run dev
```

---

## ⚠️ Solución de Problemas

### Si después de instalar no funciona:

1. **Cierra y abre una nueva terminal** (importante para cargar las variables de entorno)

2. **Verifica que esté en el PATH:**
```bash
echo $PATH
```

3. **Si no aparece, agrega Node.js al PATH:**
```bash
export PATH="/usr/local/bin:$PATH"
```

O agrega esta línea a tu `~/.zshrc`:
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## ✅ Verificación Final

Después de instalar, ejecuta:

```bash
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar 9.x.x o superior
```

Si ambos comandos funcionan, estás listo para continuar.

---

## 🚀 Siguiente Paso

Una vez instalado Node.js, ejecuta:

```bash
cd "/Users/marianonardon/Documents/Appointment app"
npm install
npm run dev
```

Luego visita: `http://localhost:3000`


