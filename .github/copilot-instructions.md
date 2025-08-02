# Copilot Instructions for AI Agents: Pawfect Pup Palace

## Project Overview
- **Architecture:** Unified full-stack app: both frontend (React + TypeScript) and backend (API, auth, DB, storage, payments) are served from a single custom Cloudflare Worker. No separate deployment for frontend/backend.
- **Custom Logic:** All authentication, authorization, and session management are implemented in-house (see `/docs/auth/README.md`).
- **Docs:** All critical docs are in `/docs/` (see especially `README.md`, `api/`, `auth/`, `database/`, `secrets/`, `square/`, `integrations/`, and `project-separation/`).

## Key Patterns & Conventions
- **API:** All endpoints are under `/api/`. Public, user, and admin endpoints use JWT or session tokens (see `docs/api/README.md`).
- **Auth:** Fully custom authentication and authorization logic (not using third-party auth providers), with JWTs and session tokens managed in Cloudflare KV. Role-based access enforced in code (see `docs/auth/README.md`).
- **Database:** Cloudflare D1 (schema in `docs/database/README.md` and `master_schema.sql`).
- **Secrets:** Managed via Wrangler and Cloudflare Workers (see `docs/secrets/README.md`).
- **Payments:** Square integration (see `docs/square/README.md`).
- **Integrations:** Google OAuth, Calendar, Workspace, and other third-party APIs (see `docs/integrations/`).
- **Frontend:** React 18, Vite, Tailwind, shadcn/ui, Tanstack Query, React Hook Form, Zod, Lucide, Recharts (see `docs/project-separation/frontend-prompt.md`).
- **Backend:** Cloudflare Workers, itty-router, D1, KV, R2, JWT, bcrypt (see `docs/project-separation/backend-prompt.md`).

## Developer Workflows
- **Build:** Use Bun or npm. For frontend: `bun install && bun run dev` or `npm install && npm run dev`.
- **Deploy:** See `docs/DEPLOYMENT.md` and `docs/DEPLOYMENT_GUIDE.md` for Cloudflare setup, DB/KV/R2 provisioning, and secrets.
- **Secrets:** Set with `wrangler secret put <NAME>`.
- **Testing:** See `docs/testing/customer_dashboard_test_plan.md` for UI/feature test plans. No automated test runner is documented; manual test flows are described.
- **Environment:** All config/secrets via Wrangler and `.env`/Cloudflare bindings.

## Project-Specific Guidance
- **Unified Service:** Frontend and backend are tightly integrated and served from the same Cloudflare Worker. There is no separate API server or static frontend host.
- **Data Flow:** Frontend interacts with backend via `/api/` endpoints, backend uses D1, KV, R2, and external APIs.
- **Custom Auth:** All authentication and authorization logic is custom and lives in the codebase (see `docs/auth/README.md`).
- **Error Handling:** Follow API error response conventions (see `docs/api/README.md`).
- **Component Structure:** See `src/components/` and `src/pages/` for React patterns. Use shadcn/ui for UI consistency.
- **Admin/User Roles:** Enforce via JWT claims and middleware (see `docs/auth/README.md`).
- **Integrations:** Configure via Admin Dashboard or environment as described in `docs/integrations/`.

## Examples
- **API Auth:**
  ```js
  fetch('/api/puppies', { headers: { Authorization: 'Bearer <token>' } })
  ```
- **Secrets in Worker:**
  ```js
  export default { async fetch(req, env) { const jwt = env.JWT_SECRET; } }
  ```
- **Frontend API Base URL:**
  ```ts
  export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://...';
  ```

## References
- `/docs/README.md` — high-level overview
- `/docs/project-separation/` — frontend/backend boundaries
- `/docs/api/README.md` — API conventions
- `/docs/auth/README.md` — authentication
- `/docs/database/README.md` — DB schema
- `/docs/secrets/README.md` — secrets
- `/docs/square/README.md` — payments
- `/docs/integrations/` — third-party APIs
- `/docs/testing/` — test plans

---
If any section is unclear or missing, please provide feedback for further refinement.
