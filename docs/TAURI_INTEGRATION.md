# Integración con Tauri (Desktop)

Guía para convertir la app Expo en aplicación de escritorio usando Tauri.

> ⚠️ **Status**: En Roadmap - No implementado aún

Tauri permite empaquetar aplicaciones web como apps nativas de escritorio (Windows, macOS, Linux).

## ¿Por qué Tauri + Expo?

- **Expo Web** genera una PWA estándar
- **Tauri** la empaqueta como app nativa
- Mejor rendimiento que Electron
- Binarios más pequeños (3-5 MB vs 100+ MB)
- Acceso a APIs nativas del SO

---

## Roadmap de Implementación

### Fase 1: Preparar Build de Expo Web

```bash
# Generar build optimizado
npx expo export --platform web
```

### Fase 2: Instalar Tauri CLI

```bash
# En la raíz del proyecto
npm install --save-dev @tauri-apps/cli
```

### Fase 3: Inicializar Tauri

```bash
npx tauri init
```

Configuración sugerida:

- **App name**: Abrazar
- **Window title**: Abrazar
- **Web assets**: `./dist`
- **Dev server**: `http://localhost:19006`

### Fase 4: Configurar `tauri.conf.json`

```json
{
  "build": {
    "beforeDevCommand": "npx expo start --web",
    "beforeBuildCommand": "npx expo export --platform web",
    "devPath": "http://localhost:19006",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Abrazar",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["msi", "deb", "app"],
      "identifier": "com.abrazar.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "windows": [
      {
        "title": "Abrazar",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

---

## Comandos de Build

### Desarrollo

```bash
npm run tauri dev
```

### Producción

#### Windows (MSI)

```bash
npm run tauri build
```

#### macOS (DMG/APP)

```bash
npm run tauri build -- --target universal-apple-darwin
```

#### Linux (DEB/AppImage)

```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

---

## Integraciones Nativas

Tauri permite acceder a APIs del sistema:

### Acceso al Sistema de Archivos

```typescript
import { writeFile, readTextFile } from "@tauri-apps/api/fs";

// Guardar archivo
await writeFile("datos.json", JSON.stringify(data));

// Leer archivo
const contenido = await readTextFile("datos.json");
```

### Notificaciones Nativas

```typescript
import { sendNotification } from "@tauri-apps/api/notification";

sendNotification({
  title: "Abrazar",
  body: "Nuevo caso registrado",
});
```

### Diálogos del Sistema

```typescript
import { open } from "@tauri-apps/api/dialog";

const selected = await open({
  multiple: false,
  filters: [
    {
      name: "Imagen",
      extensions: ["png", "jpg"],
    },
  ],
});
```

---

## Arquitectura Propuesta

```
abrazar-frontend/
├── dist/                  # Build de Expo Web
├── src-tauri/             # Código Rust de Tauri
│   ├── src/
│   │   └── main.rs        # Entry point
│   ├── icons/             # Iconos de la app
│   └── tauri.conf.json    # Configuración
├── app/                   # Código React Native/Web
└── package.json
```

---

## Consideraciones

### Ventajas

- ✅ Binarios pequeños (~5 MB)
- ✅ Mejor rendimiento que Electron
- ✅ Acceso a APIs nativas
- ✅ Multiplataforma (Win/Mac/Linux)

### Desventajas

- ❌ Requiere conocimientos básicos de Rust
- ❌ Menos maduro que Electron
- ❌ Algunas APIs de React Native no funcionan en Web

### Alternativas

Por ahora, considera:

1. **Expo Web** → Deploy como PWA
2. **Electron** → Si necesitas desktop urgente
3. **Tauri** → Para futuro cuando sea crítico

---

## Próximos Pasos

1. Validar que Expo Web funcione correctamente
2. Crear POC con Tauri
3. Documentar setup completo
4. Automatizar builds en CI/CD

---

## Recursos

- [Tauri Documentation](https://tauri.app/)
- [Expo Web Guide](https://docs.expo.dev/workflow/web/)
- [Tauri + React Guide](https://tauri.app/v1/guides/getting-started/setup/react/)
