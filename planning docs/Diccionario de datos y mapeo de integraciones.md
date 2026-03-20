# 📄 DOC 3: Diccionario de Datos y Mapeo de Integraciones (JSON)

Este documento define la estructura exacta de la información en los dos puentes críticos de tu sistema: la entrada (WooCommerce a n8n) y la salida (n8n a APITemplate).

## PARTE 1: La Entrada (WooCommerce ➔ n8n ➔ Supabase)

Cuando configures el formulario de "Solicitar Cotización" en WooCommerce, asegúrate de que los campos tengan estos **"Nombres de variable" (Meta Keys)**.

### 1.1 Estructura esperada desde WooCommerce (El JSON de entrada)

Este es un ejemplo de cómo llegará el paquete a n8n. Fíjate en cómo WooCommerce separa nativamente el nombre de la persona y el nombre de la compañía.

```json
{
  "order_id": 9054,
  "origen": "Web",
  "billing": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@empresa.com",
    "phone": "987654321",
    "address_1": "Av. Los Negocios 123",
    "company": "Empresa SAC", 
    "billing_tipo_documento": "RUC", 
    "billing_numero_documento": "20123456789", 
    "billing_tipo_comprobante": "Factura"
  },
  "line_items": [
    {
      "product_id": 105,
      "name": "Servidor Dell PowerEdge",
      "quantity": 2,
      "price": 2500.00
    },
    {
      "product_id": 108,
      "name": "Licencia Windows Server",
      "quantity": 1,
      "price": 800.00
    }
  ]
}
```

### 1.2 Mapeo hacia la Base de Datos (Supabase)

En n8n, usarás los nodos de Postgres para insertar estos datos. Así es como conectas el JSON de arriba con las nuevas columnas B2B/B2C de tu base de datos:

| Variable de WooCommerce (JSON) | ➔ | Columna en Supabase |
| :--- | :--- | :--- |
| `billing.billing_tipo_documento` | ➔ | `clientes.tipo_documento` |
| `billing.billing_numero_documento` | ➔ | `clientes.numero_documento` |
| `billing.company` *(Puede venir vacío si es B2C)* | ➔ | `clientes.razon_social` |
| `billing.first_name` | ➔ | `clientes.nombres_contacto` |
| `billing.last_name` | ➔ | `clientes.apellidos_contacto` |
| `billing.email` | ➔ | `clientes.email` |
| `billing.phone` | ➔ | `clientes.telefono` |
| `billing.address_1` | ➔ | `clientes.direccion` |
| `billing.billing_tipo_comprobante` | ➔ | `clientes.comprobante_preferido` |
| `order_id` | ➔ | `cotizaciones.woo_order_id` |
| `"Web"` (Texto estático) | ➔ | `cotizaciones.origen` |
| **En el Bucle (Loop) de `line_items`:** | | |
| `line_items[i].name` | ➔ | `cotizaciones_lineas.nombre_producto_historico` |
| `line_items[i].quantity` | ➔ | `cotizaciones_lineas.cantidad` |
| `line_items[i].price` | ➔ | `cotizaciones_lineas.precio_unitario` |

*(Nota: Como configuramos la base de datos para que el ID del producto sea opcional, la línea de cotización se guardará perfectamente solo con el nombre, cantidad y precio que vengan de la web).*

---

## PARTE 2: La Salida (n8n ➔ APITemplate.io)

Una vez que el vendedor revisó, editó y aprobó la cotización en la Aplicación React, n8n junta toda la información de la base de datos y la envía a APITemplate para dibujar el PDF.

### 2.1 El JSON de renderizado (Payload para el PDF)

En el editor visual de APITemplate, usarás exactamente estos nombres de variables (ej. `{{cotizacion_codigo}}` o `{{cliente.nombres_contacto}}`) en tus cajas de texto. Fíjate cómo el bloque `cliente` ahora tiene la separación correcta.

```json
{
  "cotizacion_codigo": "COT-0014",
  "fecha_emision": "2024-05-20",
  "fecha_validez": "2024-06-04",
  "vendedor": {
    "nombre": "Carlos Vendedor",
    "email": "carlos@tuempresa.com"
  },
  "empresa": {
    "razon_social": "Tu Empresa S.A.C.",
    "ruc": "20999888777",
    "direccion": "Calle Falsa 123, Lima",
    "cuentas_bancarias": "BCP Soles: 191-00000000-0-00\nCCI: 00219100000000000054",
    "terminos": "Toda cotización está sujeta a stock. Validez de 15 días."
  },
  "cliente": {
    "razon_social": "Empresa SAC",
    "nombres_contacto": "Juan",
    "apellidos_contacto": "Pérez",
    "documento_tipo": "RUC",
    "documento_numero": "20123456789",
    "direccion": "Av. Los Negocios 123",
    "telefono": "987654321",
    "comprobante": "Factura"
  },
  "observaciones": "El cliente solicita entrega en la sucursal Norte. Incluye instalación básica.",
  "totales": {
    "subtotal": 5800.00,
    "descuento_global": 200.00,
    "subtotal_con_descuento": 5600.00,
    "aplica_igv": true,
    "igv_monto": 1008.00,
    "total_final": 6608.00
  },
  "lineas": [
    {
      "item": 1,
      "descripcion": "Servidor Dell PowerEdge",
      "cantidad": 2,
      "precio_unit": 2500.00,
      "descuento": 0.00,
      "subtotal": 5000.00
    },
    {
      "item": 2,
      "descripcion": "Licencia Windows Server",
      "cantidad": 1,
      "precio_unit": 800.00,
      "descuento": 0.00,
      "subtotal": 8000.00
    }
  ]
}
```

### 2.2 Notas para el diseño en APITemplate

1. **Tabla Dinámica:** En APITemplate, la sección de productos se configura seleccionando el bloque de tabla y diciéndole que itere sobre la variable `lineas`. Automáticamente creará tantas filas como productos haya en ese array.
2. **Condicionales de Cliente B2B/B2C:** En el diseño del PDF, puedes crear un bloque de texto que diga `Empresa: {{cliente.razon_social}}` y configurar APITemplate para que oculte esa línea si `cliente.razon_social` viene vacío. Justo debajo puedes poner `Atención a: {{cliente.nombres_contacto}} {{cliente.apellidos_contacto}}`. Así tu PDF se verá profesional tanto si le vendes a una transnacional como a una persona natural.
3. **Condicionales (IGV):** Puedes configurar en APITemplate que la fila que dice "IGV (18%): S/ 1008.00" **solo se muestre** si la variable `totales.aplica_igv` es `true`. Así, si atiendes a un cliente exonerado, el renglón del IGV desaparece mágicamente del PDF.

---
