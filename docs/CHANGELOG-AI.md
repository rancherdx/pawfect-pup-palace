# AI Change Log (Lovable + JULES)

This document records notable project changes for coordination and auditing.

2025-08-11
- Added Supabase tables: user_roles, third_party_integrations, change_logs with RLS and admin-only policies.
- Added storage bucket apple-pay (private) for reference copies of Apple Pay verification file.
- Created Edge Functions: integrations-upsert (secure credentials storage), applepay-upload (store reference file).
- Added Admin Dashboard tab: Secure Integrations (Square creds + URLs + Apple Pay guidance).
- Added docs: JULES_GUIDE.md, SQUARE_ENDPOINTS.md, and /.well-known guidance.
- Kept Tawk.to integration untouched as requested.
