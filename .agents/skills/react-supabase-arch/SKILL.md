---
name: react-supabase-architecture
description: Úsalo siempre que necesites planificar, crear o refactorizar módulos, componentes o conexiones a base de datos en React con Supabase. Obliga al uso de una arquitectura de 3 capas, TanStack Query v5 y TypeScript estricto.
---

# Arquitectura React + Supabase + TanStack Query

Actúas como un Tech Lead Frontend. Al trabajar en este proyecto, DEBES aplicar estrictamente esta arquitectura y generar un Artifact de plan de implementación antes de codificar.

## 1. Inspección de Base de Datos (Uso de MCP/Contexto)
- ANTES de escribir código, usa tus capacidades de inspección de entorno o MCP para leer el esquema real de la base de datos en Supabase.
- Verifica los nombres exactos de las tablas, columnas, tipos (UUID, int, varchar) y las Foreign Keys. **Nunca adivines el esquema.**

## 2. Regla de Oro del Estado
- **PROHIBIDO** usar `useEffect` o `useState` para hacer llamadas HTTP o consultas a Supabase.
- TODO el estado asíncrono (Server State) se maneja exclusivamente con `@tanstack/react-query` (v5).

## 3. Arquitectura Estricta de 3 Capas
Cada vez que crees una entidad (ej. "Facturas", "OrdenesCompra"), DEBES dividir el trabajo en estos 3 archivos exactos:

### CAPA 1: Servicios (`src/services/{entidad}.service.ts`)
- Solo llamadas puras usando `@supabase/supabase-js`. Cero React aquí.
- Usa consultas relacionales nativas de Supabase si hay Foreign Keys (ej. `.select('*, proveedores(nombre)')`).
- Maneja y lanza errores explícitos (`throw new Error(error.message)`).

### CAPA 2: Custom Hooks (`src/hooks/use{Entidad}.ts`)
- Usa `useQuery({ queryKey, queryFn })` para lectura (GET).
- Usa `useMutation` para escritura (POST/PUT/DELETE).
- En mutaciones, SIEMPRE incluye el callback `onSuccess` para invalidar la caché: `queryClient.invalidateQueries({ queryKey: [...] })`.

### CAPA 3: Componentes UI (`src/features/{modulo}/{Componente}.tsx`)
- Componentes 100% tontos ("Dumb Components").
- Solo consumen la data, `isLoading` e `isError` del hook de la Capa 2.

## 4. Tipado TypeScript Estricto
- **Prohibido el uso de `any`.**
- Genera y usa las interfaces o tipos exactos basados en la estructura real de Supabase.
- Tipa estrictamente los *Props* de los componentes `.tsx`.
- Exportaciones nombradas (`export const`) preferidas sobre `export default`.