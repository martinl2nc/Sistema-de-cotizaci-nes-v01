# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Layered frontend architecture with React Router-based routing, TanStack React Query for server state management, and domain-organized service layer.

**Key Characteristics:**
- Route-based code splitting using lazy loading (Vite/React lazy)
- Separation of concerns: UI (pages/components) → Hooks (data orchestration) → Services (API integration)
- Context-based global state (AuthContext) for authentication
- Supabase as single backend integration point
- Responsive dark theme UI using Tailwind CSS with custom color palette

## Layers

**Presentation Layer (Pages & Components):**
- Purpose: Render UI and handle user interactions
- Location: `src/pages/`, `src/components/`
- Contains: Page components (QuotesList, QuoteForm, DashboardPage), layout components (MainLayout, Sidebar), UI components (Badge)
- Depends on: Hooks (custom React hooks for data fetching), Context (AuthContext for user state), Services (webhook service for side effects)
- Used by: React Router (entry point is `src/App.tsx`)

**State Management Layer (Hooks):**
- Purpose: Manage server state via React Query and coordinate data operations
- Location: `src/hooks/`
- Contains: Custom hooks with useQuery/useMutation patterns (useQuotes, useClients, useProducts, useSellers, useDashboardStats)
- Depends on: Services (domain-specific service functions), React Query queryClient
- Used by: Page and component layers for data fetching/mutation

**Service Layer (Data & API Integration):**
- Purpose: Encapsulate Supabase API calls and business logic
- Location: `src/services/`
- Contains: Service modules (quotes.service.ts, clients.service.ts, products.service.ts, categories.service.ts, dashboard.service.ts, webhook.service.ts, sellers.service.ts, companyConfig.service.ts)
- Depends on: `src/config/supabaseClient.ts` for database client
- Used by: Hooks and components for API operations

**Configuration & Integration Layer:**
- Purpose: Manage external service clients and environment setup
- Location: `src/config/`
- Contains: Supabase client initialization (supabaseClient.ts) with environment variable validation
- Depends on: @supabase/supabase-js SDK
- Used by: All service modules

**Context/Global State Layer:**
- Purpose: Manage global authentication state and user session
- Location: `src/context/`
- Contains: AuthContext provider with subscription to Supabase auth state changes
- Depends on: Supabase client for auth events
- Used by: App.tsx root, ProtectedRoute component, all authenticated pages

## Data Flow

**Authentication Flow:**
1. User accesses `/login` route (public)
2. Login page uses Supabase `signInWithPassword()` via Login component
3. Supabase emits auth state change event
4. AuthContext listener (useEffect in AuthProvider) captures SIGNED_IN event
5. AuthContext loads user profile from `perfiles_usuario` table via `fetchUserProfile()`
6. AuthContext updates global state (user, role, nombre)
7. ProtectedRoute checks authentication and role, allows/denies route access

**Quote Data Flow (Example):**
1. QuotesList page mounts → calls `useQuotesList()` hook
2. Hook executes `quotesService.getQuotes()` → Supabase query with joins (clientes, perfiles_usuario)
3. React Query caches result with key `['quotes', 'list']`
4. QuotesList renders with cached data or loading state
5. User updates quote status → `useUpdateQuoteStatus()` mutation triggered
6. Mutation performs optimistic update to cache (onMutate)
7. Mutation calls `quotesService.updateQuoteStatus()` → Supabase update
8. On settlement (success/error), React Query invalidates `['quotes', 'list']` → refetch
9. Cache updated, UI re-renders with server state

**Quote Form Data Flow:**
1. QuoteForm page mounts with optional :id param (create or edit mode)
2. `useQuoteDetail(id)` fetches existing quote if editing
3. `useQuoteFormState()` custom hook manages local form state (separate from server cache)
4. Form changes update local state only (quoteData, lineItems)
5. User clicks Save → form validation via `validateQuoteForm()`
6. `useSaveQuote()` mutation triggered with QuoteFormData
7. Service calls `quotesService.saveQuote()` which:
   - Attempts atomic RPC `save_quote_atomic()` if available
   - Falls back to legacy transaction (separate header + lines) if RPC missing
8. On success, mutation invalidates quotes list cache and navigates to list
9. PDF generation happens separately on "Generate PDF" action

