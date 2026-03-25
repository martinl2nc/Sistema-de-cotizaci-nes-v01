# Codebase Concerns

**Analysis Date:** 2026-03-25

## Tech Debt

**Missing Test Coverage:**
- Issue: No unit or integration tests found in the codebase. Zero test files exist in `frontend/src/`.
- Files: All files under `frontend/src/`
- Impact: Unable to catch regressions when refactoring, increased risk of breaking changes in business logic (calculations, state management, API calls).
- Fix approach: Add Jest/Vitest test configuration, write tests for critical paths: quote calculations, auth flows, form validation, API service layers. Prioritize `quoteForm.utils.ts`, `AuthContext.tsx`, and `quotes.service.ts`.

**Oversized Components:**
- Issue: `QuoteForm.tsx` is 483 lines, exceeding recommended single-component size. Mixing form state management with UI rendering and PDF generation logic.
- Files: `frontend/src/pages/quotes/QuoteForm.tsx`
- Impact: Difficult to test, maintain, and reason about. Changes to one feature may affect unrelated functionality.
- Fix approach: Extract form logic into separate hooks, move PDF generation to dedicated component, split form sections into sub-components (master data, line items, totals).

**Inconsistent Error Handling:**
- Issue: Error handling varies across codebase. Some functions throw errors directly, others catch and log to console, some silently fail. Catch blocks use generic `err: any` patterns without consistent typing.
- Files: `frontend/src/pages/quotes/QuoteForm.tsx` (line 165-167), `frontend/src/services/quotes.service.ts` (line 169-177), `frontend/src/pages/admin/CompanyConfigPage.tsx` (line 90-96)
- Impact: Unpredictable error behavior, incomplete error information displayed to users, debugging difficulty.
- Fix approach: Create unified error handling layer with typed custom errors, standardize on specific error types per context, ensure user-facing errors include actionable messages.

**Hardcoded Configuration Values:**
- Issue: Magic numbers and strings scattered throughout: "S/", "18%", "15" days validity, "9 AM" in n8n, webhook URLs in env vars only.
- Files: `frontend/src/pages/quotes/quoteForm.utils.ts` (line 22, 45), `frontend/src/context/AuthContext.tsx` (line 5000ms timeout), `frontend/src/pages/auth/Login.tsx` (line 36 - 8000ms timeout)
- Impact: Difficult to reconfigure system behavior (tax rate, validity period, timeout values), values scattered across multiple files make updates error-prone.
- Fix approach: Create single config/constants file with all system parameters, export as constants, allow admin panel override for business-critical values (tax rate, email timing).

## Known Bugs

**Auth Safety Timeout Race Condition:**
- Symptoms: Loading state may briefly show loading spinner then switch to unauthenticated, or auth may load successfully after 5-second timeout forces it false.
- Files: `frontend/src/context/AuthContext.tsx` (lines 105-118)
- Trigger: Slow network, Supabase API latency >5 seconds, or auth profile fetch delayed beyond safety timeout.
- Workaround: Page refresh restores correct state. User is not actually logged out, just UI state is wrong.
- Recommendation: Increase timeout to 10-15 seconds or implement exponential backoff instead of hard timeout.

**Missing Webhooks Response Handling:**
- Symptoms: After PDF generation and webhook send, no success confirmation shown to user. Only errors are displayed.
- Files: `frontend/src/pages/quotes/QuoteForm.tsx` (line 148-161), `frontend/src/services/webhook.service.ts` (line 22-34)
- Trigger: Successful webhook execution completes silently. User has no visual confirmation email was sent.
- Workaround: User can check email to confirm delivery.
- Recommendation: Add toast/notification on successful webhook send, track webhook delivery status in DB, display in quote list.

