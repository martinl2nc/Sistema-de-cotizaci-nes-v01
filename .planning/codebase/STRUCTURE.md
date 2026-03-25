# Codebase Structure

**Analysis Date:** 2026-03-25

## Directory Layout

```
frontend/
├── src/
│   ├── App.tsx                    # Router entry, lazy route definitions
│   ├── main.tsx                   # Vite entry point, QueryClient setup
│   ├── index.css                  # Global Tailwind imports
│   │
│   ├── assets/                    # Static images, icons, fonts
│   │
│   ├── components/                # Reusable UI components
│   │   ├── admin/
│   │   │   └── AdminTabs.tsx      # Tab switcher for admin page
│   │   ├── layout/
│   │   │   └── ProtectedRoute.tsx # Auth + role-based route guard
│   │   └── ui/
│   │       └── Badge.tsx          # Status badge component
│   │
│   ├── config/
│   │   └── supabaseClient.ts      # Supabase client initialization
│   │
│   ├── context/
│   │   └── AuthContext.tsx        # Global auth state + useAuth hook
│   │
│   ├── features/                  # Feature-specific modules (domain-organized)
│   │   ├── clients/
│   │   │   └── ClientFormModal.tsx
│   │   ├── products/
│   │   │   ├── CategoryDrawer.tsx
│   │   │   └── ProductDrawer.tsx
│   │   └── sellers/
│   │       ├── SellerFormModal.tsx
│   │       └── SellersTab.tsx
│   │
│   ├── hooks/                     # Custom React Query + state hooks
│   │   ├── useCategories.ts       # Query: getCategories
│   │   ├── useClients.ts          # Queries: getClients, getActiveClients; Mutations: create, update, delete, toggle
│   │   ├── useCompanyConfig.ts    # Query: getCompanyConfig; Mutations: update
│   │   ├── useDashboardStats.ts   # Query: getDashboardStats
│   │   ├── useProducts.ts         # Queries: getProducts; Mutations: create, update, delete
│   │   ├── useQuotes.ts           # Queries: list, detail; Mutations: save, delete, updateStatus, updateFollowup, sendWebhook
│   │   └── useSellers.ts          # Query: getSellers; Mutations: create, update, delete
│   │
│   ├── layouts/                   # Layout wrapper components
│   │   ├── Header.tsx             # Top header with user menu, logout
│   │   ├── MainLayout.tsx         # Two-column layout (Sidebar + Outlet)
│   │   └── Sidebar.tsx            # Navigation menu
│   │
│   ├── pages/                     # Page components (routes)
│   │   ├── admin/
│   │   │   ├── ClientsPage.tsx    # Client CRUD page
│   │   │   ├── ComingSoonPage.tsx # Placeholder page
│   │   │   ├── CompanyConfigPage.tsx # Company settings
│   │   │   └── ProductsPage.tsx   # Product CRUD page
│   │   ├── auth/
│   │   │   └── Login.tsx          # Email/password login form
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx  # KPI cards + charts (Recharts)
│   │   └── quotes/
│   │       ├── QuoteForm.tsx      # Create/edit quote form
│   │       ├── QuotesList.tsx     # List with filters (search, seller, status)
│   │       ├── QuotePDFTemplate.tsx # @react-pdf/renderer template
│   │       ├── quoteForm.utils.ts # Helpers: formatCurrency, getClientDisplayName, validateQuoteForm
│   │       ├── useQuoteFormState.ts # Custom hook for form state (separate from server cache)
│   │       └── quotesListFilters.ts # (if extracted)
│   │
│   ├── services/                  # API layer (Supabase)
│   │   ├── categories.service.ts  # getCategories, createCategory, updateCategory, deleteCategory
│   │   ├── clients.service.ts     # getClients, getActiveClients, createClient, updateClient, deleteClient, toggleClientActive
│   │   ├── companyConfig.service.ts # getCompanyConfig, updateCompanyConfig
│   │   ├── dashboard.service.ts   # getDashboardStats
│   │   ├── products.service.ts    # getProducts, createProduct, updateProduct, deleteProduct
│   │   ├── quotes.service.ts      # getQuotes, getQuoteById, saveQuote (RPC + fallback), deleteQuote, updateQuoteStatus, updateQuoteFollowup
│   │   ├── sellers.service.ts     # getSellers, createSeller, updateSeller, deleteSeller
│   │   └── webhook.service.ts     # isWebhookConfigured, buildWebhookPayload, sendQuoteToWebhook
│   │
│   └── types/
│       └── iconify.d.ts           # Type definitions for iconify-icon
│
├── public/                        # Static assets served as-is
│   ├── vite.svg
│   └── index.html
│
├── dist/                          # Build output (generated)
├── node_modules/                  # Dependencies (generated)
│
├── eslintrc.config.js             # ESLint configuration
├── tsconfig.json                  # TypeScript project references
├── tsconfig.app.json              # App-specific TypeScript settings
├── tsconfig.node.json             # Build-tool TypeScript settings
├── vite.config.ts                 # Vite build configuration
├── package.json                   # Dependencies, scripts
└── tailwind.config.js             # Tailwind CSS configuration
```

## Directory Purposes

**src/:**
- Purpose: All application source code
- Contains: TypeScript/TSX files, CSS imports, asset references
- Key files: `App.tsx`, `main.tsx`

**src/components/:**
- Purpose: Reusable UI building blocks
- Contains: Layout wrappers (ProtectedRoute, AdminTabs), UI atoms (Badge)
- Key files: `src/components/layout/ProtectedRoute.tsx`

