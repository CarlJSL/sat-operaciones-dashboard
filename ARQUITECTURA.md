# 🏗️ SAT Operaciones Dashboard — Guía de Arquitectura

> Dashboard interno del **Servicio de Administración Tributaria (SAT)**.  
> App web para gestionar usuarios, roles, catálogos y consultar infracciones de tránsito.

---

## 📦 Stack Tecnológico (¿con qué está construido?)

| Capa                | Tecnología                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| **Lenguaje**        | TypeScript 5.9                                                             |
| **Frontend**        | React 19                                                                   |
| **Build**           | Vite 7                                                                     |
| **Estilos**         | Tailwind CSS 4 + shadcn/ui (componentes basados en Radix UI)              |
| **Íconos**          | Lucide React                                                               |
| **Tablas**          | TanStack Table v8                                                          |
| **Gráficos**        | Recharts                                                                   |
| **Enrutamiento**    | react-router-dom v7                                                        |
| **Peticiones HTTP** | Axios con interceptores                                                    |
| **Datos remotos**   | TanStack Query v5 (cache, refetch, sincronización)                         |
| **Estado global**   | Zustand (con persistencia en localStorage)                                 |
| **Formularios**     | react-hook-form + Zod (validación)                                        |
| **Notificaciones**  | sonner (toasts)                                                            |
| **Fechas**          | date-fns                                                                   |
| **Tema oscuro**     | next-themes                                                                |

---

## 🧱 ¿Cómo está organizado el proyecto?

```
sat-operaciones-dashboard/
├── src/
│   ├── app/              # Arranque de la app (entry point, providers, rutas)
│   ├── core/             # Infraestructura base (HTTP, adapters, config)
│   ├── domain/           # Modelos de negocio puros (sin React)
│   ├── features/         # Módulos por funcionalidad (cada uno autocontenido)
│   ├── shared/           # Componentes, hooks y servicios reutilizables
│   ├── components/       # Componentes de UI atómicos (shadcn/ui)
│   ├── styles/           # Estilos globales (Tailwind + variables CSS)
│   └── assets/           # Imágenes, fuentes, iconos
├── .env.development      # Variables de entorno para desarrollo
├── .env.mock             # Variables de entorno con mocks
├── vite.config.ts        # Configuración de Vite
└── package.json
```

---

## 🧩 Capas del proyecto (explicadas simple)

### 1️⃣ `domain/` — El corazón del negocio

Aquí viven los **tipos y modelos de datos** tal como los entiende la app.  
No dependen de React, ni de Axios, ni de ninguna librería. Son solo interfaces y clases TypeScript.

```
domain/
├── auth/          # AuthUser, LoginResponse, formularios de login/recuperación
├── enums/         # Catálogos fijos (estados, días, tipos de operación)
├── models/        # Usuario, catálogo, paginación, dashboard, empresa
└── roles/         # Códigos de rol (ADMIN, CLIENTE, VENDEDOR), menús, permisos
```

> **Regla de oro**: Lo que está en `domain/` NO puede importar nada de `core/`, `features/` ni `shared/`.

---

### 2️⃣ `core/` — Los cimientos técnicos

Todo lo que la app necesita para funcionar: conexión al backend, utilidades, configuración.

```
core/
├── adapters/       # Traductores backend → app (convierten la respuesta del backend a nuestros modelos)
│   ├── auth.adapter.ts
│   └── menu.adapter.ts
├── config/         # Variables de entorno validadas con Zod
│   └── environment.ts
└── lib/            # Librerías base
    ├── api.ts              # Axios configurado (con interceptores)
    ├── http-base.ts        # Clase genérica para CRUD (search, find, saveOrUpdate, remove...)
    ├── utils.ts            # cn() para clases CSS, isColorDark()
    └── interceptor/
        └── error-handler.ts # Manejador centralizado de errores HTTP
```

**¿Qué hace cada cosa?**

- **`api.ts`**: Crea una instancia de Axios que automáticamente inyecta el token JWT en cada petición y captura errores globalmente.
- **`http-base.ts`**: Una clase genérica que ya trae métodos `search`, `find`, `getById`, `saveOrUpdate`, `remove`, `init`. Los servicios de cada feature heredan de esta clase y solo agregan métodos extra.
- **`adapters/`**: Transforman la respuesta "fea" del backend a nuestros modelos "bonitos" del dominio.

---

### 3️⃣ `features/` — Las funcionalidades de negocio

