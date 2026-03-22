# Tareas Pendientes

## Clientes
- [x] **Borrado lógico de Clientes:** Agregar una columna `estado` (por ejemplo, booleano `activo` o texto `estado` = 'Activo'/'Inactivo') a la tabla `clientes`. Esto permitirá desactivar clientes sin borrarlos físicamente de la base de datos, evitando romper las dependencias de llaves foráneas con sus cotizaciones históricas, manejándolo de manera similar a los productos.
  - Al estar inactivo, el cliente ya no debe aparecer en los selectores ni resultados de búsqueda al momento de crear una nueva cotización. **(Hecho - 2026-03-21)**
- [x] **Validación de correo único:** Actualmente la base de datos y el frontend permiten registrar múltiples clientes con exactamente el mismo correo electrónico. Se debe evaluar e implementar una restricción `UNIQUE` en la base de datos y mostrar un error amigable en el formulario si se intenta duplicar. **(Hecho - 2026-03-21)**

## Categorías
- [x] **Discrepancia en borrado de categorías:** La base de datos ahora usa `ON DELETE RESTRICT`. Las categorías con productos asociados no se pueden eliminar hasta reasignar los productos a otra categoría. El frontend verifica proactivamente el número de productos antes de intentar borrar y muestra mensajes claros al usuario. **(Completado - 2026-03-21)**

## Empresa y Configuración General
- [ ] **Configuración de Logo de la Empresa:** Del lado del código ya está implementado el flujo para subir, reemplazar y eliminar logo desde "Configuración de Empresa", con visualización activa en Sidebar y Header.
  - Pendiente: validar/implementar en **n8n + APITemplate** el mapeo de `empresa_configuracion.logo_url` para que el logo se inyecte en el PDF final.
  - *Requerimiento técnico (código/BD):* Columna `logo_url` operativa y bucket `company-assets` con URL pública en uso. **(Implementado - 2026-03-21)**

## Módulo de Autenticación (Login)
- [ ] **Integrar Supabase Auth:** Configurar el sistema de autenticación seguro de Supabase.
- [ ] **Restricción de Acceso (Rutas Protegidas):** Proteger todas las pantallas internas para que solo sean accesibles por usuarios logueados. Redirigir al login si no hay sesión activa.
- [ ] **Pantalla de Login:** Crear la interfaz gráfica (UI) para iniciar sesión (usuario/correo y contraseña).
- [ ] **Info de Sesión en UI:** Mostrar la información del usuario logueado en el sidebar de la aplicación.
- [ ] **Modificación de BD (RLS y Auth):** Usar las funcionalidades de la tabla auth de Supabase y enlazarlas con los usuarios de la tabla `vendedores`. Se deben aplicar políticas RLS (Row Level Security) más estrictas que las actuales (uso en desarrollo).

## Arquitectura y Calidad de Código
- [x] **Fase 3 - Guardado Atómico de Cotizaciones (RPC):** Migración y validación completadas en Supabase; creación y edición de cotizaciones funcionando correctamente con `save_quote_atomic` activa. **(Completado - 2026-03-21)**
  - Scripts usados: `MIGRAR_SAVE_QUOTE_ATOMIC.sql` y `VERIFICAR_SAVE_QUOTE_ATOMIC.sql`.
  - Estado actual: frontend listo con fallback seguro y backend operando con RPC atómica.
