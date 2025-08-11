# Square Integration – URLs and Setup (GDS Puppies)

Domains
- Staging: https://new.gdspuppies.com
- Production: https://gdspuppies.com

Checkout Redirects (configure in Square)
- Success (staging): https://new.gdspuppies.com/checkout/success
- Cancel  (staging): https://new.gdspuppies.com/checkout/cancel
- Success (production): https://gdspuppies.com/checkout/success
- Cancel  (production): https://gdspuppies.com/checkout/cancel

Apple Pay – Domain Verification
- Required file URL on each domain: /.well-known/apple-developer-merchantid-domain-association
- In this repo, place the file at public/.well-known/apple-developer-merchantid-domain-association
- Admin UI also allows storing a reference copy via Edge Function (not used by Apple for verification).

Webhooks
- Primary Webhook Endpoint (both envs): https://dpmyursjpbscrfbljtha.functions.supabase.co/square-webhook
- Add events: payment.created, payment.updated, order.created, order.updated (per Square needs)

Credentials to Store (by environment)
- Application ID
- Access Token
- Location ID
- Webhook Signature Key

Notes
- Do not paste credentials into the codebase. Use the Admin > Secure Integrations form to store them (AES-256-GCM encrypted at rest).
- Ensure ENCRYPTION_KEY and SUPABASE_SERVICE_ROLE_KEY are set as Edge Function secrets.
