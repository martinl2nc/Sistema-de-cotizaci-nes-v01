# Coding Conventions

**Analysis Date:** 2026-03-25

## Naming Patterns

**Files:**
- **Services:** `*.service.ts` (e.g., `clients.service.ts`, `quotes.service.ts`) - Located in `src/services/`
- **Hooks:** `use*.ts` (e.g., `useClients.ts`, `useQuotes.ts`) - Located in `src/hooks/`
- **Components:** PascalCase for React components (e.g., `ClientFormModal.tsx`, `Badge.tsx`) - Located in `src/components/` and `src/features/`
- **Pages:** PascalCase (e.g., `DashboardPage.tsx`, `QuoteForm.tsx`) - Located in `src/pages/`
- **Contexts:** PascalCase (e.g., `AuthContext.tsx`) - Located in `src/context/`
- **Config files:** camelCase (e.g., `supabaseClient.ts`)

**Functions:**
- Prefix custom hooks with `use` (e.g., `useQuotes`, `useClients`, `useCompanyConfig`)
- Service functions use verb-noun pattern: `getClients()`, `createClient()`, `updateClient()`, `deleteClient()`, `toggleClientActive()`
- Utility functions in lowercase with underscores for compound names (e.g., `formatCurrency()`, `getClientDisplayName()`, `validateQuoteForm()`)
- Component functions use PascalCase (e.g., `KpiCard()`, `SectionCard()`, `Skeleton()`)

**Variables:**
- Local state and constants use camelCase (e.g., `isLoading`, `errorMessage`, `clientData`)
- React state variables follow `[value, setValue]` pattern (e.g., `const [error, setError] = useState(null)`)
- Query/mutation variables follow naming convention: `useXxxMutation()`, `useXxxQuery()`
- Constants use UPPER_SNAKE_CASE (e.g., `ESTADO_COLORS`, `DEFAULT_OPTIONS`)

**Types:**
- Interface names start with capital letter (e.g., `Client`, `ClientFormData`, `AuthState`, `KpiCardProps`)
- Type names are clear and plural when representing collections (e.g., `QuoteLineItem`, `Quote`, `Session`)
- Generic type parameters use single letter conventions (e.g., `T`, `K`)

## Code Style

**Formatting:**
- No Prettier configuration enforced in root; ESLint config found at `frontend/eslint.config.js`
- Uses default formatting standards with focus on TypeScript/TSX files
- Component JSX indentation: 2-space indent standard in React components

**Linting:**
- Tool: ESLint 9.39.4 with TypeScript ESLint plugin
- Config: `frontend/eslint.config.js` (FlatConfig format)
- Key rules applied:
  - `@eslint/js.configs.recommended` - Basic JS rules
  - `tseslint.configs.recommended` - TypeScript strict mode
  - `reactHooks.configs.flat.recommended` - React Hooks best practices
  - `reactRefresh.configs.vite` - Vite React refresh
- Custom rules:
  - `react-hooks/set-state-in-effect: off` - Allows setState inside effects
  - `react-refresh/only-export-components: off` - Allows non-component exports

**TypeScript Strict Mode:**
- Enabled at `frontend/tsconfig.app.json`
- Strict mode active: `"strict": true`
- No unused locals: `"noUnusedLocals": true`
- No unused parameters: `"noUnusedParameters": true`
- No unchecked side effect imports: `"noUncheckedSideEffectImports": true`
- No fallthrough cases in switch: `"noFallthroughCasesInSwitch": true`

## Import Organization

**Order:**
1. React and external libraries (e.g., `import { useState } from 'react'`)
2. External packages (e.g., `import { useQuery } from '@tanstack/react-query'`)
3. Internal services/hooks (e.g., `import { quotesService } from '@/services/quotes.service'`)
4. Internal components/utilities (e.g., `import ClientFormModal from '@/features/clients/ClientFormModal'`)
5. Type imports (e.g., `import type { Client } from '@/services/clients.service'`)

**Path Aliases:**
- Single alias configured: `@/*` maps to `src/*`
- Example usage: `import { useClients } from '@/hooks/useClients'` instead of relative imports

**Example from codebase:**
```typescript
// From useQuotes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesService } from '@/services/quotes.service';
import type { QuoteFormData, QuoteStatus, Quote } from '@/services/quotes.service';
import { sendQuoteToWebhook } from '@/services/webhook.service';
import type { SendQuoteWebhookParams } from '@/services/webhook.service';
```

## Error Handling