**Quote Validation Missing Seller Assignment:**
- Symptoms: Form requires seller selection (line 59-61 in quoteForm.utils.ts), but API allows null vendedor_id. Potential inconsistency if API constraint is removed.
- Files: `frontend/src/pages/quotes/quoteForm.utils.ts` (line 59-61), `frontend/src/pages/quotes/QuoteForm.tsx` (line 258-261)
- Trigger: Frontend validation prevents save, but schema allows it in database.
- Recommendation: Align validation rules between frontend and backend (RLS policies, DB constraints), document required vs optional fields.

## Security Considerations

**Supabase Publishable Key Exposure:**
- Risk: `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` is embedded in frontend bundle. While intended for client-side use, this key can be used to make unauthenticated requests to Supabase.
- Files: `frontend/src/config/supabaseClient.ts` (line 4)
- Current mitigation: Supabase RLS policies should restrict unauthorized access.
- Recommendations: Verify RLS policies are strict and enforced on all tables; use role-based access; audit Supabase RLS configuration quarterly.

**Missing CORS/CSP Configuration:**
- Risk: No explicit CORS or Content Security Policy headers visible in frontend build. Webhook integration (`frontend/src/services/webhook.service.ts`) sends data to external URL without validation.
- Files: `frontend/src/services/webhook.service.ts` (line 25-34)
- Current mitigation: Webhook URL read from env vars.
- Recommendations: Add CSP headers in deployment, validate webhook URL against whitelist, implement request signing/HMAC validation.

**localStorage Cleanup on Logout:**
- Risk: Manual localStorage cleanup (`frontend/src/context/AuthContext.tsx` lines 133-141) iterates and removes Supabase keys. Pattern `key.startsWith('sb-')` is brittle and may miss keys in future Supabase versions.
- Files: `frontend/src/context/AuthContext.tsx` (line 133-141)
- Current mitigation: Uses whitelist pattern for Supabase keys.
- Recommendations: Use Supabase SDK's built-in logout which handles storage cleanup automatically, avoid direct localStorage manipulation.

**PDF Generation in Browser:**
- Risk: Large PDFs or many line items generated client-side may consume excessive memory or block UI thread.
- Files: `frontend/src/pages/quotes/QuoteForm.tsx` (line 143), `frontend/src/pages/quotes/QuotePDFTemplate.tsx`
- Current mitigation: User feedback via loading state.
- Recommendations: Add worker thread for PDF generation, show progress bar for large documents, implement timeout for generation.

## Performance Bottlenecks

**All Data Loaded in Memory:**
- Problem: Quote list and client list loaded completely into memory with no pagination. With thousands of records, this causes slow initial load and high memory usage.
- Files: `frontend/src/hooks/useQuotes.ts` (line 13-18), `frontend/src/hooks/useClients.ts`
- Cause: React Query default behavior, no limit applied to queries.
- Improvement path: Implement cursor-based or offset pagination, add `limit` and `offset` to service queries, lazy-load additional pages on scroll.

**Dashboard Full Recalculation:**
- Problem: Dashboard stats query rebuilds all KPI calculations every time page loads or data changes. No caching of calculated values.
- Files: `frontend/src/pages/dashboard/DashboardPage.tsx` (line 301), `frontend/src/hooks/useDashboardStats.ts`, `frontend/src/services/dashboard.service.ts`
- Cause: Stats computed client-side from full dataset, no server-side aggregation.
- Improvement path: Move stat calculations to database views/functions, cache results with appropriate TTL, consider separate query endpoint for dashboard.

**Quote Form State Calculations on Every Change:**
- Problem: Totals recalculated on every keystroke in line item fields. No debouncing.
- Files: `frontend/src/pages/quotes/useQuoteFormState.ts` (lines 63-66), `frontend/src/pages/quotes/quoteForm.utils.ts` (line 41-52)
- Cause: `useMemo` deps array includes mutable objects.
- Improvement path: Debounce total calculations, memoize line item objects properly, consider Zustand or Jotai for more efficient state updates.

