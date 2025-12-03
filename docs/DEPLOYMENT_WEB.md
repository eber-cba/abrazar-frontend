# Deployment - Web (Vercel/Netlify)

Guía para desplegar el frontend de Abrazar como aplicación web.

## Opción 1: Vercel (Recomendado)

### Paso 1: Build para Web

```bash
# Exportar build optimizado
npx expo export --platform web
```

Esto genera una carpeta `dist/` con tu app lista para production.

### Paso 2: Deploy a Vercel

#### Vía CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd dist
vercel --prod
```

#### Vía GitHub

1. Push tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Selecciona tu repo `abrazar-frontend`
5. Configura:
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Paso 3: Variables de Entorno

En el dashboard de Vercel, agrega:

```
EXPO_PUBLIC_API_URL=https://api.abrazar.com
```

---

## Opción 2: Netlify

### Paso 1: Configurar `netlify.toml`

Crea `netlify.toml` en la raíz:

```toml
[build]
  command = "npx expo export --platform web"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Paso 2: Deploy

#### Vía CLI

```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### Vía GitHub

1. Conecta tu repo en [netlify.com](https://netlify.com)
2. Configura build settings según `netlify.toml`
3. Deploy automático en cada push

---

## Opción 3: Railway (No Recomendado)

Railway funciona mejor para backend. Para frontend, usa Vercel o Netlify.

Si aún así quieres usar Railway:

```dockerfile
# Dockerfile (frontend)
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx expo export --platform web

# Servir con nginx
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Testing Local del Build

```bash
# Generar build
npx expo export --platform web

# Servir localmente
npx serve dist
```

Abre `http://localhost:3000` para probar.

---

## Troubleshooting

### Error: "Module not found"

- Asegúrate de ejecutar `npm install` antes del build
- Verifica que todas las dependencias estén en `package.json`

### Error: "Environment variable not defined"

- Configura `EXPO_PUBLIC_API_URL` en tu plataforma de deployment
- En Expo Web, solo las variables que empiezan con `EXPO_PUBLIC_` son expuestas

### La app funciona local pero no en producción

- Revisa la consola del navegador (F12)
- Verifica que la URL del backend sea accesible (CORS habilitado)
- Asegúrate de usar HTTPS si el backend también usa HTTPS
