# 🔧 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto frontend con:

```env
# URL del backend NestJS
NEXT_PUBLIC_API_URL=http://localhost:3001

# URL del frontend (para links y redirects)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 📝 Nota

- El archivo `.env.local` NO se sube a Git (está en .gitignore)
- Las variables que empiezan con `NEXT_PUBLIC_` son accesibles desde el cliente
- Asegúrate de que el backend esté corriendo en el puerto 3001


