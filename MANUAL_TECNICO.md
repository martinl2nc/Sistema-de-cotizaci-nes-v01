# Manual Técnico — Sistema de Gestión de Cotizaciones

> Versión 1.0 | Marzo 2026

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Base de Datos (Supabase)](#4-base-de-datos-supabase)
5. [Frontend (React)](#5-frontend-react)
6. [Automatización (n8n)](#6-automatización-n8n)
7. [Generación de PDFs](#7-generación-de-pdfs)
8. [Autenticación y Roles](#8-autenticación-y-roles)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Flujo Completo de una Cotización](#10-flujo-completo-de-una-cotización)
11. [Workflows de n8n](#11-workflows-de-n8n)

---

## 1. Visión General

Sistema web para gestión integral de cotizaciones comerciales. Permite crear, editar, generar PDFs, enviar por correo y hacer seguimiento de cotizaciones. Integra un frontend React con Supabase como backend y n8n para automatización de correos y notificaciones.

**Módulos principales:**
- Dashboard con KPIs y gráficos
- Gestión de cotizaciones (CRUD completo)
- Generación y envío de PDFs por correo (Gmail vía n8n)
- Seguimiento automático de cotizaciones próximas a vencer
- Gestión de clientes y catálogo de productos
- Configuración de empresa (logo, datos, cuentas bancarias)

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19.2.4 | Framework UI |
| Vite | 8.0.0 | Build tool |
| TypeScript | 5.9.3 | Tipado estático |
| Tailwind CSS | 4.2.1 | Estilos |
| React Router | 7.13.1 | Enrutamiento |
| TanStack React Query | 5.91.2 | Estado del servidor y caché |
| React Hook Form | 7.71.2 | Formularios |
| Zod | - | Validación de esquemas |
| @react-pdf/renderer | 4.3.2 | Generación de PDFs en cliente |
| Recharts | 3.8.0 | Gráficos del dashboard |
| Iconify | - | Librería de iconos |

### Backend / Infraestructura
| Tecnología | Uso |
|-----------|-----|
| Supabase (PostgreSQL) | Base de datos, Auth, Storage |
| Row Level Security (RLS) | Control de acceso a datos |
| Supabase Storage | Almacenamiento de logos |
| n8n (self-hosted) | Automatización de workflows |
| Gmail API (via n8n) | Envío de correos |

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│                                                     │
│  Pages → Hooks (React Query) → Services → Supabase │
└─────────────────┬───────────────────────────────────┘
                  │ Webhooks HTTP
                  ▼
┌─────────────────────────────────────────────────────┐
│                   n8n (Self-hosted)                 │
│                                                     │
│  Webhook → Procesar → Gmail API → Actualizar BD     │
└─────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│               SUPABASE (PostgreSQL)                 │
│                                                     │
│  Auth │ Database │ Storage │ RLS Policies           │
└─────────────────────────────────────────────────────┘
```

### Capas del Frontend

```
Capa 4 — Páginas/Componentes React
         DashboardPage, QuotesList, QuoteForm, ClientsPage...
              ↓
Capa 3 — Custom Hooks
         useQuotes, useClients, useProducts, useDashboardStats...
              ↓
Capa 2 — React Query (TanStack)
         Caché, invalidación, mutaciones, estado loading/error
              ↓
Capa 1 — Services
         quotes.service.ts, clients.service.ts, webhook.service.ts...
              ↓
Capa 0 — Supabase Client
         supabaseClient.ts → conexión a la BD
```

---

## 4. Base de Datos (Supabase)

### Diagrama de Relaciones

```
perfiles_usuario (1) ──────────────── (N) cotizaciones
clientes         (1) ──────────────── (N) cotizaciones
cotizaciones     (1) ──────────────── (N) cotizaciones_lineas
productos        (1) ──────────────── (N) cotizaciones_lineas
categorias       (1) ──────────────── (N) productos
empresa_configuracion                     (singleton)
```

### Tabla: `cotizaciones`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Identificador único |
| `numero_correlativo` | serial | Número secuencial auto-incremental |
| `cliente_id` | uuid FK | → clientes.id |
| `vendedor_id` | uuid FK | → perfiles_usuario.id |
| `origen` | text | `'Manual'` o `'woocommerce'` |
| `woo_order_id` | int | ID de orden en WooCommerce (nullable) |
| `fecha_emision` | date | Fecha de creación |
| `fecha_validez` | date | Fecha de vencimiento |
| `estado` | text | `Borrador`, `PDF Generado`, `Enviada`, `Aprobada`, `Cancelada` |
| `observaciones_pdf` | text | Notas impresas en el PDF |
| `aplica_igv` | bool | Si aplica IGV 18% |
| `subtotal` | numeric | Suma de líneas |
| `descuento_global_monto` | numeric | Descuento total aplicado |
| `igv_monto` | numeric | Monto de IGV calculado |
| `total_final` | numeric | Total a cobrar |
| `seguimiento_automatico` | bool | Activa seguimiento automático por n8n |
| `fecha_creacion` | timestamptz | Timestamp de creación |
| `ultima_actualizacion` | timestamptz | Timestamp de última modificación |

### Tabla: `cotizaciones_lineas`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Identificador único |
| `cotizacion_id` | uuid FK | → cotizaciones.id |
| `producto_id` | uuid FK | → productos.id (nullable) |
| `nombre_producto_historico` | text | Nombre congelado al momento de cotizar |
| `cantidad` | numeric | Cantidad |
| `precio_unitario` | numeric | Precio en el momento de la cotización |
| `descuento_linea_monto` | numeric | Descuento por línea |
| `subtotal_linea` | numeric | (cantidad × precio) − descuento |

### Tabla: `clientes`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `tipo_documento` | text | RUC, DNI, Pasaporte, etc. |
| `numero_documento` | text UNIQUE | Número de documento |
| `razon_social` | text | Nombre de empresa |
| `nombres_contacto` | text | Nombre de la persona de contacto |
| `apellidos_contacto` | text | Apellidos del contacto |
| `email` | text UNIQUE | Correo electrónico |
| `telefono` | text | Teléfono |
| `direccion` | text | Dirección |
| `comprobante_preferido` | text | Factura o Boleta |
| `activo` | bool | Si está activo en el sistema |
| `fecha_creacion` | timestamptz | |

### Tabla: `productos`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `woo_product_id` | int | ID en WooCommerce (opcional) |
| `sku` | text UNIQUE | Código de producto |
| `nombre` | text | Nombre del producto/servicio |
| `descripcion` | text | Descripción |
| `categoria_id` | uuid FK | → categorias.id |
| `precio_base` | numeric | Precio de referencia |
| `activo` | bool | Si está activo |
| `fecha_creacion` | timestamptz | |

### Tabla: `perfiles_usuario`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Mismo UUID que auth.users de Supabase |
| `email` | text UNIQUE | Correo del usuario |
| `nombre` | text | Nombre del vendedor/admin |
| `rol` | enum | `'admin'` o `'vendedor'` |
| `activo` | bool | Si el usuario está activo |

### Tabla: `empresa_configuracion` (Singleton)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `razon_social` | text | Nombre de la empresa |
| `ruc` | text | RUC de la empresa |
| `direccion` | text | Dirección |
| `cuentas_bancarias` | json | Array de cuentas bancarias para PDF |
| `terminos_condiciones` | text | Texto de T&C para PDF |
| `logo_url` | text | URL del logo en Supabase Storage |

### Fórmulas de Cálculo

```
subtotal           = SUM(cantidad × precio_unitario − descuento_linea_monto)
total_con_descuento = subtotal − descuento_global_monto
igv_monto          = total_con_descuento × 0.18  (si aplica_igv = true, sino 0)
total_final        = total_con_descuento + igv_monto
```

### Row Level Security (RLS)

| Tabla | Admin | Vendedor |
|-------|-------|---------|
| cotizaciones | Todas | Solo las propias (vendedor_id = auth.uid()) |
| clientes | Todas | Lectura + Crear |
| productos | Todas | Solo lectura |
| categorias | Todas | Solo lectura |
| perfiles_usuario | Todas | Solo el propio perfil |
| empresa_configuracion | Lectura/Escritura | Solo lectura |

### Storage

- **Bucket**: `company-assets`
- **Uso**: Logo de empresa
- **Acceso**: Público para lectura, autenticado para escritura

---

## 5. Frontend (React)

### Rutas

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/login` | LoginPage | Público |
| `/` | DashboardPage | Admin + Vendedor |
| `/cotizaciones` | QuotesList | Admin + Vendedor |
| `/cotizaciones/nueva` | QuoteForm | Admin + Vendedor |
| `/cotizaciones/editar/:id` | QuoteForm | Admin + Vendedor |
| `/admin/clientes` | ClientsPage | Admin |
| `/admin/productos` | ProductsPage | Admin |
| `/admin/empresa` | CompanyConfigPage | Admin |

### Hooks Principales

```typescript
// Cotizaciones
useQuotes()                    // Lista completa con filtros
useQuoteDetail(id)             // Detalle de una cotización
useSaveQuote()                 // Crear o actualizar
useDeleteQuote()               // Eliminar
useUpdateQuoteStatus()         // Cambiar estado
useUpdateQuoteFollowup()       // Toggle seguimiento automático
useSendQuoteWebhook()          // Enviar a n8n

// Clientes
useClientsList()               // Lista completa
useActiveClientsList()         // Solo activos (para selectores)
useCreateClient()
useUpdateClient()
useDeleteClient()
useToggleClientActive()

// Productos
useProductsList()
useCreateProduct()
useUpdateProduct()
useToggleProductActive()

// Otros
useSellersList()               // Lista de vendedores para selectores
useCompanyConfig()             // Datos de empresa
useDashboardStats()            // KPIs y gráficos
useCategoriesList()            // Categorías de productos
```

### Estructura de Archivos Clave

```
frontend/src/
├── pages/
│   ├── dashboard/DashboardPage.tsx
│   ├── quotes/
│   │   ├── QuotesList.tsx
│   │   ├── QuoteForm.tsx
│   │   └── QuotePDFTemplate.tsx
│   └── admin/
│       ├── ClientsPage.tsx
│       ├── ProductsPage.tsx
│       └── CompanyConfigPage.tsx
├── hooks/
│   ├── useQuotes.ts
│   ├── useClients.ts
│   ├── useProducts.ts
│   ├── useSellers.ts
│   ├── useCompanyConfig.ts
│   ├── useDashboardStats.ts
│   └── useCategories.ts
├── services/
│   ├── quotes.service.ts
│   ├── clients.service.ts
│   ├── products.service.ts
│   ├── dashboard.service.ts
│   ├── webhook.service.ts
│   ├── companyConfig.service.ts
│   ├── sellers.service.ts
│   └── categories.service.ts
└── context/
    └── AuthContext.tsx
```

---

## 6. Automatización (n8n)

### Workflow: Envío de PDF al cliente

**Trigger:** Webhook POST desde el frontend al generar cotización

**Flujo:**
```
Webhook (POST) → Validar estado PDF Generado → Obtener cotización completa
→ Preparar metadatos → Obtener datos del cliente
→ Gmail: Enviar correo con PDF adjunto
```

**Payload recibido por n8n:**
```json
{
  "pdfBase64": "JVBERi0x...",
  "pdfFilename": "COT-00013.pdf",
  "correoCliente": "cliente@empresa.com",
  "nombreCliente": "Empresa SAC",
  "numeroCorrelativo": "COT-00013",
  "vendedorNombre": "Juan Pérez",
  "totalFinal": 177.00,
  "fechaEmision": "2026-03-24"
}
```

### Workflow: Seguimiento Automático (Trigger Diario)

**Trigger:** Schedule Trigger — todos los días a las 9:00 AM (cron: `0 9 * * *`)

**Flujo:**
```
Trigger Diario
→ Calcular Fecha (hoy + 2 días con JavaScript)
→ Buscar Cotizaciones (Supabase: estado = 'Enviada')
→ Obtener Cliente (Supabase: datos por cliente_id)
→ Preparar Email (Code node: construir HTML)
→ Enviar Email (Gmail)
```

**Lógica de filtrado:**
- Solo cotizaciones con `estado = 'Enviada'`
- Solo las que tengan `fecha_validez = hoy + 2 días`
- Solo las que tengan `seguimiento_automatico = true`

**Nota técnica:** El nodo Supabase v1 de n8n tiene un bug con múltiples filtros en `getAll` (genera operadores incorrectos). El filtro de `fecha_validez` y `seguimiento_automatico` se aplica en un Code node de JavaScript separado.

### Credenciales Requeridas en n8n

| Credencial | Uso |
|-----------|-----|
| `Supabase account 2` | Acceso a la BD de Supabase |
| `Gmail Magenta account` | Envío de correos via Gmail OAuth2 |

---

## 7. Generación de PDFs

**Librería:** `@react-pdf/renderer` (renderizado 100% en el cliente, sin servidor)

**Componente:** `QuotePDFTemplate.tsx`

### Estructura del PDF

```
┌──────────────────────────────────────────┐
│  LOGO     │  Descripción  │ COT-00013    │
│  Empresa  │  empresa      │ [caja azul]  │
├──────────────────────────────────────────┤
│  Datos del Cliente  │  Datos Cotización  │
│  RUC, Razón Social  │  Fecha, Vendedor   │
│  Email, Teléfono    │  Validez, Obs.     │
├──────────────────────────────────────────┤
│ Cant │ Descripción │ SKU │ P.Unit │ Sub  │
│  2   │ Producto A  │ ... │ 75.00  │ 150  │
├──────────────────────────────────────────┤
│                      Subtotal:   150.00  │
│                      IGV 18%:     27.00  │
│                      TOTAL:      177.00  │
├──────────────────────────────────────────┤
│  Observaciones  │  Validez y condiciones │
├──────────────────────────────────────────┤
│         Cuentas Bancarias                │
│  Banco │ Tipo │ Moneda │ Número          │
└──────────────────────────────────────────┘
```

### Proceso de Generación

1. Usuario hace clic en "Generar y Enviar PDF"
2. Frontend valida: cliente seleccionado + al menos 1 línea
3. `@react-pdf/renderer` renderiza el PDF en memoria del navegador
4. PDF se descarga automáticamente como `COT-XXXXX.pdf`
5. PDF se codifica en base64
6. Se envía el base64 + metadatos al webhook de n8n
7. n8n envía el correo con el PDF adjunto via Gmail

---

## 8. Autenticación y Roles

**Provider:** Supabase Auth (JWT)

### Flujo de Login

```
1. Usuario ingresa email + contraseña en /login
2. Supabase Auth valida y devuelve JWT + user object
3. AuthContext carga el perfil desde tabla perfiles_usuario
4. Context expone: user, session, profile, role
5. ProtectedRoute verifica rol antes de renderizar cada página
```

### Roles

| Rol | Acceso |
|-----|--------|
| `admin` | Dashboard, Cotizaciones (todas), Clientes, Productos, Empresa |
| `vendedor` | Dashboard (sus datos), Cotizaciones (solo propias) |

### AuthContext

```typescript
// Propiedades disponibles en el contexto
{
  user: User | null,
  session: Session | null,
  profile: {
    id: string,
    nombre: string,
    email: string,
    rol: 'admin' | 'vendedor',
    activo: boolean
  } | null,
  loading: boolean,
  signIn: (email, password) => Promise<void>,
  signOut: () => Promise<void>
}
```

---

## 9. Variables de Entorno

Crear archivo `.env` en la raíz de `/frontend`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_N8N_WEBHOOK_URL=https://tu-n8n.dominio.com/webhook/xxxxx
```

---

## 10. Flujo Completo de una Cotización

```
1. CREACIÓN
   ├─ Manual: Vendedor → /cotizaciones/nueva
   └─ Se guarda con estado "Borrador"

2. EDICIÓN
   ├─ Seleccionar cliente (o crear uno nuevo en modal)
   ├─ Asignar vendedor
   ├─ Agregar productos del catálogo
   ├─ Aplicar descuentos e IGV
   └─ Guardar → estado permanece "Borrador"

3. GENERACIÓN PDF
   ├─ Click "Generar y Enviar PDF"
   ├─ @react-pdf/renderer renderiza el PDF
   ├─ PDF se descarga localmente
   └─ Estado → "PDF Generado"

4. ENVÍO AL CLIENTE
   ├─ Frontend envía webhook a n8n (PDF base64 + datos)
   ├─ n8n envía correo con PDF adjunto via Gmail
   └─ Estado → "Enviada"

5. SEGUIMIENTO AUTOMÁTICO
   ├─ Si seguimiento_automatico = true
   ├─ n8n ejecuta workflow diario a las 9 AM
   ├─ Detecta cotizaciones que vencen en 2 días
   └─ Envía recordatorio por correo al cliente

6. CIERRE
   ├─ Aprobada: Cliente acepta → cambio manual de estado
   └─ Cancelada: Rechazada → cambio manual de estado
```

---

## 11. Workflows de n8n

### Workflow 1: Envío de PDF (Webhook)

**Nodos:**
| Nodo | Tipo | Función |
|------|------|---------|
| Webhook | Webhook | Recibe POST con PDF base64 |
| If | IF | Verifica que estado = "PDF Generado" |
| Get a row | Supabase | Obtiene cotización completa |
| Edit Fields | Set | Mapea campos necesarios |
| Get a row1 | Supabase | Obtiene líneas de la cotización |

**Nodo paralelo — envío email:**
| Nodo | Tipo | Función |
|------|------|---------|
| Webhook1 | Webhook | Recibe PDF + datos del cliente |
| Convert to File | File | Convierte base64 a archivo binario |
| Edit Fields1 | Set | Mapea correo, nombre, número |
| Send a message | Gmail | Envía correo con PDF adjunto |

### Workflow 2: Seguimiento Automático (Schedule)

**Nodos:**
| Nodo | Tipo | Función |
|------|------|---------|
| Seguimiento: Trigger Diario | Schedule | Cron `0 9 * * *` |
| Seguimiento: Calcular Fecha | Code | Calcula fecha = hoy + 2 días |
| Seguimiento: Buscar Cotizaciones | Supabase | getAll donde estado = 'Enviada' |
| Seguimiento: Obtener Cliente | Supabase | get de tabla clientes por cliente_id |
| Seguimiento: Preparar Email | Code | Construye HTML del correo |
| Seguimiento: Enviar Email | Gmail | Envía recordatorio de vencimiento |

**Nota:** El filtro de `fecha_validez` y `seguimiento_automatico` se aplica en el nodo "Preparar Email" (Code node) debido a un bug del nodo Supabase v1 con múltiples filtros.