**src/config/:**
- Purpose: External service initialization
- Contains: Supabase client setup with environment validation
- Key files: `src/config/supabaseClient.ts`

**src/context/:**
- Purpose: Global state providers (React Context)
- Contains: Authentication context with session management
- Key files: `src/context/AuthContext.tsx`

**src/features/:**
- Purpose: Domain-organized feature modules (clients, products, sellers)
- Contains: Domain-specific form components and tabs
- Key files: ClientFormModal.tsx, ProductDrawer.tsx, SellerFormModal.tsx

**src/hooks/:**
- Purpose: Custom React hooks for data operations
- Contains: useQuery/useMutation wrappers from React Query
- Key files: useQuotes.ts, useClients.ts (most complex, multiple mutations)

**src/layouts/:**
- Purpose: Page layout components
- Contains: MainLayout (outlet wrapper), Sidebar (navigation), Header (user menu)
- Key files: `src/layouts/MainLayout.tsx`

**src/pages/:**
- Purpose: Route-mapped page components
- Contains: Pages organized by feature/route (admin/, auth/, dashboard/, quotes/)
- Key files: `src/pages/quotes/QuoteForm.tsx` (most complex form)

**src/services/:**
- Purpose: API integration layer
- Contains: Supabase queries and mutations, error handling with constraint mapping
- Key files: `src/services/quotes.service.ts` (RPC + fallback pattern)

**src/types/:**
- Purpose: Custom type definitions
- Contains: Type augmentation for third-party libraries (iconify-icon)
- Key files: `src/types/iconify.d.ts`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React root, QueryClient initialization, DOM mount
- `src/App.tsx`: Router setup, route definitions (lazy loaded pages), AuthProvider wrap

**Configuration:**
- `src/config/supabaseClient.ts`: Supabase client with VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
- `vite.config.ts`: Build config, path alias (@/*), dev server settings, minify (terser), chunk warning limit (500KB)
- `tsconfig.app.json`: TypeScript strict mode, path alias, ES2023 target, jsx: react-jsx
- `tailwind.config.js`: Tailwind CSS configuration (likely empty or minimal)

**Core Logic:**
- `src/context/AuthContext.tsx`: Auth state, Supabase listener, profile fetching
- `src/hooks/useQuotes.ts`: Query keys, mutations with optimistic updates
- `src/services/quotes.service.ts`: RPC attempt, legacy fallback, atomic transaction pattern
- `src/pages/quotes/QuoteForm.tsx`: Most complex page, PDF generation, form orchestration
- `src/pages/quotes/QuotesList.tsx`: Filtering, sorting, mutation handlers

**Testing:**
- No test files found in repository (testing not implemented)

## Naming Conventions

**Files:**
- Pages: PascalCase, suffix `-Page.tsx` (DashboardPage.tsx, ClientsPage.tsx)
- Components: PascalCase (MainLayout.tsx, ProtectedRoute.tsx)
- Hooks: camelCase, prefix `use-` (useQuotes.ts, useClients.ts)
- Services: camelCase, suffix `.service.ts` (quotes.service.ts, clients.service.ts)
- Utilities: camelCase (quoteForm.utils.ts)
- Types: camelCase, suffix `.d.ts` for type definitions (iconify.d.ts)

**Directories:**
- Feature directories: lowercase, plural (clients/, products/, sellers/)
- Layer directories: lowercase, descriptive (components/, hooks/, services/, context/)
- Nested feature routes: lowercase (admin/, auth/, dashboard/, quotes/)

## Where to Add New Code

**New Feature (e.g., new admin page):**
- Primary code: `src/pages/admin/NewFeaturePage.tsx`
- Service layer: `src/services/newFeature.service.ts`
- Hooks: `src/hooks/useNewFeature.ts` (create custom hook wrapper for React Query)
- Components: `src/features/newFeature/` (if form/modal needed)
- Route: Add to `src/App.tsx` Routes, lazy load component
- Types: Define in service file or separate `src/types/newFeature.ts` if complex

**New Component/Module:**
- Reusable UI component: `src/components/ui/ComponentName.tsx` or `src/components/layout/ComponentName.tsx`
- Feature-specific modal/form: `src/features/featureName/ComponentName.tsx`
- Layout component: `src/layouts/ComponentName.tsx`

**Utilities:**
- Form helpers: `src/pages/featureName/featureName.utils.ts` (co-located with page)
- Shared helpers: `src/utils/` (create if needed, currently inlined in pages)
- Service helpers: Export from service module (e.g., `isRpcFunctionMissing()` in quotes.service.ts)

## Special Directories

**node_modules/:**
- Purpose: Dependency packages (pnpm managed)
- Generated: Yes
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Production build output
- Generated: Yes (from `npm run build`)
- Committed: No (in .gitignore)

**.vscode/:**
- Purpose: Editor settings and extensions
- Generated: No
- Committed: Yes (part of repo for consistency)

**public/:**
- Purpose: Static assets served at root (images, favicon)
- Generated: No (may contain index.html template)
- Committed: Yes

**planning docs/ and wireframes/:**
- Purpose: Project documentation, UI mockups
- Generated: No
- Committed: Yes (informational only)

## Import Path Aliases

**Configured in tsconfig.app.json and vite.config.ts:**
- `@/*` → `src/*` (absolute imports from src root)

**Usage Pattern:**
```typescript
// Instead of:
import { useAuth } from '../../../context/AuthContext';

// Use:
import { useAuth } from '@/context/AuthContext';
```

---

*Structure analysis: 2026-03-25*