**Full Quote Refetch on Any Change:**
- Problem: Mutation invalidates entire quote list after any change, forcing full reload even for minor status updates.
- Files: `frontend/src/hooks/useQuotes.ts` (line 34-35, 48)
- Cause: Over-broad cache invalidation strategy.
- Improvement path: Use focused cache updates (`queryClient.setQueryData`) for mutations, invalidate only affected quote, use optimistic updates.

## Fragile Areas

**AuthContext Complex State Logic:**
- Files: `frontend/src/context/AuthContext.tsx`
- Why fragile: Multiple state updates happening asynchronously (onAuthStateChange → setTimeout → fetchUserProfile → setState). Race conditions possible if cleanup/mounting is not correct. Manual ref tracking with `mounted` flag is error-prone.
- Safe modification: Add comprehensive tests for auth state transitions, document exact order of operations, consider using a reducer pattern instead of multiple useState calls.
- Test coverage: No tests exist. Critical path for entire application.

**Quote Service Fallback Logic:**
- Files: `frontend/src/services/quotes.service.ts` (lines 157-181)
- Why fragile: `saveQuote` has RPC fallback to legacy function. Error detection relies on error code matching (`PGRST202`). If Supabase error format changes, fallback silently fails.
- Safe modification: Add error logging/monitoring, test both code paths explicitly, consider deprecating legacy path once RPC is confirmed stable.
- Test coverage: Zero tests for RPC or legacy save paths.

**Webhook Integration Dependencies:**
- Files: `frontend/src/services/webhook.service.ts`, `frontend/src/pages/quotes/QuoteForm.tsx` (lines 148-161)
- Why fragile: Webhook URL must be configured in env vars. If n8n instance is down, quote generation succeeds but email doesn't send silently. User has no feedback loop.
- Safe modification: Add webhook health check on app startup, implement retry logic with exponential backoff, store webhook attempt/failure state in DB.
- Test coverage: No tests. External dependency not mocked.

**PDF Template Hard-coded Styling:**
- Files: `frontend/src/pages/quotes/QuotePDFTemplate.tsx` (lines 8-82)
- Why fragile: 60+ hardcoded style values, colors, fonts. Any layout changes require careful manual updates. No design system or CSS-in-JS for consistency.
- Safe modification: Extract styles to config object, create reusable PDF components (Header, Table, Footer), use CSS variables for colors.
- Test coverage: No snapshot tests. Visual regression undetected.

## Scaling Limits

**Database Query Load:**
- Current capacity: Supabase free tier supports ~50,000 rows comfortably. System assumes <10,000 quotes, <1,000 clients.
- Limit: At ~100,000 quotes, full list queries will timeout. Dashboard aggregations will be slow.
- Scaling path: Implement database pagination, move complex aggregations to PostgreSQL functions, add caching layer (Redis), consider read replicas.

**Browser Memory for Large Quote Lists:**
- Current capacity: UI handles ~1,000 quotes before noticeable lag. PDF generation for large quotes with >500 line items may crash browser tab.
- Limit: At ~5,000 quotes or complex PDFs, browser tab becomes unusable.
- Scaling path: Virtual scrolling for lists, server-side PDF generation, paginated quote loading, worker threads.

**n8n Webhook Queue:**
- Current capacity: n8n can handle ~100 concurrent webhooks. If multiple PDFs generated simultaneously, webhooks may queue.
- Limit: At >500 quotes per day sent simultaneously, n8n may drop webhooks.
- Scaling path: Implement webhook queue with retry logic, move to enterprise n8n with higher throughput, consider async job queue (Bull, RQ).

## Dependencies at Risk

**React Hook Form & Zod Mismatch:**
- Risk: Both used in login (`frontend/src/pages/auth/Login.tsx`) but no integration in quote form. Inconsistent validation approach.
- Impact: Form validation logic duplicated and may diverge.
- Migration plan: Standardize on React Hook Form + Zod across all forms, extract common schemas to shared types file.

