# Deployment - Mobile (EAS Build)

Guía para compilar y distribuir la app móvil (Android APK/AAB e iOS IPA).

## Prerrequisitos

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login a tu cuenta Expo
eas login
```

---

## Configuración Inicial

### Paso 1: Configurar EAS

```bash
# En la raíz del proyecto
eas build:configure
```

Esto crea `eas.json` con configuraciones de build:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

### Paso 2: Actualizar `app.json`

Asegúrate de tener configurado:

```json
{
  "expo": {
    "name": "Abrazar",
    "slug": "abrazar",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.abrazar.app"
    },
    "android": {
      "package": "com.abrazar.app"
    }
  }
}
```

---

## Build para Android

### APK (Testing Internal)

```bash
eas build --platform android --profile preview
```

- Genera un APK que puedes instalar directamente
- Útil para testing con usuarios beta
- No publicable en Google Play

### AAB (Production - Google Play)

```bash
eas build --platform android --profile production
```

- Genera un Android App Bundle optimizado
- Requerido para publicar en Google Play Store
- Tamaño más pequeño para usuarios finales

### Distribución

1. **Testing Interno:**

   ```bash
   # El APK estará disponible en el dashboard de Expo
   # Comparte el link de descarga con testers
   ```

2. **Google Play Store:**
   - Descarga el AAB desde el dashboard de Expo
   - Sube a Google Play Console
   - Sigue el proceso de revisión de Google

---

## Build para iOS

### Prerrequisitos

- Cuenta de Apple Developer ($99/año)
- Certificados y provisioning profiles configurados

### Build

```bash
eas build --platform ios --profile production
```

### Distribución

1. **TestFlight (Beta):**

   ```bash
   eas submit --platform ios
   ```

2. **App Store:**
   - Sube el IPA a App Store Connect
   - Completa metadata (screenshots, descripción)
   - Envía para revisión

---

## Manejo de Credenciales

EAS maneja automáticamente:

- ✅ Keystore de Android
- ✅ Certificados de iOS
- ✅ Provisioning Profiles

Las credenciales se almacenan de forma segura en los servidores de Expo.

Para usar tus propias credenciales:

```bash
eas credentials
```

---

## Variables de Entorno

Configura en `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.abrazar.com"
      }
    }
  }
}
```

O usa archivos `.env`:

```bash
# .env.production
EXPO_PUBLIC_API_URL=https://api.abrazar.com
```

---

## Testing del Build

### Android

```bash
# Escanea QR en el dashboard de Expo
# O descarga APK directamente
```

### iOS

```bash
# Agrega testers en App Store Connect
# Instalan vía TestFlight
```

---

## Updates Over-The-Air (OTA)

Después del build inicial, puedes actualizar sin rebuild:

```bash
# Publicar update
eas update --branch production
```

Los usuarios verán el update automáticamente.

---

## Troubleshooting

### Error: "Build failed - Gradle error"

- Revisa `android/build.gradle`
- Asegúrate de tener las versiones correctas de dependencias

### Error: "iOS provisioning profile mismatch"

- Ejecuta `eas credentials` y regenera
- Verifica que tu Bundle ID coincida con app.json

### Error: "Native module not found"

- Algunas librerías requieren rebuild completo
- Usa `prebuild` si usas módulos nativos custom:
  ```bash
  npx expo prebuild
  ```

---

## Costos

- **EAS Build**: Gratis hasta 30 builds/mes (tier gratuito)
- **Apple Developer**: $99/año
- **Google Play Console**: $25 (pago único)

---

## Recursos

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Dashboard](https://expo.dev/)
