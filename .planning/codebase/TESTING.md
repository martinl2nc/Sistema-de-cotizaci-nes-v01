# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework

**Status:** No testing framework detected

**Finding:**
- No test files found in `src/` directory (search for `*.test.*` and `*.spec.*` returned no results)
- No test runner configuration present (no `jest.config.*`, `vitest.config.*`)
- No testing libraries in `package.json` dependencies
- No test scripts in `package.json` (only `dev`, `build`, `lint`, `preview`)

**Implication:** All testing is currently manual or deferred to integration/E2E phases.

## Testing Gaps

**Critical Untested Areas:**

**Services Layer (8 services, ~600 LOC total):**
- `src/services/quotes.service.ts` (212 lines) - Complex quote CRUD logic with legacy fallback
- `src/services/dashboard.service.ts` (176 lines) - Analytics/KPI calculations
- `src/services/clients.service.ts` (119 lines) - Client management with error handling
- `src/services/companyConfig.service.ts` (122 lines) - Configuration management
- `src/services/products.service.ts` (92 lines) - Product catalog
- `src/services/webhook.service.ts` (71 lines) - External webhook integration
- No database transaction testing for atomic operations
- No error scenario testing (constraint violations, network failures)

**Custom Hooks (7 hooks, ~400 LOC total):**
- `src/hooks/useQuotes.ts` (119 lines) - Query and mutation hooks with optimistic updates
- `src/hooks/useClients.ts` (87 lines) - Client list/active queries
- `src/hooks/useProducts.ts` (73 lines) - Product queries
- `src/hooks/useSellers.ts` (67 lines) - Seller management
- No React Query integration tests
- No mutation success/error callback testing
- No query key invalidation testing

**Context/Auth (1 context, 167 lines):**
- `src/context/AuthContext.tsx` - Complex async auth state management
- Deferred profile loading pattern not tested
- Auth state transitions (INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT) untested

**Complex Components:**
- `src/pages/quotes/QuoteForm.tsx` (120+ lines) - Form state management with PDF generation
- `src/features/clients/ClientFormModal.tsx` (120+ lines) - Modal with create/edit modes
- `src/pages/dashboard/DashboardPage.tsx` (80+ lines) - Chart rendering and KPI display
- No form validation testing
- No mutation/mutation error handling testing
- No render prop testing

## Recommended Testing Strategy

### Phase 1: Unit Tests (Services & Utils)

**Test Framework Setup:**
```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev @supabase/supabase-js@mocked
```

**Target Services for Testing:**
1. `src/services/quotes.service.ts` - Focus on business logic:
   - `buildHeadPayload()` payload transformation
   - `normalizeLineItems()` data normalization
   - `saveQuoteLegacy()` database operations
   - Error handling for constraint violations

2. `src/services/clients.service.ts` - Focus on error handling:
   - Duplicate email detection (code 23505)
   - Duplicate document detection
   - Client creation/update/delete

3. `src/services/dashboard.service.ts` - Focus on calculations:
   - Quote status aggregation
   - Revenue calculations
   - Date range filtering

### Phase 2: Hook Integration Tests

**Target Hooks:**
1. `src/hooks/useQuotes.ts` - React Query integration:
   - Query key factory structure
   - Mutation success invalidations
   - Optimistic update rollback on error

2. `src/hooks/useClients.ts` - Multi-query invalidation:
   - Query relationships
   - List/active query separation

### Phase 3: Component Integration Tests

**Testing Library Setup:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

**Target Components:**
1. `src/features/clients/ClientFormModal.tsx`:
   - Form input changes
   - Create vs Edit mode detection
   - Form validation
   - Mutation error display

2. `src/pages/quotes/QuoteForm.tsx`:
   - Line item management
   - PDF generation trigger
   - Form state reset after save

## Suggested Test File Structure

```
src/
├── services/
│   ├── __tests__/
│   │   ├── quotes.service.test.ts
│   │   ├── clients.service.test.ts
│   │   └── dashboard.service.test.ts
│   └── quotes.service.ts
├── hooks/
│   ├── __tests__/
│   │   ├── useQuotes.test.ts
│   │   └── useClients.test.ts
│   └── useQuotes.ts
└── features/
    └── clients/
        ├── __tests__/
        │   └── ClientFormModal.test.tsx
        └── ClientFormModal.tsx
```

## Key Testing Patterns for Implementation

**Mocking Supabase Calls:**
```typescript
import { vi } from 'vitest';

vi.mock('@/config/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    })),
  },
}));
```

**Testing React Query Mutations:**
```typescript
// Pattern used in codebase for success callbacks
const mutation = useMutation({
  mutationFn: (data) => createClient(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: clientsKeys.list() });
  },
});

// Test: verify invalidation on success
expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
  queryKey: clientsKeys.list(),
});
```

**Testing Form Components:**
```typescript
// Pattern used in ClientFormModal
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

// Test pattern
userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
expect(formData.email).toBe('test@example.com');
```

**Testing Custom Hooks:**
```typescript
// Pattern to test useQuotes hooks
import { renderHook, waitFor } from '@testing-library/react';

const { result } = renderHook(() => useQuotesList());

await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});

expect(result.current.data).toEqual(expectedQuotes);
```

## Coverage Targets

**High Priority (>80% coverage):**
- Service layer functions (all database operations)
- Custom hooks (React Query integration)
- Utility functions (calculations, formatting)

**Medium Priority (>60% coverage):**
- Context providers (auth state management)
- Modal/Drawer components (form handling)
- Feature components (business logic)

**Low Priority (>40% coverage):**
- Page layout components
- UI utility components (Badge, Skeleton)
- Navigation components

## No Test Infrastructure Currently Exists

**What to set up before writing tests:**
1. Install test framework and dependencies
2. Create `vitest.config.ts` at project root
3. Add test npm scripts: `npm run test`, `npm run test:watch`, `npm run test:coverage`
4. Configure test environment (happy-dom or jsdom for React)
5. Set up module name mapper for `@/` alias in test runner
6. Install testing utilities and mocking libraries

---

*Testing analysis: 2026-03-25*
