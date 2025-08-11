# GDS Puppies – Back-end Collaboration Guide for Google JULES

This document aligns our Supabase-first architecture with JULES (async back-end automation).

Overview
- Purpose: E-commerce + adoption workflow for GDS Puppies (staging: new.gdspuppies.com, prod: gdspuppies.com)
- Frontend: React + Vite + Tailwind + shadcn/ui (TypeScript)
- Backend: Supabase (Postgres, Auth, Storage, Edge Functions). No Cloudflare Workers going forward.
- Payments: Square (sandbox + production), Apple Pay domain verification via /.well-known
- Chat: Tawk.to (kept as-is for now)

Core Repos/Paths
- Frontend app: /src
- Supabase Edge Functions: /supabase/functions/*
- Public assets (served at site root): /public
- Docs: /docs

Do/Don’t for JULES
- DO: Use Supabase Edge Functions for any server logic, call them from frontend via supabase.functions.invoke.
- DO: Use database migrations for schema/policies (never direct manual schema edits).
- DO: Respect RLS; when bypassing, use service role in functions, not in frontend.
- DO: Log notable changes into public.change_logs.
- DON’T: Add/modify Cloudflare Worker code; it’s being retired.
- DON’T: Store secrets in code or in public tables; use encrypted storage or Supabase Function secrets.

Supabase Schema (key tables)
- public.user_roles (id, user_id, role app_role)
- public.third_party_integrations (service, environment ['sandbox'|'production'], data_ciphertext text, created_at/updated_at)
- public.change_logs (action, context, details jsonb, created_at)
- storage bucket: apple-pay (non-public) for reference copy of the domain verification file

RLS & Security
- RLS enabled; admin-only policies on user_roles, third_party_integrations, change_logs.
- Helper: public.has_role(user_id, role) SECURITY DEFINER.
- Functions set search_path = public to avoid search path issues.
- OTP expiry warning remains a platform setting (handled in Supabase dashboard).

Edge Functions (current)
- integrations-upsert: Encrypts JSON payload (AES-256-GCM via ENCRYPTION_KEY) and upserts into third_party_integrations.
- applepay-upload: Stores domain verification file content into storage bucket apple-pay for reference. Final hosting path must be /public/.well-known/apple-developer-merchantid-domain-association in the repo for Apple Pay verification.

Secrets Required (configure in Supabase > Edge Functions > Secrets)
- ENCRYPTION_KEY: base64-encoded 32 bytes (256-bit) symmetric key.
- SUPABASE_SERVICE_ROLE_KEY: service role key for privileged operations inside functions.
- SUPABASE_URL: https://dpmyursjpbscrfbljtha.supabase.co

Conventions
- All new API endpoints should be Edge Functions under /supabase/functions.
- Frontend calls: import { supabase } from "@/integrations/supabase/client".
- Use JSON schemas/types in /src/types when adding new messages or records.
- Always add/update docs and an entry in /docs/CHANGELOG-AI.md for any change.

Files NOT to touch
- /src/integrations/supabase/client.ts (generated)
- package.json, tsconfig.*, postcss.config.js (modify via approved processes only)
- Anything under /public/.well-known except for the Apple Pay verification file

Change Logging Protocol
- Every change (by Lovable or JULES) must:
  1) Update /docs/CHANGELOG-AI.md
  2) Optionally insert a record into public.change_logs via Edge Function when applicable

Prompt Engineering Hints for JULES
- Before editing, search the codebase to understand related modules and types.
- Prefer small, focused components/hooks; avoid monoliths.
- Keep secrets out of code. For sensitive actions, implement a function (server-side) and call it from UI.
- When dealing with payments, do not mock—use sandbox keys and staged URLs.
- When adding tables, ensure RLS and admin policies are correct and test with maybeSingle() when data may be missing.

Appendix – Important URLs
- Staging: https://new.gdspuppies.com
- Production: https://gdspuppies.com
- Square Webhook (Edge Function placeholder): https://dpmyursjpbscrfbljtha.functions.supabase.co/square-webhook
- Apple Pay file path (must be present in the repo): /.well-known/apple-developer-merchantid-domain-association
