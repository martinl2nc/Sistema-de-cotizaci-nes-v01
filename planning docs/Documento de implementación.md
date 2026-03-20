# 🚀 PLAN DE IMPLEMENTACIÓN: SISTEMA DE COTIZACIONES (ERP/CRM)

**Arquitectura:** Supabase (BD) + React + Vite SPA (Frontend) + n8n (Middleware) + APITemplate (PDF) + Gmail.

---

## FASE 1: Diseño de la Base de Datos (Supabase / PostgreSQL)

Para garantizar la integridad de tus datos (que las cotizaciones antiguas no cambien si modificas un precio hoy), crearemos 7 tablas con relaciones estrictas.

### 1. Tablas de Catálogo y Configuración

* **`empresa_configuracion`**: (Solo tendrá 1 fila).
  * Columnas: `id`, `razon_social`, `ruc`, `direccion`, `cuentas_bancarias`, `terminos_condiciones`. *(Esto te permite cambiar los textos estáticos del PDF desde la Aplicación React sin tocar código).*
* **`vendedores`**:
  * Columnas: `id`, `nombre`, `email`, `activo` (Boolean).
* **`categorias`**:
  * Columnas: `id`, `nombre`.
* **`productos`**:
  * Columnas: `id`, `woo_product_id` *(Para futura sincronización)*, `sku`, `nombre`, `descripcion`, `categoria_id` (Foreign Key), `precio_base`, `activo` (Boolean - *Nunca borraremos productos, solo los pondremos en falso*).

### 2. Tablas de Operación (Clientes y Cotizaciones)

* **`clientes`**: *(Estructura adaptada a B2B y B2C desde WooCommerce)*
  * Columnas: `id`, `tipo_documento` (RUC/DNI), `numero_documento`, `razon_social` *(Puede estar vacío en personas naturales)*, `nombres_contacto`, `apellidos_contacto`, `email`, `telefono`, `direccion`, `comprobante_preferido` (Factura/Boleta).
* **`cotizaciones`**: *(La cabecera de la transacción)*
  * Columnas: `id`, `numero_correlativo` *(Para generar COT-001)*, `origen` *(Web/Manual)*, `woo_order_id`, `cliente_id`, `vendedor_id`, `fecha_emision`, `fecha_validez` (Calculada a +15 días), `estado` (Por Revisar, Generar PDF, Enviada, Cancelada), `observaciones_pdf` *(Notas dinámicas para el documento)*.
  * *Cálculos congelados:* `aplica_igv` (Boolean), `subtotal`, `descuento_global_monto`, `igv_monto`, `total_final`.
* **`cotizaciones_lineas`**: *(El detalle de los productos)*
  * Columnas: `id`, `cotizacion_id`, `producto_id` *(Opcional, permite productos personalizados que no están en el catálogo)*, `nombre_producto_historico` *(Guarda el nombre al momento de la venta)*.
  * *Matemática de la línea:* `cantidad`, `precio_unitario` *(Copiado del catálogo al momento de crear)*, `descuento_linea_monto`, `subtotal_linea` `(Cantidad * (Precio_unitario - Descuento))`.

---

## FASE 2: Desarrollo del Frontend (React + Vite SPA)

Crearás una aplicación de página única (SPA) con React y Vite, estilizada con Tailwind CSS y alojada como archivos estáticos en SiteGround.

### Módulo 1: Autenticación y Layout
* **Login/Registro:** Conexión directa con Supabase Auth.
* **Layout Principal:** Menú de navegación lateral o superior para acceder a Catálogos y Cotizaciones.

### Módulo 2: Administrador de Catálogos (CRUD)
Una sección para gestionar los datos maestros del sistema:
* Gestión de Productos y Categorías.
* Configuración de la Empresa (Textos del PDF).
* Clientes y Vendedores.

### Módulo 3: Gestor de Cotizaciones (Dashboard)
* Tabla interactiva conectada a la vista de `cotizaciones` en Supabase.
* Filtros: Por Vendedor, Estado, Rango de fechas.
* Botón de acción: **"Crear / Editar Cotización"**.

### Módulo 4: Creador/Editor de Cotización (Maestro-Detalle)
* **Cabecera:** Selectores para Cliente y Vendedor. Toggle para "Aplicar IGV 18%".
* **Detalle (Formulario Dinámico):**
  * Selector de Productos que autocompleta precio y nombre al elegir un ítem del catálogo.
  * Capacidad para añadir ítems "personalizados" sin guardarlos en el catálogo oficial.
