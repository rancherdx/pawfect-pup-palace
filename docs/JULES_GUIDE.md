# GDS Puppies – Back-end Collaboration Guide for Google JULES

This document aligns our Supabase-first architecture with JULES (async back-end automation).

## Overview
- Purpose: E-commerce + adoption workflow for GDS Puppies (staging: new.gdspuppies.com, prod: gdspuppies.com)
- Frontend: React + Vite + Tailwind + shadcn/ui (TypeScript)
- Backend: Supabase (Postgres, Auth, Storage, Edge Functions). No Cloudflare Workers going forward.
- Payments: Square (sandbox + production), Apple Pay domain verification via /.well-known
- Chat: Tawk.to (kept as-is for now)

## Core Repos/Paths
- Frontend app: /src
- Supabase Edge Functions: /supabase/functions/*
- Public assets (served at site root): /public
- Docs: /docs
- Implementation tracking: /docs/IMPLEMENTATION_STATUS.md

## Recent Critical Fixes (2025-10-02)

### Database Schema
- **FIXED:** `third_party_integrations` table no longer uses `id` column
- Use composite key: `${service_name}-${environment}` for identification
- All API calls updated to use service + environment instead of id

### Auth System
- **FIXED:** AuthContext infinite loop resolved
- Removed setTimeout wrapper, proper async/await pattern
- Added mount tracking to prevent stale state updates

### Security
- **FIXED:** Privilege escalation vulnerability in AdminUserManager
- All sensitive console.log wrapped in development checks
- Error boundaries added to admin and checkout flows

### Error Boundaries
- AdminErrorBoundary: Protects admin dashboard
- CheckoutErrorBoundary: Protects payment flow
- Both show user-friendly errors in production, detailed in development

## Do/Don't for JULES
- DO: Use Supabase Edge Functions for any server logic, call them from frontend via supabase.functions.invoke.
- DO: Use database migrations for schema/policies (never direct manual schema edits).
- DO: Respect RLS; when bypassing, use service role in functions, not in frontend.
- DO: Log notable changes into public.change_logs.
- DO: Check /docs/IMPLEMENTATION_STATUS.md before starting new work
- DON'T: Add/modify Cloudflare Worker code; it's being retired.
- DON'T: Store secrets in code or in public tables; use encrypted storage or Supabase Function secrets.
- DON'T: Use `id` field for third_party_integrations table

## Supabase Schema (key tables)
- public.user_roles (id, user_id, role app_role)
- public.third_party_integrations (service, environment ['sandbox'|'production'], data_ciphertext text, created_at/updated_at)
  - **NOTE:** No `id` column! Use composite key (service + environment)
- public.change_logs (action, context, details jsonb, created_at)
- storage bucket: apple-pay (non-public) for reference copy of the domain verification file

## RLS & Security
- RLS enabled; admin-only policies on user_roles, third_party_integrations, change_logs.
- Helper: public.has_role(user_id, role) SECURITY DEFINER.
- Functions set search_path = public to avoid search path issues.
- OTP expiry warning remains a platform setting (handled in Supabase dashboard).

## Edge Functions (current)
- integrations-list: Returns sanitized integration list (no id field, uses service+environment)
- integrations-upsert: Encrypts JSON payload (AES-256-GCM via ENCRYPTION_KEY) and upserts into third_party_integrations.
- applepay-upload: Stores domain verification file content into storage bucket apple-pay for reference.

## Secrets Required (configure in Supabase > Edge Functions > Secrets)
- ENCRYPTION_KEY: base64-encoded 32 bytes (256-bit) symmetric key.
- SUPABASE_SERVICE_ROLE_KEY: service role key for privileged operations inside functions.
- SUPABASE_URL: https://dpmyursjpbscrfbljtha.supabase.co

## Conventions
- All new API endpoints should be Edge Functions under /supabase/functions.
- Frontend calls: import { supabase } from "@/integrations/supabase/client".
- Use JSON schemas/types in /src/types when adding new messages or records.
- Always add/update docs and an entry in /docs/IMPLEMENTATION_STATUS.md for any change.
- Development logging: Use `if (process.env.NODE_ENV === 'development')` wrapper with `[DEV]` prefix

## Files NOT to touch
- /src/integrations/supabase/client.ts (generated)
- package.json, tsconfig.*, postcss.config.js (modify via approved processes only)
- Anything under /public/.well-known except for the Apple Pay verification file

## Change Logging Protocol
- Every change (by Lovable or JULES) must:
  1) Update /docs/IMPLEMENTATION_STATUS.md with status and details
  2) Optionally insert a record into public.change_logs via Edge Function when applicable

## Error Handling
- Error boundaries in place for:
  - Admin dashboard (AdminErrorBoundary)
  - Checkout flow (CheckoutErrorBoundary)
- Always wrap sensitive console.log with development checks
- Never log payment details, credentials, or PII in production

## Prompt Engineering Hints for JULES
- Before editing, search the codebase to understand related modules and types.
- Check /docs/IMPLEMENTATION_STATUS.md for current implementation state
- Prefer small, focused components/hooks; avoid monoliths.
- Keep secrets out of code. For sensitive actions, implement a function (server-side) and call it from UI.
- When dealing with payments, do not mock—use sandbox keys and staged URLs.
- When adding tables, ensure RLS and admin policies are correct and test with maybeSingle() when data may be missing.
- For third_party_integrations: Use service + environment, NOT id

## Known Issues & TODOs
See /docs/IMPLEMENTATION_STATUS.md for complete list.

**High Priority:**
- Type safety: 244 `any` types need proper interfaces
- Input validation: Forms need Zod validation
- useEffect dependencies: 65+ instances need fixing

**Medium Priority:**
- Image optimization needed
- Mobile touch targets too small
- ARIA labels missing

## Appendix – Important URLs
- Staging: https://new.gdspuppies.com
- Production: https://gdspuppies.com
- Square Webhook (Edge Function placeholder): https://dpmyursjpbscrfbljtha.functions.supabase.co/square-webhook
- Apple Pay file path (must be present in the repo): /.well-known/apple-developer-merchantid-domain-association
- Implementation Status: /docs/IMPLEMENTATION_STATUS.md
