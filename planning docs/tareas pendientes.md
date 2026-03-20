# Tareas Pendientes

## Clientes
- [ ] **Borrado lógico de Clientes:** Agregar una columna `estado` (por ejemplo, booleano `activo` o texto `estado` = 'Activo'/'Inactivo') a la tabla `clientes`. Esto permitirá desactivar clientes sin borrarlos físicamente de la base de datos, evitando romper las dependencias de llaves foráneas con sus cotizaciones históricas, manejándolo de manera similar a los productos.
  - Al estar inactivo, el cliente ya no debe aparecer en los selectores ni resultados de búsqueda al momento de crear una nueva cotización.(Hecho)
- [ ] **Validación de correo único:** Actualmente la base de datos y el frontend permiten registrar múltiples clientes con exactamente el mismo correo electrónico. Se debe evaluar e implementar una restricción `UNIQUE` en la base de datos y mostrar un error amigable en el formulario si se intenta duplicar.

## Categorías
- [ ] **Discrepancia en borrado de categorías:** La base de datos está configurada con `ON DELETE SET NULL` para los productos. Esto significa que si se borra una categoría, se borra exitosamente y sus productos quedan huérfanos de categoría (`categoria_id = NULL`). Sin embargo, el frontend (`categories.service.ts`) erróneamente asume que la base de datos bloqueará esto con un error `23503` ("esta categoría tiene productos asociados"). Se debe:
  - Cambiar la regla en la base de datos a `ON DELETE RESTRICT` si no se desea permitir borrar categorías en uso.
  - O actualizar el frontend para reflejar que la categoría sí se borra y los productos quedan en "Sin categoría".

## Empresa y Configuración General
- [ ] **Configuración de Logo de la Empresa:** Agregar funcionalidad para subir y administrar el logo de la empresa desde la sección "Configuración de Empresa".
  - Reflejar este logo visualmente en la aplicación (por ejemplo, en la cabecera del frontend).
  - Inyectar el logo en el documento PDF final de las cotizaciones generadas.
  - *Requerimiento técnico:* Crear una columna `logo_url` en la tabla `empresa_configuracion` y configurar un bucket en **Supabase Storage** para alojar y servir la imagen de manera pública/segura.

## Módulo de Autenticación (Login)
- [ ] **Integrar Supabase Auth:** Configurar el sistema de autenticación seguro de Supabase.
- [ ] **Restricción de Acceso (Rutas Protegidas):** Proteger todas las pantallas internas para que solo sean accesibles por usuarios logueados. Redirigir al login si no hay sesión activa.
- [ ] **Pantalla de Login:** Crear la interfaz gráfica (UI) para iniciar sesión (usuario/correo y contraseña).
- [ ] **Info de Sesión en UI:** Mostrar la información del usuario logueado en el sidebar de la aplicación.
- [ ] **Modificación de BD (RLS y Auth):** Usar las funcionalidades de la tabla auth de Supabase y enlazarlas con los usuarios de la tabla `vendedores`. Se deben aplicar políticas RLS (Row Level Security) más estrictas que las actuales (uso en desarrollo).