Cada funcionalidad grande vive en su propia carpeta. Esto hace que el código sea **modular y fácil de mantener**.

```
features/
├── auth/                # Login, registro, recuperación de contraseña
│   ├── api/auth.service.ts        # Llamadas al backend (/auth/login, /auth/logout...)
│   ├── components/                # Formularios de login, registro, olvido de clave
│   ├── pages/                     # Páginas públicas (Login, ForgotPassword, VerifyCode...)
│   ├── store/authStore.ts         # Estado global de autenticación (Zustand)
│   ├── ProtectedRoute.tsx         # Componente que protege rutas
│   └── mock-auth.ts               # Mock para desarrollo
│
├── usuario/             # ABM de usuarios (solo acceso interno)
│   ├── hooks/useUsuarioLista.ts   # Toda la lógica de la página
│   ├── components/                # Columnas de tabla, formularios, modales
│   └── pages/usuario-lista.tsx    # Página de listado
│
├── catalogo/            # Gestión de catálogos/maestros
│   ├── hooks/
│   ├── components/
│   └── pages/
│
├── rol/                 # Gestión de roles y permisos
│   ├── hooks/
│   ├── components/
│   └── pages/
│
└── consulta-en-linea/   # Consulta pública de papeletas de infracción
    └── pages/
        ├── ConsultaEnLineaOptionsPage.tsx   # Pantalla de selección (búsqueda o chatbot)
        └── ConsultaPapeletaPage.tsx         # Búsqueda y seguimiento de papeleta
```

**Estructura típica de una feature:**

```
mifeature/
├── api/             # Llamadas HTTP al backend
├── components/      # Componentes visuales propios de esta feature
├── hooks/           # Lógica de negocio encapsulada en custom hooks
├── pages/           # Páginas completas (1 archivo = 1 ruta)
└── store/           # Estado global específico (si aplica)
```

---

### 4️⃣ `shared/` — Lo que se reutiliza en varias features

```
shared/
├── components/        # Componentes reutilizables
│   ├── DataTable.tsx, DataToolbar.tsx, DataPagination.tsx  # Tablas
│   ├── FiltroDrawer.tsx      # Drawer de filtros avanzados
│   ├── Modal.tsx, alertContainer.tsx, confirmContainer.tsx  # Modales
│   └── layout/               # DashboardLayout, AppHeader, Sidebar
├── hooks/
│   ├── useListPage.ts        # Hook genérico para páginas de listado
│   └── use-mobile.ts         # Detectar si es dispositivo móvil
├── services/
│   ├── usuario.service.ts    # Servicio de usuarios (extiende HttpBase)
│   ├── rol.service.ts        # Servicio de roles
│   ├── catalogo.service.ts   # Servicio de catálogos
│   ├── access.service.ts     # Servicio de control de acceso
│   └── alert.service.ts      # Servicio para mostrar alertas globales
├── store/           # Estado global compartido
│   ├── alertStore.ts         # Alertas emergentes
│   ├── confirmStore.ts       # Confirmaciones (¿estás seguro?)
│   └── successStore.ts       # Mensajes de éxito
├── types/           # Tipos compartidos
└── mocks/           # Datos mock (menu.mock.ts)
```

---

### 5️⃣ `components/ui/` — Los ladrillos visuales (shadcn/ui)

Son componentes atómicos, genéricos y reutilizables: Button, Input, Dialog, Select, Table, Sidebar, Badge, Card, etc.

Fueron generados con `npx shadcn add` y usan **Radix UI** (accesibilidad) + **class-variance-authority** (variantes) + **tailwind-merge** (fusión de clases).

---

### 6️⃣ `app/` — El punto de partida

```
app/
├── main.tsx              # Entrada de la app (renderiza <App />)
├── app.tsx               # Componente raíz: proveedores (QueryClient) + router + toasters
├── router.tsx            # Definición de todas las rutas (HashRouter)
└── providers/QueryProvider.ts  # Configuración de TanStack Query
```

---

## 🔄 ¿Cómo fluyen los datos?

```
🧑‍💻 Usuario interactúa
       ↓
📄 Page (vista, solo JSX)
       ↓
🎣 useFeatureHook (toda la lógica)
    ├── 📋 react-hook-form (formularios, filtros)
    ├── 🔄 TanStack Query (datos del servidor)
    │       ↓
    └── 🛠️ Service (api/ o shared/services/)
              ↓
          📡 HttpBase (core/lib/http-base.ts)
              ↓
          🔌 Axios (core/lib/api.ts) — inyecta JWT, maneja errores
              ↓
          🔄 Adapter (core/adapters/) — transforma DTO → Modelo de dominio
              ↓
          🧠 Modelo de dominio (domain/)
```