* **Totales en tiempo real:** Cálculo automático de Subtotal, Descuentos, y (si aplica) el 18% de IGV.
* **Botones de Acción:**
  * **"Guardar Borrador":** Actualiza cabecera y líneas en la base de datos de Supabase.
  * **"Generar y Enviar PDF":** Ejecuta el cambio de estado a 'Generar PDF' para que el Webhook dispare el envío.

---

## FASE 3: Automatizaciones (n8n Self-hosted)

Configurarás dos flujos separados (Workflows):

### Workflow 1: Entrada desde WooCommerce (El caso web)

1. **Trigger:** Nodo Webhook. En WooCommerce configuras que al crearse un pedido (o solicitud de cotización), envíe los datos a la URL de este nodo.
2. **Nodo Postgres (Supabase):** Busca el **RUC o DNI** en la tabla `clientes`. Si no existe, lo inserta (mapeando `Company` a `razon_social` y `First/Last Name` a los nombres de contacto).
3. **Nodo Postgres:** Inserta un nuevo registro en `cotizaciones` vinculando al cliente, asume un **vendedor en blanco (NULL)** para que el administrador asigne la oportunidad luego, y pone el estado en "Por Revisar".
4. **Nodo Loop + Postgres:** Itera sobre los productos del carrito de Woo e inserta cada uno en `cotizaciones_lineas` usando los datos provenientes de la web.

### Workflow 2: Salida y Generación de PDF (El motor de envío)

1. **Trigger:** Webhook de Base de Datos en Supabase (`Database Webhooks`) que dispara a n8n de manera inmediata cuando `estado == 'Generar PDF'`.
2. **Nodo Postgres (Gathering):** Hace un `SELECT` gigante uniendo la cotización, las líneas, los datos del cliente, del vendedor y los datos de `empresa_configuracion`.
3. **Nodo HTTP Request (APITemplate):** Envía el JSON estructurado (ver Fase 4) al creador del PDF.
4. **Nodo Gmail:**
    * *Nota técnica:* Al usar n8n self-hosted y Gmail normal, tendrás que habilitar la API de Gmail en Google Cloud Console y generar credenciales OAuth2.
    * Configuras el correo: `To: {{email_cliente}}`, `Asunto: Cotización {{numero_correlativo}}`, `Adjunto: {{archivo_pdf}}`.
5. **Nodo Postgres:** Actualiza la cotización a `estado = 'Enviada'`.

---

## FASE 4: Configuración del PDF (APITemplate.io)

En APITemplate usarás su editor visual de "Arrastrar y Soltar". Configurarás la plantilla para que reciba un objeto JSON desde n8n.

La estructura del JSON (Payload) que n8n enviará será algo así:

```json
{
  "cotizacion_codigo": "COT-0015",
  "fecha_emision": "15-05-2024",
  "fecha_validez": "30-05-2024",
  "vendedor_nombre": "Juan Pérez",
  "empresa": {
    "razon_social": "Tu Empresa S.A.C.",
    "ruc": "20999888777",
    "direccion": "Calle Falsa 123",
    "terminos": "Pagos al contado. Cuentas BCP: 191-..."
  },
  "cliente": {
    "razon_social": "Cliente Ejemplo E.I.R.L",
    "nombres_contacto": "Carlos",
    "apellidos_contacto": "Ramírez",
    "documento": "20987654321",
    "direccion": "Av. Principal 123"
  },
  "observaciones": "El cliente solicita instalación en sucursal Norte.",
  "totales": {
    "subtotal": 1000.00,
    "descuento_global": 50.00,
    "aplica_igv": true,
    "igv_monto": 171.00,
    "total_final": 1121.00 
  },
  "lineas": [
    {
      "sku": "PROD-01",
      "nombre": "Producto A",
      "cantidad": 2,
      "precio_unitario": 500.00,
      "descuento": 0.00,
      "subtotal_linea": 1000.00
    }
  ]
}
```

*En APITemplate usarás la clave `lineas` para alimentar la "Tabla Dinámica". Si el array tiene 1 producto, la tabla tendrá 1 fila. Si tiene 10, crecerá sola.*

---

### Siguientes pasos para ti (Orden de ejecución)

1. **Abre Supabase**, crea un proyecto nuevo (es gratis) y ve al editor SQL para correr el script de creación de la base de datos (Documento 1).
2. **Inicializa tu proyecto de React + Vite**, e instala `@supabase/supabase-js` para conectar tu frontend directamente a la base de datos usando las credenciales seguras.
3. Configura **WooCommerce** editando los campos del checkout para que coincidan con la nueva estructura de nombres y apellidos separada de la razón social.
4. Configura **n8n** conectando los webhooks y las credenciales.