**@react-pdf/renderer Limitations:**
- Risk: Library has poor TypeScript support for complex layouts. No support for CSS Grid or Flexbox. PDF generation can fail silently for unsupported styles.
- Impact: PDF layout breaks when styling updated, no clear error messages.
- Migration plan: Evaluate `pdfkit` or `html2pdf` for more control, or move PDF generation to server-side with Puppeteer.

**Tailwind CSS Direct DOM Manipulation:**
- Risk: Quote form UI uses many hardcoded Tailwind classes. No component library consistency.
- Impact: Design changes require updates in many places, inline styles difficult to maintain.
- Migration plan: Extract reusable Tailwind components, consider Shadcn/ui or Headless UI for consistency.

## Missing Critical Features

**No Audit Log:**
- Problem: No tracking of who changed what quote, when, or why. Cannot determine who sent email, who changed status.
- Blocks: Compliance audits, dispute resolution, accountability tracking.
- Recommendation: Add `audit_logs` table with user_id, action, timestamp, before/after state for quotes.

**No Offline Support:**
- Problem: System requires constant internet. If connection drops mid-form, unsaved data is lost.
- Blocks: Mobile usage, field sales scenarios, poor connectivity areas.
- Recommendation: Implement service worker, local IndexedDB storage, sync queue for offline changes.

**No Duplicate Quote Detection:**
- Problem: User can accidentally create multiple identical quotes for same client.
- Blocks: Waste of time, confusion in records.
- Recommendation: Add client-side warning when quote total/client matches recent quote, or add "Duplicate" checkbox.

**No Quote Templates:**
- Problem: Repeated quote creation for common customers requires re-entering same data every time.
- Blocks: Efficiency for high-volume quoting.
- Recommendation: Add "Save as Template" feature, pre-fill form from template, apply default products/prices.

## Test Coverage Gaps

**Critical: Quote Calculation Logic Not Tested:**
- What's not tested: `calculateQuoteTotals()` function with various IGV/discount combinations, edge cases (negative values, large numbers, floating point errors).
- Files: `frontend/src/pages/quotes/quoteForm.utils.ts` (line 41-52)
- Risk: Calculation bug could go unnoticed and cause incorrect financial data. High business impact.
- Priority: **High** - Start here.

**Critical: Authentication State Transitions Not Tested:**
- What's not tested: Auth login/logout flow, role-based access control, token refresh, profile loading race conditions.
- Files: `frontend/src/context/AuthContext.tsx`, `frontend/src/pages/auth/Login.tsx`
- Risk: Auth bugs could lock out users or grant unauthorized access. Security risk.
- Priority: **High** - Start here.

**High: API Service Layer Not Tested:**
- What's not tested: Supabase query responses, error handling, RPC fallback logic, null/empty data handling.
- Files: `frontend/src/services/*.ts`
- Risk: API layer bugs affect all data operations. Cascading failures possible.
- Priority: **High** - Before expanding features.

**Medium: Form Validation Not Tested:**
- What's not tested: Validation rules in `quoteForm.utils.ts`, edge cases for client/seller/product selection, empty field handling.
- Files: `frontend/src/pages/quotes/quoteForm.utils.ts`
- Risk: Invalid data saved to database. Data quality issues.
- Priority: **Medium** - Add before next feature release.

**Medium: PDF Generation Not Tested:**
- What's not tested: PDF template rendering, data injection, image handling, empty/null field fallbacks.
- Files: `frontend/src/pages/quotes/QuotePDFTemplate.tsx`
- Risk: PDF corrupted or incomplete. User experiences broken PDF delivery.
- Priority: **Medium** - Add before scaling to more customers.

**Low: UI Component Snapshot Tests:**
- What's not tested: Component rendering, UI state changes, modal open/close, drawer animations.
- Files: All components in `frontend/src/components/`, `frontend/src/features/`, `frontend/src/pages/`
- Risk: Visual regressions, broken UI layouts.
- Priority: **Low** - Nice to have for polish.

---

*Concerns audit: 2026-03-25*
