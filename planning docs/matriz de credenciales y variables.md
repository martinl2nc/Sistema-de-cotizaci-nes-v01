# 📄 DOC 5: Matriz de Credenciales y Variables de Entorno (.env)

**⚠️ IMPORTANTE DE SEGURIDAD:**
*Nunca compartas este documento sin encriptar. Nunca pegues estos valores directamente en correos, Slack o chats públicos. Si vas a alojar n8n en un servidor Linux (Docker), estos valores irán dentro de tu archivo `.env` o en el gestor de credenciales de n8n.*

---

## 🟢 1. Base de Datos (Supabase / PostgreSQL)

*Estas credenciales le permitirán a n8n y a la Aplicación React conectarse a tu base de datos para leer/escribir cotizaciones. Para el frontend en Vite, recuerda usar el nuevo formato de claves de Supabase.*

| Variable de Entorno | Valor (Actualizado) | Descripción |
| :--- | :--- | :--- |
| `SUPABASE_TOKEN_ACCOUNT` | `sbp_2646d1e681805545f532ba45d81cc3b3f5a9e51d` | Token de acceso para gestión de la cuenta Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuY2N2ZWd3b3ljcmtlZHphYnV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2NTg1NywiZXhwIjoyMDg4OTQxODU3fQ.w4MEbho_0Yih340_mTxOFeMHsWtJSlMNjsWIiHtrGhQ` | Clave secreta para n8n/MCP (Salto de RLS). |
| `DB_HOST` | `aws-0-us-west-2.pooler.supabase.com` | Host del Transaction Pooler (n8n). |
| `DB_PORT` | `6543` | Puerto del Pooler (n8n). |
| `DB_NAME` | `postgres` | Nombre de la base de datos. |
| `DB_USER` | `postgres.enccvegwoycrkedzabuz` | Usuario de base de datos específico del proyecto. |
| `DB_PASSWORD` | `*/La$alle98/*` | Contraseña maestra de la base de datos. |
| `VITE_SUPABASE_URL` | `https://enccvegwoycrkedzabuz.supabase.co` | URL de la API (Frontend Vite). |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `sb_publishable_GEwne9Tfv1zirYFnwwsPxQ_WY_BDNok` | Nueva clave pública para el frontend React. |

---

## 🔵 2. Generador de Documentos (APITemplate.io)

*Esta llave autoriza a n8n a enviar el JSON y generar el documento PDF de la cotización.*

* **¿Dónde obtenerla?** En tu panel de APITemplate: `API Integration` o `Account Settings` > `API Keys`.

| Variable de Entorno | Valor (Rellenar al crear) | Descripción |
| :--- | :--- | :--- |
| `APITEMPLATE_API_KEY` | `[tu_api_key_aqui]` | Llave secreta para autorizar la creación del PDF. |
| `APITEMPLATE_TEMPLATE_ID` | `[id_de_la_plantilla]` | El ID único del diseño visual del PDF que creaste en APITemplate. |

---

## 🔴 3. Servidor de Correos (Gmail API / Google Cloud)

*Dado que usarás Gmail con n8n autoalojado, necesitas crear credenciales OAuth2. No puedes usar simplemente usuario/contraseña.*

* **¿Dónde obtenerlas?** En `Google Cloud Console` > `APIs & Services` > `Credentials` > `Create OAuth client ID` (Tipo: Web Application).

| Variable de Entorno | Valor (Rellenar al crear) | Descripción |
| :--- | :--- | :--- |
| `GMAIL_CLIENT_ID` | `[numeros]...apps.googleusercontent.com` | Identificador de tu app en Google Cloud. |
| `GMAIL_CLIENT_SECRET` | `GOCSPX-...[cadena_secreta]` | Secreto de la aplicación (No lo compartas). |
| `GMAIL_REDIRECT_URI` | `https://[tu_n8n_url]/oauth2/callback` | La URL de tu servidor n8n a donde Google enviará la autorización. |
| `GMAIL_SENDER_EMAIL` | `ventas@tuempresa.com` | El correo corporativo (o Gmail normal) desde el cual saldrán las cotizaciones. |

---

## 🟣 4. Entradas Externas (Webhooks y WooCommerce)

*Estas son las URLs que n8n generará para "escuchar" la web y la base de datos.*

* **¿Dónde obtenerlas?** Dentro de los nodos `Webhook Trigger` en tus flujos de n8n.

| Variable de Entorno | Valor (Rellenar al crear) | Descripción |
| :--- | :--- | :--- |
| `N8N_WEBHOOK_URL_WOO` | `https://[tu_n8n_url]/webhook/woocommerce-new-quote` | La URL que debes pegar en el plugin de WooCommerce o en los ajustes de Webhooks de Woo. |
| `N8N_WEBHOOK_URL_PDF` | `https://[tu_n8n_url]/webhook/supabase-generate-pdf` | La URL que debes pegar en los `Database Webhooks` de Supabase para que dispare el Workflow 2. |
| `WOO_WEBHOOK_SECRET` | `[cadena_aleatoria]` | (Opcional pero recomendado). Una contraseña que WooCommerce enviará a n8n para verificar que el Webhook es legítimo y no un ataque. |

---

## ⚙️ 5. Configuración del Servidor n8n (Si usas Docker)

*Si tú mismo vas a levantar n8n en un VPS (como Hetzner, DigitalOcean o AWS) usando Docker Compose, necesitas definir estas variables fundamentales en tu archivo `.env` del servidor.*

| Variable de Entorno | Valor Recomendado | Descripción |
| :--- | :--- | :--- |
| `N8N_HOST` | `n8n.tuempresa.com` | El subdominio donde vivirá tu n8n. |
| `WEBHOOK_URL` | `https://n8n.tuempresa.com/` | Vital para que los webhooks funcionen correctamente y no muestren `localhost`. |
| `GENERIC_TIMEZONE` | `America/Lima` *(Ajusta a tu país)* | Para que n8n registre la fecha y hora correcta de las cotizaciones. |
| `N8N_ENCRYPTION_KEY` | `[Generar_UUID_Largo]` | ¡MUY IMPORTANTE! Si no defines esto y tu servidor se reinicia, perderás todas tus credenciales (como la conexión a Gmail) guardadas dentro de n8n. |

---

### Instrucciones Finales para ti

1. Copia toda esta matriz y pégala en un documento en blanco de tu gestor de contraseñas (o un Excel encriptado local).
2. A medida que vayas creando las cuentas (Supabase, APITemplate, Google Cloud Console), ve **rellenando los huecos** en tu matriz.
3. Cuando abras n8n o configures tu proyecto React por primera vez y te pidan conectar la base de datos, simplemente copia de tu matriz a la herramienta. Te ahorrará buscar entre 5 pestañas diferentes.
