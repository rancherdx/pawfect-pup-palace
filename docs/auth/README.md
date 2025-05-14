
# Authentication System

The Puppy Breeder App uses JWT (JSON Web Token) for authentication, with tokens stored in Cloudflare KV.

## Authentication Flow

1. **Registration**: User registers with email/password
2. **Login**: User provides credentials, receives JWT token
3. **Authorization**: JWT token is included in subsequent API requests
4. **Logout**: Token is invalidated in KV store

## API Endpoints

### Register User
```
POST /api/register
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "User Name"
}
```
**Response:**
```json
{
  "token": "auth_token",
  "jwt": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "customer"
  }
}
```

### Login
```
POST /api/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```
**Response:** Same as register endpoint

### Get Current User
```
GET /api/user
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": "customer"
}
```

### Logout
```
POST /api/logout
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true
}
```

## User Roles

- `customer`: Regular user with limited permissions
- `admin`: Admin with full permissions

## Implementation Details

- Passwords are hashed with SHA-256 (should be upgraded to bcrypt)
- JWT tokens expire after 7 days
- Session data is stored in KV for quick validation and revocation
