
# API Documentation

## Endpoints Overview

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login existing user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user data

### Puppies
- `GET /api/puppies` - List all puppies
- `GET /api/puppies/:id` - Get puppy details
- `POST /api/puppies` - Create new puppy (Auth required)
- `PUT /api/puppies/:id` - Update puppy (Auth required)
- `DELETE /api/puppies/:id` - Delete puppy (Auth required)

### Litters
- `GET /api/litters` - List all litters
- `GET /api/litters/:id` - Get litter details
- `POST /api/litters` - Create new litter (Auth required)
- `PUT /api/litters/:id` - Update litter (Auth required)
- `DELETE /api/litters/:id` - Delete litter (Auth required)

### Payments
- `POST /checkout` - Process payment (Coming soon)
- `POST /square/callback` - Square payment callback (Coming soon)
- `POST /admin/tap-to-pay` - Initiate tap-to-pay flow (Coming soon)
- `GET /admin/payment/success` - Payment success callback (Coming soon)

## Response Format

All API responses follow a consistent JSON format:

```json
{
  "data": { ... },  // The response data (when successful)
  "error": "...",   // Error message (when applicable)
  "success": true   // Boolean indicating request success
}
```

## Authentication

Most endpoints require a valid JWT token sent in the Authorization header:

```
Authorization: Bearer <token>
```

See the [Auth Documentation](../auth/README.md) for more details.
