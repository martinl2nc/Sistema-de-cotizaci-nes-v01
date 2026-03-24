# Ideas y Roadmap del Sistema de Cotizaciones

> Archivo de seguimiento de funcionalidades implementadas, pendientes e ideas futuras.
> Actualizar libremente cuando surja una nueva idea o se complete una tarea.

---

## ✅ Ya implementado

### Core del sistema
- [x] Autenticación con Supabase (login / logout)
- [x] Roles: Admin y Vendedor con accesos diferenciados
- [x] Dashboard con KPIs: cotizaciones del mes, monto, tasa de conversión, por vencer
- [x] Gráficos: barras por mes, torta por estado, top clientes, top productos
- [x] CRUD completo de cotizaciones
- [x] Numeración correlativa automática (COT-00001, COT-00002...)
- [x] Estados de cotización: Borrador → PDF Generado → Enviada → Aprobada / Cancelada
- [x] Cálculo automático en tiempo real: subtotal, descuento, IGV, total final
- [x] Toggle de IGV (18%) por cotización
- [x] Descuento global por cotización
- [x] Descuento por línea de producto
- [x] Campo de observaciones que se imprime en el PDF
- [x] Nombre de producto "congelado" en el momento de cotizar (histórico)
- [x] RLS: vendedores solo ven sus propias cotizaciones

### Clientes
- [x] CRUD completo de clientes
- [x] Búsqueda por RUC, razón social, email
- [x] Activar / desactivar cliente (sin eliminar)
- [x] Modal para crear cliente directamente desde el formulario de cotización
- [x] Tipos de documento: RUC, DNI, Pasaporte, etc.

### Productos
- [x] CRUD completo de productos y servicios
- [x] Categorías de productos (CRUD)
- [x] Toggle activo / inactivo de productos
- [x] Campo de SKU único
- [x] Precio base (modificable en cada cotización)

### Configuración de empresa
- [x] Datos de empresa: razón social, RUC, dirección
- [x] Subida y gestión de logo (Supabase Storage)
- [x] Cuentas bancarias en formato JSON para el PDF
- [x] Términos y condiciones

### PDF y envío
- [x] Generación de PDF profesional con @react-pdf/renderer (en el cliente)
- [x] PDF con: logo, datos empresa, datos cliente, tabla de productos, totales, cuentas bancarias
- [x] Descarga automática del PDF al generarlo
- [x] Envío de PDF al cliente por Gmail (vía webhook a n8n)
- [x] Cambio automático de estado a "Enviada" tras envío exitoso

### Automatización (n8n)
- [x] Workflow: envío de cotización PDF por correo al cliente
- [x] Workflow: seguimiento automático diario (9 AM)
- [x] Detección de cotizaciones que vencen en 2 días
- [x] Campo `seguimiento_automatico` en cotizaciones (toggle en tabla)
- [x] Email de recordatorio automático personalizado con datos de la cotización

---

## 🔄 En progreso / Pendiente próximo sprint

- [ ] Resolver el mensaje de confirmación cuando el correo se envía exitosamente (toast de éxito)
- [ ] Panel de vendedores en `/admin/vendedores` (actualmente muestra "Coming Soon")

---

## 💡 Ideas futuras

### Cotizaciones
- [ ] **Duplicar cotización** — Clonar una existente para hacer una variante rápidamente
- [ ] **Historial de cambios** — Ver quién cambió el estado y cuándo (log de auditoría)
- [ ] **Versiones de cotización** — v1, v2, v3 de la misma cotización
- [ ] **Cotización desde plantilla** — Guardar cotizaciones frecuentes como plantillas
- [ ] **Comentarios internos** — Notas del equipo que no aparecen en el PDF
- [ ] **Adjuntar archivos** — Subir documentos adicionales (especificaciones, fichas técnicas)
- [ ] **Vista previa del PDF antes de enviar** — Ver el PDF en pantalla antes de generarlo
- [ ] **Reenviar correo** — Botón para reenviar sin regenerar PDF
- [ ] **Historial de correos enviados** — Registro de cuándo y cuántas veces se envió

### Clientes
- [ ] **Importar clientes desde Excel/CSV** — Carga masiva de clientes
- [ ] **Historial por cliente** — Ver todas las cotizaciones de un cliente específico
- [ ] **Portal del cliente** — Link único para que el cliente vea y apruebe su cotización online

### Seguimiento y notificaciones
- [ ] **Notificación a vendedor cuando el cliente aprueba** — Email o notificación push
- [ ] **Notificación interna** — Alertas dentro del sistema (badge en menú)
- [ ] **Seguimiento por WhatsApp** — Alternativa a email usando WhatsApp Business API
- [ ] **Recordatorio también a vendedor** — Copia del recordatorio al vendedor asignado
- [ ] **Configurar los días de anticipación del recordatorio** — Actualmente fijo en 2 días, hacerlo configurable (1, 2, 3, 5 días)

### Reportes y analytics
- [ ] **Exportar reporte de cotizaciones a Excel** — Con filtros por fecha, estado, vendedor
- [ ] **Reporte de cotizaciones vencidas** — Lista de cotizaciones que vencieron sin aprobarse
- [ ] **Reporte de conversión por vendedor** — Comparativa de tasa de aprobación por vendedor
- [ ] **Proyección de ingresos** — Monto en cotizaciones activas como proyección

### Integraciones
- [ ] **Sincronización con WooCommerce** — Importar pedidos y crear cotizaciones automáticamente
- [ ] **Sincronización de productos con WooCommerce** — Mantener catálogo sincronizado
- [ ] **Integración con CRM** — Conectar con HubSpot, Pipedrive u otro CRM
- [ ] **Facturación electrónica** — Generar factura/boleta una vez aprobada la cotización
- [ ] **Integración con pasarela de pago** — Que el cliente pueda pagar desde el correo

### UX / Mejoras de interfaz
- [ ] **Modo oscuro** — Toggle de tema oscuro/claro
- [ ] **Filtros avanzados en cotizaciones** — Por rango de fechas, rango de monto
- [ ] **Columnas configurables** — Que el usuario elija qué columnas ver en la tabla
- [ ] **Ordenamiento de tablas** — Click en encabezado para ordenar
- [ ] **Paginación del servidor** — Actualmente carga todo, paginar para mejor performance con muchos registros
- [ ] **Búsqueda global** — Un buscador único que encuentre clientes, cotizaciones y productos
- [ ] **Atajos de teclado** — Para acciones frecuentes (Ctrl+N = nueva cotización)

### Administración
- [ ] **Gestión de usuarios desde la UI** — Crear/editar vendedores sin ir a Supabase
- [ ] **Configurar la hora del recordatorio diario** — Actualmente fija a las 9 AM en n8n
- [ ] **Log de actividad** — Registro de acciones de cada usuario
- [ ] **Backup/exportar toda la data** — Exportar cotizaciones y clientes completos

---

## 🗓️ Ideas para evaluar (sin prioridad definida)

- Aplicación móvil (PWA o app nativa) para vendedores en campo
- QR en el PDF para que el cliente vea la cotización online
- Firma electrónica del cliente para aprobar cotización
- Multi-empresa: manejar varias empresas desde una misma cuenta
- Multi-moneda: cotizaciones en USD y soles con tipo de cambio configurable
- Descuentos por volumen automáticos según cantidad

---

*Última actualización: Marzo 2026*