Para **estado global** (no del servidor):
- `Zustand` guarda: autenticación, alertas, confirmaciones, modales
- `Zustand persist` guarda el token y usuario en localStorage

---

## 🗺️ Mapa de Rutas

### Rutas Públicas (sin login)

| Ruta                          | Página                          |
| ----------------------------- | ------------------------------- |
| `/inicio`                     | Página inicial (selección)      |
| `/consulta-en-linea`          | Opciones de consulta            |
| `/consulta-en-linea/papeletas`| Búsqueda y seguimiento de PIT   |
| `/notificame/registro`        | Formulario de registro          |
| `/notificame/confirmacion`    | Confirmación de registro        |
| `/login`                      | Inicio de sesión                |
| `/forgot-password`            | Olvido de contraseña            |
| `/verify-code`                | Verificación de código OTP      |
| `/reset-password`             | Restablecer contraseña          |
| `/unauthorized`               | Sin permisos                    |

### Rutas Protegidas (requieren login)

Todas pasan por `ProtectedRoute` → `DashboardLayout` (sidebar + header):

| Ruta                       | Página                 |
| -------------------------- | ---------------------- |
| `/usuarios`                | Listado de usuarios    |
| `/catalogo`                | Catálogos              |
| `/catalogo/:id/subitems`   | Subitems de catálogo   |
| `/roles`                   | Gestión de roles       |

---

## 🧪 ¿Cómo se maneja el estado?

| Tipo de estado           | Herramienta      | ¿Dónde vive?                                 |
| ------------------------ | ---------------- | -------------------------------------------- |
| Datos del servidor       | TanStack Query   | Hooks de features (`useQuery`, `useMutation`) |
| UI global (alertas, etc) | Zustand          | `shared/store/`                               |
| Autenticación            | Zustand+persist  | `features/auth/store/authStore.ts`            |
| Formularios              | react-hook-form  | Dentro de los componentes/hooks               |

---

## 🛡️ Autenticación y Permisos

1. El usuario hace login → el backend devuelve un **token JWT** + datos del usuario
2. Se guarda en **Zustand** (persistido en localStorage)
3. Cada petición HTTP **inyecta el token** automáticamente (interceptor de Axios)
4. `ProtectedRoute` verifica que el usuario esté autenticado antes de mostrar rutas privadas
5. El **menú lateral** se carga dinámicamente según el rol del usuario (`usuarioService.loadMenu()`)
6. Los roles disponibles: `ADMIN`, `CLIENTE`, `VENDEDOR`

---

## 📡 Comunicación con el Backend

- **Base URL**: configurable por entorno (`VITE_BASE_URL`)
- **Formato**: JSON
- **Autenticación**: Bearer Token (JWT) en header `Authorization`
- **Interceptores**:
  - **Request**: agrega el token automáticamente
  - **Response**: captura errores y muestra mensajes amigables (sesión expirada, sin permisos, etc.)
- **Métodos CRUD genéricos**: `search`, `find`, `getById`, `saveOrUpdate`, `remove`, `init`
- **Modo mock**: activable con `VITE_MOCK_AUTH=true` y `VITE_MOCK_MENU=true`

---

## 🧠 Patrón de las páginas de listado (CRUD)

Cada pantalla de listado (ej. Usuarios, Roles, Catálogos) sigue siempre la misma receta:

```
📄 pages/mi-pagina.tsx
    → Solo layout y JSX. Llama al hook y pasa datos a los componentes.
    
🎣 hooks/useMiLista.ts
    → Toda la lógica: fetching, paginación, búsqueda, filtros, modales.
    
📊 components/columns.tsx
    → Define las columnas de la tabla (TanStack Table).
    
📋 components/modal/crear-modal.tsx
📋 components/modal/editar-modal.tsx
📋 components/modal/detalle-modal.tsx
    → Modales para CRUD.
```

---

## ✨ Convenciones de código

### Nombres

