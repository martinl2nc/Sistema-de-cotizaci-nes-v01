# Manual de Usuario — Sistema de Cotizaciones

> Guía completa para el equipo de ventas y administración

---

## Tabla de Contenidos

1. [¿Qué es este sistema?](#1-qué-es-este-sistema)
2. [Cómo ingresar](#2-cómo-ingresar)
3. [Dashboard — Resumen General](#3-dashboard--resumen-general)
4. [Cotizaciones](#4-cotizaciones)
5. [Clientes](#5-clientes)
6. [Productos y Servicios](#6-productos-y-servicios)
7. [Configuración de Empresa](#7-configuración-de-empresa)
8. [Seguimiento Automático de Correos](#8-seguimiento-automático-de-correos)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)

---

## 1. ¿Qué es este sistema?

Este sistema te permite crear, gestionar y enviar cotizaciones profesionales a tus clientes de forma rápida y ordenada. Desde aquí puedes:

- ✅ Crear cotizaciones con cálculo automático de IGV y descuentos
- ✅ Generar PDFs profesionales con el logo y datos de tu empresa
- ✅ Enviar las cotizaciones directamente al correo del cliente
- ✅ Ver en qué estado está cada cotización (borrador, enviada, aprobada, etc.)
- ✅ Recibir recordatorios automáticos cuando una cotización está por vencer
- ✅ Consultar estadísticas de ventas en el dashboard

---

## 2. Cómo ingresar

1. Abre el navegador y ve a la dirección del sistema
2. Ingresa tu **correo electrónico** y **contraseña**
3. Haz clic en **Iniciar sesión**

> **¿Olvidaste tu contraseña?** Contacta al administrador del sistema para que te la restablezca.

### Tipos de usuario

| Tipo | Qué puede hacer |
|------|----------------|
| **Administrador** | Todo: cotizaciones, clientes, productos, configuración |
| **Vendedor** | Solo ve y gestiona sus propias cotizaciones |

---

## 3. Dashboard — Resumen General

Al ingresar verás el **panel principal** con un resumen de tu actividad.

### Tarjetas de resumen (parte superior)

| Tarjeta | Qué muestra |
|---------|-------------|
| **Cotizaciones del mes** | Cuántas cotizaciones has creado este mes |
| **Monto cotizado** | Total en soles de todas las cotizaciones del mes |
| **Tasa de conversión** | Qué porcentaje de cotizaciones han sido aprobadas |
| **Por vencer (3 días)** | Cotizaciones que vencen en los próximos 3 días |

### Gráficos

- **Cotizaciones por mes** — Barras con los últimos 6 meses
- **Distribución por estado** — Gráfico de torta con Borrador, Enviadas, Aprobadas, etc.
- **Top 5 clientes** — Los clientes con mayor monto cotizado
- **Top 5 productos** — Los productos más incluidos en cotizaciones

> 💡 Si eres vendedor, verás solo tus propios datos. Si eres administrador, verás los datos de todo el equipo.

---

## 4. Cotizaciones

### Ver todas las cotizaciones

Ve al menú **Cotizaciones** para ver la lista completa.

**Puedes filtrar por:**
- Texto libre (número de cotización, nombre del cliente, correo, documento)
- Vendedor asignado
- Estado de la cotización

**Columnas de la tabla:**
| Columna | Descripción |
|---------|-------------|
| N° | Número de cotización (COT-00001) |
| Cliente | Nombre del cliente |
| Vendedor | Vendedor asignado |
| Emisión | Fecha de creación |
| Validez | Fecha de vencimiento |
| Total | Monto total en soles |
| Estado | Estado actual |
| Seguim. | Si tiene seguimiento automático activado |

---

### Crear una nueva cotización

1. Haz clic en el botón **+ Nueva Cotización**
2. Completa los datos:

**Paso 1 — Datos generales:**
- **Cliente**: Busca y selecciona el cliente. Si no existe, haz clic en **+ Nuevo cliente** para crearlo en el momento.
- **Vendedor**: Selecciona el vendedor responsable
- **Fecha de validez**: Hasta cuándo es válida la cotización
- **Observaciones**: Notas que se imprimirán en el PDF (ej: "Entrega en 48 horas")
- **¿Aplica IGV?**: Activa o desactiva el IGV del 18%
- **Descuento global**: Si hay un descuento sobre el total

**Paso 2 — Agregar productos:**
1. Haz clic en **+ Agregar línea**
2. Selecciona el producto del catálogo (o escribe una descripción personalizada)
3. Ingresa la cantidad y el precio unitario
4. Si hay descuento en esa línea, ingrésalo
5. El subtotal se calcula automáticamente

**Paso 3 — Guardar o enviar:**
- **Guardar borrador**: Guarda sin enviar (estado: Borrador)
- **Generar y Enviar PDF**: Crea el PDF, lo descarga a tu computadora y lo envía al correo del cliente automáticamente

---

### Editar una cotización

1. En la lista de cotizaciones, haz clic en el ícono de **lápiz** ✏️ en la fila que deseas editar
2. Modifica los datos que necesites
3. Guarda los cambios

> ⚠️ Solo puedes editar cotizaciones que no hayan sido **Aprobadas** o **Canceladas**.

---

### Cambiar el estado de una cotización

En la tabla de cotizaciones, la columna **Estado** tiene un menú desplegable. Haz clic en él para cambiar el estado:

| Estado | Cuándo usarlo |
|--------|--------------|
| **Borrador** | Cotización en preparación, no enviada |
| **PDF Generado** | PDF creado, pendiente de envío manual |
| **Enviada** | Ya fue enviada al cliente |
| **Aprobada** | El cliente aceptó la cotización ✅ |
| **Cancelada** | La cotización fue rechazada o ya no aplica ❌ |

---

### Eliminar una cotización

1. En la lista, haz clic en el ícono de **papelera** 🗑️
2. Confirma la eliminación en el diálogo

> ⚠️ Esta acción es permanente y no se puede deshacer.

---

### El PDF de la cotización

Cuando haces clic en **"Generar y Enviar PDF"**, el sistema:

1. Crea automáticamente un PDF profesional con:
   - Logo y datos de tu empresa
   - Datos completos del cliente
   - Tabla de productos con precios y subtotales
   - Descuentos aplicados
   - IGV (si aplica)
   - **Total Final** destacado
   - Cuentas bancarias para el pago
   - Observaciones y términos

2. **Descarga el PDF** en tu computadora con el nombre `COT-00013.pdf`

3. **Envía el correo automáticamente** al email del cliente con el PDF adjunto

El correo que recibirá el cliente incluirá:
- Número de cotización
- Total de la cotización
- Fecha de vencimiento
- El PDF adjunto

---

## 5. Clientes

> Esta sección está disponible para **Administradores**.

### Ver y buscar clientes

Ve al menú **Admin → Clientes** para ver el directorio completo.

Puedes buscar por:
- RUC o número de documento
- Razón social o nombre
- Correo electrónico

### Agregar un nuevo cliente

1. Haz clic en **+ Nuevo cliente**
2. Completa los datos:
   - **Tipo de documento**: RUC, DNI, Pasaporte, etc.
   - **Número de documento**: RUC o DNI del cliente
   - **Razón social**: Nombre de la empresa
   - **Nombres / Apellidos de contacto**: Persona de contacto
   - **Correo electrónico** (obligatorio — aquí llegará la cotización)
   - **Teléfono**
   - **Dirección**
3. Haz clic en **Guardar**

> 💡 También puedes crear un cliente directamente desde el formulario de cotización sin necesidad de ir al módulo de Admin.

### Activar o desactivar un cliente

Usa el **toggle** en la columna de estado para activar o desactivar un cliente. Los clientes inactivos no aparecen en el selector de cotizaciones, pero sus datos se conservan.

### Editar o eliminar

- **Lápiz** ✏️ para editar datos del cliente
- **Papelera** 🗑️ para eliminar (solo si no tiene cotizaciones asociadas)

---

## 6. Productos y Servicios

> Esta sección está disponible para **Administradores**.

### Ver el catálogo

Ve al menú **Admin → Productos** para ver todos los productos y servicios disponibles.

### Agregar un nuevo producto

1. Haz clic en **+ Nuevo producto**
2. Completa:
   - **SKU**: Código interno del producto (ej: `SRV-001`)
   - **Nombre**: Nombre que aparecerá en las cotizaciones
   - **Categoría**: Grupo al que pertenece
   - **Descripción**: Descripción opcional
   - **Precio base**: Precio de referencia (puede modificarse en cada cotización)
3. Haz clic en **Guardar**

### Categorías

Puedes organizar tus productos en categorías. Para gestionar las categorías, haz clic en el botón **Categorías** en la parte superior del módulo de productos.

### Activar o desactivar productos

Los productos inactivos no aparecen en el selector de cotizaciones. Usa el toggle para activar o desactivar sin eliminar.

---

## 7. Configuración de Empresa

> Esta sección está disponible para **Administradores**.

Ve al menú **Admin → Empresa** para configurar los datos que aparecen en todos los PDFs.

### Datos que puedes configurar

| Campo | Dónde aparece |
|-------|--------------|
| **Razón social** | Encabezado del PDF |
| **RUC** | Encabezado del PDF |
| **Dirección** | Encabezado del PDF |
| **Logo** | Esquina superior izquierda del PDF |
| **Cuentas bancarias** | Pie del PDF (para pagos) |
| **Términos y condiciones** | Pie del PDF |

### Subir el logo

1. En la sección de logo, haz clic en **Seleccionar archivo**
2. Elige una imagen en formato PNG o JPG
3. Haz clic en **Guardar**

> 💡 Recomendamos un logo con fondo transparente (PNG) y dimensiones de al menos 300×100 píxeles.

### Cuentas bancarias

Las cuentas bancarias se muestran al final del PDF para que el cliente sepa cómo pagar. Incluye:
- Nombre del banco
- Tipo de cuenta
- Moneda (Soles / Dólares)
- Número de cuenta

---

## 8. Seguimiento Automático de Correos

El sistema puede **enviar recordatorios automáticos** a los clientes cuyas cotizaciones están por vencer.

### Cómo funciona

Todos los días a las **9:00 AM**, el sistema revisa automáticamente si hay cotizaciones que cumplan estas 3 condiciones:

1. Estado: **Enviada**
2. Fecha de vencimiento: exactamente **2 días a partir de hoy**
3. Seguimiento automático: **activado** ✅

Si encuentra cotizaciones que cumplen todo esto, envía un correo al cliente recordándole que la cotización está por vencer.

### Activar o desactivar el seguimiento

En la tabla de cotizaciones, la columna **Seguim.** solo aparece para cotizaciones en estado **Enviada**:

- ☑️ **Checkbox marcado** → El sistema enviará el recordatorio automáticamente
- ☐ **Checkbox desmarcado** → No se enviará recordatorio para esa cotización

> 💡 Por defecto, el seguimiento automático está **activado** para todas las cotizaciones nuevas en estado Enviada. Puedes desactivarlo manualmente si no quieres que se envíe el recordatorio.

### Ejemplo del correo de recordatorio

El cliente recibirá un correo como este:

> **Asunto:** Seguimiento — Cotización COT-00013 vence en 2 días
>
> Estimado/a **Empresa SAC**,
>
> Le escribimos para recordarle que la cotización **COT-00013** por un total de **S/ 177.00** vence el **26/03/2026**.
>
> Si tiene alguna consulta o desea proceder con la aprobación, con gusto le atendemos.
>
> Saludos cordiales,
> Equipo de Ventas

---

## 9. Preguntas Frecuentes

**¿Puedo modificar una cotización después de enviarla?**
Sí, puedes editarla pero tendrás que volver a generar y enviar el PDF manualmente.

**¿Qué pasa si el correo del cliente es incorrecto?**
Ve al módulo de **Admin → Clientes**, edita el cliente y corrige el email. Luego vuelve a enviar la cotización.

**¿Puedo crear una cotización sin seleccionar un producto del catálogo?**
Sí, puedes escribir directamente el nombre del producto en el campo de descripción de cada línea.

**¿El descuento por línea y el descuento global se acumulan?**
Sí. Primero se aplican los descuentos por línea, y sobre el subtotal resultante se aplica el descuento global.

**¿Cómo sé si el correo llegó al cliente?**
Cuando n8n procesa el envío exitosamente, la cotización cambia automáticamente a estado **"Enviada"**. Puedes verificarlo en la tabla.

**¿Los vendedores pueden ver las cotizaciones de otros vendedores?**
No. Cada vendedor solo ve sus propias cotizaciones. El administrador puede ver todas.

**¿Cómo cambio el asunto o texto del correo que se envía?**
Eso se configura directamente en los workflows de n8n. Contacta al administrador técnico para modificarlo.

**¿Puedo descargar el PDF sin enviarlo al cliente?**
Sí. Al hacer clic en "Generar y Enviar PDF", el PDF se descarga automáticamente en tu computadora. Si no quieres enviarlo aún, simplemente no te preocupes — el envío es automático si el sistema está configurado. Para solo descargar sin enviar, guarda primero como **Borrador**.

---

*¿Tienes alguna duda que no está resuelta aquí? Contacta al administrador del sistema.*
