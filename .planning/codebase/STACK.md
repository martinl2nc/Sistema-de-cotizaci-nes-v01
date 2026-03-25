# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript 5.9.3 - Type-safe frontend application development
- JavaScript (ES2020+) - Runtime JavaScript for React/Vite build

**Secondary:**
- SQL - PostgreSQL queries via Supabase client
- JSON - Configuration and API payloads

## Runtime

**Environment:**
- Node.js (inferred from package.json type: "module" and vite usage)

**Package Manager:**
- npm 10.x (inferred) / pnpm (Optional via skills-lock.json)
- Lockfile: `package-lock.json` present in `frontend/` directory

## Frameworks

**Core:**
- React 19.2.4 - UI component framework
- Vite 8.0.0 - Frontend build tool and dev server
- React Router DOM 7.13.1 - Client-side routing

**State Management & Data Fetching:**
- TanStack React Query 5.91.2 - Server state management, caching, synchronization
- React Hook Form 7.71.2 - Form state and validation

**Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- @tailwindcss/vite 4.2.1 - Vite plugin for Tailwind integration

**UI Components:**
- Lucide React 0.577.0 - Icon library
- Recharts 3.8.0 - Data visualization and charts for dashboard

**Data Validation:**
- Zod 4.3.6 - TypeScript-first schema validation for form inputs and API responses

**PDF Generation:**
- @react-pdf/renderer 4.3.2 - Client-side PDF generation (renders React components to PDF)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.99.1 - Supabase JavaScript client library for database, auth, and storage access
- @hookform/resolvers 5.2.2 - Integration between React Hook Form and Zod validation schema

**Infrastructure:**
- pg 8.20.0 - PostgreSQL client (included, potentially unused as Supabase client abstracts DB connection)
- @types/pg 8.20.0 - TypeScript type definitions for pg

## Configuration

**Environment:**
- Environment variables configured via `.env` file in `frontend/` directory
- Required variables:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Supabase public (anon) API key
  - `VITE_N8N_WEBHOOK_URL` - n8n webhook endpoint for PDF generation and email delivery

**Build:**
- `vite.config.ts` - Vite configuration with React and Tailwind plugins
- `tsconfig.json` - TypeScript configuration with references to app and node TSConfig files
- `tailwind.config.js` - Tailwind CSS configuration (empty, using defaults)

**Linting & Code Quality:**
- ESLint 9.39.4 - JavaScript/TypeScript linting
- `eslint.config.js` - Flat config format with React hooks and refresh rules
- TypeScript ESLint 8.56.1 - TypeScript-aware ESLint rules
- eslint-plugin-react-hooks 7.0.1 - Enforces rules of Hooks
- eslint-plugin-react-refresh 0.5.2 - React Fast Refresh plugin for Vite

**Code Formatting:**
- Terser 5.46.1 - Minifier used during build process

## Platform Requirements

**Development:**
- Node.js runtime
- Package manager (npm/pnpm)
- `frontend/` directory structure with `src/`, `public/`, `node_modules/`
- `.env` file with Supabase and n8n credentials

**Production:**
- Static file hosting (SiteGround mentioned in README)
- Built output: `frontend/dist/` directory
- Browser with modern JavaScript support (ES2020+)
- Network access to Supabase API and n8n webhook endpoints
- CORS configured on both Supabase and n8n for browser requests

## Build Process

**Development:**
```bash
npm run dev      # Starts Vite dev server on port 3000
```

**Production:**
```bash
npm run build    # Runs: tsc -b && vite build
                 # TypeScript compilation check + Vite production build
npm run preview  # Preview production build locally
```

**Linting:**
```bash
npm run lint     # ESLint check
```

## Browser Compatibility

- Target: ESNext (modern browsers)
- Minified: Yes (terser)
- Source maps: Disabled in production (`sourcemap: false`)
- Module format: ES modules (`type: "module"`)

---

*Stack analysis: 2026-03-25*
