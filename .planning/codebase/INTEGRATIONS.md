# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Database & Backend:**
- Supabase (PostgreSQL) - Primary database for all application data
  - SDK/Client: `@supabase/supabase-js` 2.99.1
  - Auth: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` environment variables
  - Location: `frontend/src/config/supabaseClient.ts` - Singleton Supabase client initialization

**Automation & Workflows:**
- n8n (Self-hosted) - Webhook-based automation and email delivery orchestration
  - Webhook URL: `VITE_N8N_WEBHOOK_URL` environment variable
  - Communication: `frontend/src/services/webhook.service.ts` sends PDF + metadata via HTTP POST
  - Payload format: JSON with base64-encoded PDF, quote metadata, client email, seller name

**Email Delivery:**
- Gmail API (via n8n) - Email delivery for quote PDFs and follow-up reminders
  - Accessed through n8n workflows, not directly from frontend
  - n8n credential: `Gmail Magenta account` configured for OAuth2 authentication
  - Use case: Sends quotes to clients and automated follow-up notifications

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: Via `@supabase/supabase-js` client
  - Client: Supabase JavaScript SDK (`@supabase/supabase-js`)
  - Connection managed in: `frontend/src/config/supabaseClient.ts`

**File Storage:**
- Supabase Storage (Cloud storage)
  - Bucket: `company-assets`
  - Usage: Stores company logo uploads
  - Access: Public read, authenticated write

**Caching:**
- TanStack React Query - In-memory client-side caching
  - Location: Query hooks in `frontend/src/hooks/` directory
  - Caches database query results and invalidates on mutations

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (JWT-based)
  - Implementation: Email/password authentication
  - Location: `frontend/src/context/AuthContext.tsx` - AuthContext provider
  - User profile table: `perfiles_usuario` - Stores extended profile data (name, role, active status)
  - Roles: `admin` and `vendedor` (vendor/salesperson)

**Row Level Security (RLS):**
- PostgreSQL RLS policies enforced on all tables
- Implemented in Supabase database
- Policies include:
  - `cotizaciones` - Vendors see only their own quotes (`vendedor_id = auth.uid()`)
  - `clientes` - Vendors have read + create access
  - `productos` - Vendors have read-only access
  - `perfiles_usuario` - Vendors see only their own profile
  - `empresa_configuracion` - Admins read/write, vendors read-only

## Monitoring & Observability

**Error Tracking:**
- Not explicitly configured in codebase
- Service errors propagated to frontend and handled in hook/component error states

**Logs:**
- Browser console logging (console.* statements)
- No centralized logging service configured

**Query Monitoring:**
- React Query DevTools (for development debugging)

## CI/CD & Deployment

**Hosting:**
- SiteGround (static hosting) - Frontend deployed as SPA
- n8n self-hosted instance (separate from main application)

**CI Pipeline:**
- Not detected - No GitHub Actions or CI configuration files found

**Build Artifacts:**
- Output: `frontend/dist/` directory
- Static files for SPA deployment

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Supabase public API key
- `VITE_N8N_WEBHOOK_URL` - n8n webhook endpoint for quote delivery

**Secrets location:**
- `.env` file in `frontend/` directory (git-ignored)
- Not configured: GitHub Secrets, vault services, or external secret management

## Webhooks & Callbacks

**Incoming:**
- Not implemented in frontend (Supabase handles incoming auth)

**Outgoing:**
- n8n webhook: Triggered when quote PDF is generated
  - Endpoint: `VITE_N8N_WEBHOOK_URL`
  - Trigger points: `frontend/src/pages/quotes/QuoteForm.tsx` - "Generate and Send PDF" button
  - Service function: `frontend/src/services/webhook.service.ts` - `sendQuoteToWebhook()`
  - Payload structure:
    ```json
    {
      "pdfBase64": "base64-encoded PDF content",
      "pdfFilename": "COT-XXXXX.pdf",
      "correoCliente": "client@email.com",
      "nombreCliente": "Client Company Name",
      "numeroCorrelativo": "COT-XXXXX",
      "vendedorNombre": "Seller Name",
      "totalFinal": 177.00,
      "fechaEmision": "2026-03-25"
    }
    ```

**n8n Workflows:**
1. **PDF Delivery Workflow** (Webhook trigger)
   - Receives quote PDF from frontend
   - Sends email via Gmail with PDF attachment
   - Updates quote status in database
   - Credentials: Supabase account 2, Gmail Magenta account

2. **Automatic Follow-up Workflow** (Daily scheduled)
   - Trigger: Cron `0 9 * * *` (9 AM daily)
   - Finds quotes expiring in 2 days with `seguimiento_automatico = true`
   - Sends reminder email via Gmail
   - Credentials: Supabase account 2, Gmail Magenta account

## Related Services (Not Direct Integration)

**WordPress / WooCommerce:**
- Not directly integrated in frontend
- Mentioned in README as source of quote requests via NP Quote Request plugin
- Integration handled by n8n (separate workflow, not in frontend scope)
- Quote origin field: `origen` in cotizaciones table (`'Manual'` or `'woocommerce'`)

**WooCommerce Product Sync:**
- Optional field: `woo_product_id` in productos table
- Optional field: `woo_order_id` in cotizaciones table
- Not actively used in current frontend code

---

*Integration audit: 2026-03-25*
