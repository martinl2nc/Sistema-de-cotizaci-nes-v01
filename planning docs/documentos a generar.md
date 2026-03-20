# DOCUMENTOS GENERADOS

Para que la planificación técnica de este proyecto sea un éxito y no te encuentres con "cuellos de botella" al momento de empezar a configurar las herramientas, hemos generado **5 documentos técnicos**.

Aquí tienes la lista de los documentos preparados, ordenados por prioridad:

## 1. Diagrama Entidad-Relación (ERD) o Esquema de Base de Datos

Este es el documento **más importante** antes de tocar Supabase. Es la representación visual de cómo se conectan tus tablas.

* **¿Qué contiene?**
  * El listado de las 7 tablas que definimos (clientes, productos, cotizaciones, líneas, etc.).
  * Los tipos de datos exactos de cada columna (ej. `VARCHAR`, `UUID`, `BOOLEAN`, `DECIMAL(10,2)`).
  * Las llaves primarias (PK) y las llaves foráneas (FK) que conectan las tablas.
  * Las reglas de borrado (ej. Si se borra una cotización -> Borrar sus líneas en Cascada).
* **Herramientas recomendadas para crearlo:** [dbdiagram.io](https://dbdiagram.io/) (escribiendo código simple te genera el gráfico gratis) o Draw.io.

## 2. Diagrama de Flujo Lógico (Process Flowchart)

Dado que n8n es un orquestador visual, necesitamos dibujar el mapa de los flujos antes de configurarlos. Esto te ayudará a ver qué pasa si hay un error.

* **¿Qué contiene?**
  * **Flujo 1 (Entrada Web):** Webhook Woo -> Verificar Cliente -> Crear Cliente (si no existe) -> Crear Cotización -> Crear Líneas -> Fin.
  * **Flujo 2 (Salida y PDF):** Aplicación React actualiza estado -> Supabase Webhook -> n8n recopila datos -> API APITemplate -> Recibe PDF -> Enviar Gmail -> Actualizar estado a "Enviado".
* **Herramientas recomendadas:** Draw.io, Miro, Lucidchart o FigJam.

## 3. Diccionario de Integraciones y Mapeo de Datos (JSON Payloads)

El mayor dolor de cabeza al usar n8n es conectar la herramienta A con la herramienta B, porque los nombres de las variables cambian. Necesitas un documento (puede ser un Excel o Notion) que documente los "cables".

* **¿Qué contiene?**
  * **El Payload de WooCommerce:** ¿Qué formato exacto de JSON envía el plugin *NP Quote Request* cuando alguien pide una cotización? (Necesitas saber si envía el precio con IGV o sin IGV, cómo se llama el campo del correo, etc.).
  * **El Payload de APITemplate:** El JSON exacto que la plantilla de PDF está esperando recibir.
  * De esta forma, al configurar n8n, solo tienes que mirar tu documento y hacer "match" (ej: `woocommerce.billing.email` = `cliente.email`).

## 4. Diseño de Interfaz y Prototipos para la Aplicación React

Así sabremos qué información va en cada pantalla y componente. Al crear con React, planificar los componentes reutilizables es clave.

* **¿Qué contiene?**
  * Bocetos de las vistas principales (Dashboard, Editor, Catálogo).
  * Definición visual de los componentes (Botones, Tablas, Inputs).
  * Identificar qué datos se cargan dinámicamente vs estáticos.
* **Herramientas recomendadas:** Figma, Whimsical, o bocetos a mano.

## 5. Matriz de Credenciales y Variables de Entorno (.env)

Como vas a tener n8n autoalojado (self-hosted) y un frontend en React desplegado, vas a manejar contraseñas, APIs y bases de datos. Por seguridad, **nunca** dejes esto esparcido. Crea un gestor seguro para tu proyecto y usa las variables `VITE_` para tu React SPA.

* **¿Qué contiene?**
  * URL, Puerto y Password de la base de datos Supabase.
  * API Key de APITemplate.io.
  * Credenciales OAuth2 de Google Cloud (Client ID y Client Secret) para enviar por Gmail.
  * URL de los Webhooks de n8n que deberás pegar en WooCommerce.
* **Herramientas recomendadas:** Un gestor de contraseñas seguro (Bitwarden, 1Password) o un archivo seguro en Notion.
