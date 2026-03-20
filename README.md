# 📄 DOCUMENTO DE PROYECTO: Sistema Integrado de Gestión de Cotizaciones (SIGC)

## 1. Descripción del Proyecto

El **Sistema Integrado de Gestión de Cotizaciones** es una solución de software a medida (Low-Code/No-Code) diseñada para centralizar, agilizar y automatizar el proceso de venta B2B/B2C de la empresa.

Nace con el propósito de reemplazar la gestión lenta y poco flexible del panel de administración nativo de WordPress/WooCommerce, trasladando toda la lógica de negocio, el catálogo de productos y el historial de clientes a una base de datos relacional robusta. El sistema maneja un flujo híbrido: permite recibir solicitudes de cotización desde la página web de forma automática **(generando un borrador inicial que el equipo de ventas debe revisar, modificar y aprobar)**, o permite que el vendedor ingrese la cotización desde cero manualmente. Ambos caminos culminan en la generación de un documento PDF profesional y su envío automatizado por correo electrónico.

## 2. Objetivos

**Objetivo Principal:**
Optimizar el ciclo de ventas y reducir el tiempo operativo en la emisión de cotizaciones, garantizando la exactitud de los cálculos (impuestos y descuentos), la validación humana cuando sea necesaria, y la presentación profesional de los documentos enviados a los clientes.

**Objetivos Específicos:**

* **Unificar canales de entrada:** Centralizar en un solo panel las cotizaciones solicitadas por los clientes vía web (WooCommerce) y las generadas manualmente por los vendedores.
* **Garantizar la integridad financiera:** Asegurar que los cambios futuros en los precios del catálogo no alteren el historial contable de las cotizaciones emitidas en el pasado.
* **Facilitar la validación y personalización:** Permitir que los vendedores intervengan en las cotizaciones automáticas generadas por la web para ajustar precios, agregar descuentos o modificar productos antes del envío final.
* **Automatizar el trabajo manual repetitivo:** Eliminar la necesidad de redactar correos, adjuntar archivos manualmente o usar plantillas de Word/Excel propensas a errores humanos.

## 3. Características Principales

* **Omnicanalidad con Revisión Humana:** Flujos de trabajo que atienden tanto el auto-servicio del cliente (Web) como la gestión interna (Dashboard), integrando un paso de revisión obligatoria para las solicitudes web.
* **Integridad Transaccional:** Arquitectura SQL real que congela los precios, nombres de productos y datos del cliente en el momento exacto de la cotización.
* **Motor de Cálculo Dinámico:** Soporte nativo para cálculo de IGV (18% o exonerado), descuentos por línea de producto y descuentos globales sobre el subtotal.
* **Plantillas Inteligentes:** Documentos PDF con tablas dinámicas que se expanden automáticamente según la cantidad de productos (1 a N), integrando textos legales y cuentas bancarias actualizables sin tocar código.
* **Escalabilidad Empresarial:** Al estar construido sobre bases de datos PostgreSQL y plataformas Low-Code, el sistema está preparado para evolucionar hacia un ERP o CRM completo en el futuro.

## 4. Funcionalidades Clave

1. **Gestión de Entidades (CRUD):** Administración centralizada de Clientes (RUC, Razón Social, Direcciones), Catálogo de Productos (SKU, Categorías, Precios Base), Vendedores y Datos de Configuración de la Empresa.
2. **Captura Web Automatizada y Flujo de Revisión:** Escucha en tiempo real de las solicitudes generadas en WooCommerce (vía el plugin *NP Quote Request*). El sistema, a través de n8n, captura estos datos y crea automáticamente una cotización en estado "Por Revisar" dentro de la base de datos. **Esto permite que un vendedor ingrese al sistema, revise la solicitud del cliente, modifique las cantidades, ajuste precios o aplique descuentos personalizados antes de aprobarla.**
3. **Punto de Venta Interno (Dashboard Maestro-Detalle):** Interfaz rápida (construida como una Single Page Application con React + Vite) para vendedores que permite editar los borradores provenientes de la web o armar cotizaciones desde cero en segundos, buscar productos, y ver totales calculados en tiempo real.
4. **Generación de PDF en 1 Clic:** Una vez que el vendedor aprueba la cotización (sea de origen web o manual), el sistema transforma instantáneamente los datos en un diseño PDF visualmente atractivo y corporativo.
5. **Despacho Automatizado:** Envío automático del PDF al correo del cliente utilizando la infraestructura de Gmail, con actualización automática del estado de la cotización a "Enviada".

## 5. Stack Tecnológico (Tecnologías a utilizar)

La arquitectura del proyecto se divide en 5 capas especializadas utilizando las mejores herramientas del ecosistema moderno:

* **Base de Datos (Backend):** `Supabase` (PostgreSQL). Actúa como la única fuente de la verdad (Single Source of Truth), manejando la integridad relacional de clientes, cotizaciones y productos. Incluye Row Level Security (RLS) para proteger los datos.
* **Interfaz de Usuario (Frontend / Panel Admin):** `React + Vite`. Single Page Application estática alojada en SiteGround, construida con Tailwind CSS. Se conecta directamente de forma segura a Supabase mediante la librería `@supabase/supabase-js`.
* **Orquestación y Automatización (Middleware):** `n8n` *(Versión Autoalojada/Self-hosted)*. El "cerebro" que conecta las aplicaciones. Recibe los webhooks de la tienda, crea los borradores en la base de datos, y dispara la generación del documento y envío por correo una vez que el vendedor lo aprueba.
* **Generador de Documentos:** `APITemplate.io`. Motor de renderizado visual que recibe cargas de datos (JSON payload) desde n8n y devuelve documentos PDF dinámicos.
* **Canales Externos (Entrada y Salida):**
  * *Entrada:* `WordPress + WooCommerce` (equipado con el plugin *NP Quote Request* para disparar las solicitudes automatizadas hacia n8n).
  * *Salida:* `API de Gmail` para la notificación y entrega final al cliente.