**Patterns:**
- Try-catch blocks for async database operations (e.g., in `AuthContext.tsx` fetchUserProfile)
- Service functions throw errors with descriptive messages: `throw new Error('Error al crear cliente: ' + error.message)`
- Database constraint errors caught with specific error codes:
  - `error.code === '23505'` for duplicate key violations
  - `error.code === 'PGRST202'` for missing RPC functions
- Mutation errors handled via `onError` callback in React Query hooks
- Error messages propagated to UI via state (e.g., `const [error, setError] = useState<string | null>(null)`)

**Example from clients.service.ts:**
```typescript
if (error) {
  // Error por email duplicado
  if (error.code === '23505' && error.message.includes('clientes_email_unique')) {
    throw new Error('Ya existe un cliente registrado con este correo electrónico.');
  }
  // Error por documento duplicado
  if (error.code === '23505' && error.message.includes('numero_documento')) {
    throw new Error('Ya existe un cliente con este número de documento.');
  }
  throw new Error('Error al crear cliente: ' + error.message);
}
```

## Logging

**Framework:** console (browser console API)

**Patterns:**
- Minimal logging in production code (only 8 console statements found in entire codebase)
- Error logging: `console.error()` for critical failures (e.g., in AuthContext.tsx)
- Debug logging reserved for development scenarios
- No dedicated logging library in use

**Example from AuthContext.tsx:**
```typescript
if (error) {
  console.error('Error fetching user profile:', error);
  return null;
}
```

## Comments

**When to Comment:**
- Comment complex logic or non-obvious implementations
- Use comments to explain the "why" not the "what"
- Comments use different styles based on context:
  - Block comments with visual separators for major sections
  - Inline comments for tricky logic

**Comment Styles Observed:**
```typescript
// ─── Single line comments with visual separator ──────────────────
// Used for section headers

// Inline comment explaining single line of code
const finalQuoteId = quoteData.id;

/* Multi-line explanation
   for complex logic blocks */
```

**JSDoc/TSDoc:**
- Not widely used in the codebase
- Type definitions preferred over JSDoc comments
- Some interface documentation through TypeScript types

## Function Design

**Size:** Functions range from 8-120 lines, typically keep logic focused
- Service functions are lean wrappers around database calls
- Custom hooks handle data fetching and caching logic
- Components separate concerns: data fetching vs rendering

**Parameters:**
- Use object destructuring for components (e.g., `{ isOpen, onClose, client, onSuccess }`)
- Service functions accept typed data objects
- Hooks avoid excess parameters by using custom return objects

**Return Values:**
- Service functions return strongly typed data: `Promise<Client>`, `Promise<Client[]>`
- Hooks return React Query objects: `{ data, error, isLoading }`
- Components return JSX elements or null
- Utility functions return specific types (string, number, boolean, object)

**Example from ClientFormModal.tsx:**
```typescript
interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess?: (client: Client) => void;
}

export default function ClientFormModal({ isOpen, onClose, client, onSuccess }: ClientFormModalProps) {
  // Component logic
}
```

## Module Design

**Exports:**
- Default exports for single component per file
- Named exports for multiple utilities or factory functions (e.g., service functions)
- Type exports use `export type` or `export interface` syntax

**Example from quotes.service.ts:**
```typescript
export interface QuoteLineItem {
  // interface definition
}

export type QuoteStatus = 'Aprobada' | 'PDF Generado' | 'Enviada' | 'Cancelada' | 'Borrador';

export interface Quote {
  // interface definition
}

// Default export at end of file
export const quotesService = { ... };
```

**Barrel Files:**
- Not used in this codebase
- Direct imports from specific service/hook files preferred

## Query State Management

**React Query Pattern:**
- Query key factory pattern used in hooks (e.g., `quotesKeys`, `clientsKeys`)
- Hierarchical structure: `all()` → `list()` → `detail(id)`
- Example from useClients.ts:
```typescript
export const clientsKeys = {
  all: () => ['clients'] as const,
  list: () => [...clientsKeys.all(), 'list'] as const,
  active: () => [...clientsKeys.all(), 'active'] as const,
};
```

**Mutations:**
- Use `onSuccess` callback to invalidate related queries
- Optimistic updates implemented for status changes (e.g., updateQuoteStatus)
- Error handling via `onError` callback with context for rollback

**Caching:**
- `staleTime: 1000 * 60 * 5` (5 minutes) for data queries
- `refetchOnWindowFocus: false` in QueryClient defaults

---

*Convention analysis: 2026-03-25*
