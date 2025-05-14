
# Secrets Management

This document outlines how secrets are managed in the Puppy Breeder App.

## Environment Secrets

The following secrets are stored securely using Cloudflare Workers' Secret management:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `JWT_SECRET` | Secret key used for signing JWTs | Yes |
| `SQUARE_ACCESS_TOKEN` | Square API access token | Yes (for payments) |
| `SENDGRID_API_KEY` | SendGrid API key for emails | No |
| `INTERNAL_WEBHOOK_SECRET` | Secret for webhook validation | No |
| `STRIPE_SECRET_KEY` | Stripe API key (alternative to Square) | No |

## Setting Up Secrets

To set up secrets for your deployment:

```bash
wrangler secret put JWT_SECRET
# Enter your secret when prompted
```

Repeat for each secret listed above.

## Accessing Secrets in Code

Secrets are accessed through the `env` object passed to your Worker:

```javascript
export default {
  async fetch(request, env) {
    const jwtSecret = env.JWT_SECRET;
    // Use the secret...
  }
};
```

## Secret Rotation

Best practices for secret rotation:

1. Generate new secret
2. Update the secret in Cloudflare
3. Deploy updated code that can work with both old and new secrets
4. After transition period, remove old secret support

## Security Considerations

- Never commit secrets to the codebase
- Use separate secrets for development and production
- Rotate secrets regularly
- Limit secret access to authorized team members only