**State Management:**
- Server state: Cached by React Query, keyed by query patterns (e.g., `['quotes', 'list']`, `['quotes', 'detail', id]`)
- Global state: AuthContext provides user, session, role, isLoading
- Local UI state: Component useState for filters, modals, form inputs (search, seller filters, modal open/close flags)
- Separation: Queries are read-only (useQuery), mutations modify server (useMutation), local state is component-specific

## Key Abstractions

**React Query Hook Pattern:**
- Purpose: Standardize data fetching and mutation across the app
- Examples: `useQuotesList()`, `useSaveQuote()`, `useDeleteQuote()`, `useClients()`
- Pattern: Custom hooks export useQuery/useMutation wrappers, define query keys via objects (e.g., `quotesKeys`), handle onMutate/onError/onSettled lifecycle

**Service Layer Abstraction:**
- Purpose: Isolate Supabase API calls from UI logic
- Examples: `quotesService.saveQuote()`, `clientsService.createClient()`, `dashboardService.getDashboardStats()`
- Pattern: Named exports of async functions or service objects with methods, return typed data or throw errors

**Protected Route Component:**
- Purpose: Enforce authentication and role-based access control
- Location: `src/components/layout/ProtectedRoute.tsx`
- Pattern: React Router outlet component, checks `useAuth()` for user/role, redirects to /login if unauthorized

**Form State Management Hook:**
- Purpose: Manage quote form state (header + line items) separately from server cache
- Location: `src/pages/quotes/useQuoteFormState.ts`
- Pattern: Custom hook returning form data, totals calculation, and mutation handlers (addLineItem, updateLineItem, removeLineItem)

**Webhook Service:**
- Purpose: Decouple external webhook calls from quote operations
- Location: `src/services/webhook.service.ts`
- Pattern: Functions to detect webhook configuration and build webhook payloads, used by QuoteForm when generating PDFs

## Entry Points

**App Component:**
- Location: `src/App.tsx`
- Triggers: Rendered by `main.tsx` in React.StrictMode with QueryClientProvider
- Responsibilities: Router configuration, route definitions, lazy loading code splitting, public/protected route structure, auth context wrapping

**Main Renderer:**
- Location: `src/main.tsx`
- Triggers: Webpack/Vite entry point
- Responsibilities: React root creation, QueryClient initialization (5 min staleTime, no refetchOnWindowFocus), mount to DOM

**Auth Provider:**
- Location: `src/context/AuthContext.tsx`
- Triggers: Wraps App.tsx
- Responsibilities: Subscribe to Supabase onAuthStateChange, manage global auth state, provide useAuth hook, handle sign out logic

**Layout:**
- Location: `src/layouts/MainLayout.tsx`
- Triggers: All authenticated routes render through MainLayout (Route element=<MainLayout />)
- Responsibilities: Render two-column layout (Sidebar + main), Outlet for nested routes, dark theme CSS classes

## Error Handling

**Strategy:** Try-catch with user-facing error messages, optional validation before mutations

**Patterns:**
- Service functions throw errors which bubble to hooks/components
- Components catch errors in mutation callbacks (onError handler) or component try-catch
- User feedback: State errors (e.g., setError) displayed as toast/alert-like messages
- Constraint violations: Supabase error codes (23505 for unique, 23503 for FK) mapped to readable messages in clients.service.ts
- Fallback mechanisms: Quote save attempts RPC, falls back to legacy transaction if PGRST202 error
- Auth errors: Login page distinguishes "Invalid credentials" from network timeouts (8s timeout on signInWithPassword)

## Cross-Cutting Concerns

**Logging:** Console.error for caught exceptions, minimal structured logging

**Validation:**
- Form validation via Zod schemas (e.g., Login form schema, QuoteForm inline validation)
- Quote form validation helper `validateQuoteForm()` checks required fields before save

**Authentication:**
- Supabase session-based with JWT stored in localStorage
- Profile data (rol, nombre) fetched from custom `perfiles_usuario` table
- ProtectedRoute enforces authentication and admin role checks

**Styling:** Tailwind CSS with dark theme (class-based, colors prefixed with bg-, text-, border-)

**Internationalization:** Spanish locale hardcoded in UI (no i18n framework), format functions use `es-PE` locale for currency

---

*Architecture analysis: 2026-03-25*
