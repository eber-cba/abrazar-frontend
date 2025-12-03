# Abrazar - Frontend (Expo)

Aplicación móvil y web para la plataforma Abrazar, construida con **Expo** y **React Native**.

## 🚀 Tecnologías

- **Expo** - Framework para React Native
- **React Native** - UI para iOS, Android y Web
- **TypeScript** - Tipado estático
- **React Query** - Gestión de estado servidor
- **React Navigation** - Navegación entre pantallas
- **Axios** - Cliente HTTP

## 📱 Plataformas Soportadas

- ✅ **iOS** (iPhone/iPad)
- ✅ **Android** (Móviles/Tablets)
- ✅ **Web** (Chrome, Firefox, Safari)
- 🔜 **Desktop** (con Tauri - en roadmap)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env y configurar la URL del backend
# EXPO_PUBLIC_API_URL=http://localhost:3000
```

## 🏃‍♂️ Ejecutar en Desarrollo

```bash
# Modo desarrollo (QR para escanear con Expo Go)
npx expo start

# Web
npx expo start --web

# Android
npx expo start --android

# iOS (requiere Mac + Xcode)
npx expo start --ios
```

## 🏗️ Estructura del Proyecto

```
abrazar-frontend/
├── app/
│   ├── screens/          # Pantallas de la app
│   │   ├── HomeScreen.tsx
│   │   └── LoginScreen.tsx
│   ├── components/       # Componentes reutilizables
│   │   └── Button.tsx
│   ├── navigation/       # Configuración de navegación
│   │   └── AppNavigator.tsx
│   ├── services/         # Servicios de API
│   │   └── api.ts
│   └── hooks/            # Custom hooks
├── assets/               # Imágenes, fuentes
├── docs/                 # Documentación
├── App.tsx               # Punto de entrada
└── package.json
```

## 🔗 Conexión con Backend

El frontend se conecta al backend de Abrazar (Node.js + Express + Prisma).

**Configuración en `.env`:**

```env
EXPO_PUBLIC_API_URL=http://localhost:3000  # Desarrollo
# EXPO_PUBLIC_API_URL=https://api.abrazar.com  # Producción
```

Ver `app/services/api.ts` para detalles de la configuración de Axios.

## 📚 Documentación

- [Desplegar a Web (Vercel)](./docs/DEPLOYMENT_WEB.md)
- [Compilar APK/IPA (EAS Build)](./docs/DEPLOYMENT_MOBILE.md)
- [Integración Tauri (Desktop)](./docs/TAURI_INTEGRATION.md)

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén configurados)
npm test
```

## 📤 Deployment

### Web (Vercel/Netlify)

```bash
npx expo export --platform web
# Deploy la carpeta dist/
```

### Mobile (EAS Build)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure

# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

## 🤝 Contribuir

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) del repositorio principal.

## 📄 Licencia

Este proyecto es parte de Abrazar, plataforma de asistencia a personas en situación de calle.