| Tipo           | Ejemplo                        | Regla                           |
| -------------- | ------------------------------ | ------------------------------- |
| Archivos       | `usuario-lista.tsx`            | kebab-case                      |
| Componentes    | `UsuarioListaPage`             | PascalCase                      |
| Hooks          | `useUsuarioLista`              | camelCase con prefijo `use`     |
| Servicios      | `usuarioService`               | camelCase                       |
| Stores         | `useAuthStore`                 | camelCase + `use` + `Store`     |
| Interfaces     | `AuthUser`, `LoginResponse`    | PascalCase                      |
| DTOs           | `LoginRequestDTO`              | sufijo `DTO`                    |
| Adaptadores    | `authAdapter`                  | sufijo `Adapter`                |

### Imports (orden)

1. React y librerías externas
2. Módulos internos (`@/...`)
3. Tipos (`import type`)

---

## 🔧 Scripts disponibles

```bash
npm run dev          # Desarrollo normal
npm run dev:mock     # Desarrollo con datos mock
npm run dev:qa       # Desarrollo contra QA
npm run build        # Build para producción
npm run build:qa     # Build para QA
npm run lint         # ESLint + TypeScript
npm run preview      # Previsualizar build local
```

---

## 🌍 Variables de entorno

| Variable                 | ¿Qué hace?                               |
| ------------------------ | ---------------------------------------- |
| `VITE_VERSION`           | Versión de la app                        |
| `VITE_PRODUCTION`        | Modo producción (true/false)             |
| `VITE_CREDENTIALS_KEY`   | Clave para encriptar credenciales        |
| `VITE_PATH_PARAMS_KEY`   | Clave para parámetros de ruta            |
| `VITE_OAUTH_STORAGE_KEY` | Key para storage de OAuth                |
| `VITE_MOCK_AUTH`         | Usar mock de autenticación (true/false)  |
| `VITE_MOCK_MENU`         | Usar menú mock (true/false)              |
| `VITE_BASE_URL`          | URL base de la API                       |
| `API_TARGET`             | Target del proxy (solo dev, no se expon) |

Se validan al arrancar con Zod. Si falta alguna crítica, la app muestra un error claro.

---

## 🎨 Estilos y temas

- **Fuente**: Poppins (Light 300, Regular 400, SemiBold 600, Bold 700)
- **Color primario**: Azul institucional `#194067` / `#1a4a84`
- **Colores de estado**: verde (activo/success), rojo (inactivo/destructive), ámbar (en proceso), gris (cerrado/default)
- **Sidebar**: azul oscuro en item activo, iconos colapsables
- **Soporte dark mode**: vía `next-themes` + variables CSS en `.dark`
- **Componentes**: estilo **New York** de shadcn (bordes redondeados `0.625rem`)
- Utilidad `cn()` para combinar clases sin conflictos

---

## 📁 Nuevas features (Consulta en Línea + Notifícame)

### Consulta en Línea

Flujo público para que ciudadanos consulten sus papeletas de infracción:

1. **`ConsultaEnLineaOptionsPage`**: Pantalla con dos opciones:
   - Buscar por número de papeleta (PIT)
   - Chatbot vía WhatsApp (`wa.me/51999431111`)
2. **`ConsultaPapeletaPage`**: Búsqueda + visualización del **flujo de seguimiento**:
   - **PAS** (Procedimiento Administrativo Sancionador): 5 pasos (Inicio → Informe → Notificación → Resolución → Sanción Firme)
   - **PEC** (Ejecución Coactiva): 2 pasos adicionales si hay deuda
   - Resumen de deuda, descuento activo, botón de pago y reclamo

Actualmente usa **datos mock** — la conexión real al backend está por implementarse.

### Notifícame

Servicio de notificaciones digitales para ciudadanos:

1. **Registro**: formulario con tipo documento, documento, teléfono, correo, términos y captcha
2. **Confirmación**: pantalla de éxito con indicadores visuales
3. El flujo completo navega: `/notificame/registro` → `/verify-code` → `/notificame/confirmacion`

---

## ✅ Resumen rápido para nuevos desarrolladores

> **"¿Por dónde empiezo?"**

1. Si quieres **agregar una página de listado** (ej. listar X): copia la estructura de `features/usuario/` (hook + page + columns + modales)
2. Si quieres **agregar una página pública**: crea la feature en `features/`, agrega la ruta en `app/router.tsx`
3. Si quieres **llamar al backend**: usa los servicios existentes en `shared/services/` o crea uno nuevo que extienda `HttpBase`
4. Si quieres **un nuevo componente UI**: usa los de `components/ui/` o crea uno con shadcn (`npx shadcn add`)
5. Si quieres **agregar estado global**: crea un store Zustand en `shared/store/`
