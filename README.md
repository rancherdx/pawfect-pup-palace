
# Puppy Breeder App

A full-stack application for puppy breeders built with Cloudflare Workers, D1 Database, KV Store, and R2 Storage.

## Documentation

All documentation has been moved to the `/docs` directory:

- [Main Documentation](./docs/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [API Documentation](./docs/api/README.md)
- [Auth System](./docs/auth/README.md)
- [Database Schema](./docs/database/README.md)
- [Secrets Management](./docs/secrets/README.md)
- [Square Integration](./docs/square/README.md)

## Getting Started

To get started with development:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
wrangler deploy
```

## Deployment

This project uses a Workers-only deployment strategy (no Pages needed).
The single Worker handles:

1. API requests
2. Static asset serving
3. Authentication
4. Database operations

For complete deployment instructions, see [Deployment Guide](./docs/DEPLOYMENT.md).
