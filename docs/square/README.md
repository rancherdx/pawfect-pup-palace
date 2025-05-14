
# Square Integration

This document describes the Square payment integration for the Puppy Breeder App.

## Overview

The app integrates with Square for:
- Online payments
- In-person payments using Tap to Pay
- Digital receipts
- Payment tracking

## Setup Requirements

1. Square developer account
2. Square application with OAuth credentials
3. Square payment processing enabled

## Configuration

Set the following secrets in your Cloudflare environment:

```bash
wrangler secret put SQUARE_ACCESS_TOKEN
```

## Tap-to-Pay Flow

1. Customer initiates checkout
2. App generates payment link
3. Breeder uses Square app to process payment
4. Square sends callback to `/square/callback` endpoint
5. Customer sees success page

### Sequence Diagram

```
Customer -> App: Select puppy to purchase
App -> Square API: Create payment link
Square API -> App: Return payment link/QR
App -> Customer: Display QR code
Customer -> Breeder: Shows QR code
Breeder -> Square App: Scans QR with Square app
Square App -> Square API: Process payment
Square API -> App: Send webhook to /square/callback
App -> Customer: Show success page
```

## API Endpoints

### Initiate Payment
```
POST /checkout
```

Request:
```json
{
  "puppyId": 123,
  "customerId": 456,
  "amount": 1500.00,
  "currency": "USD"
}
```

Response:
```json
{
  "paymentLink": "https://square.link/u/payment123",
  "qrCodeUrl": "https://...",
  "expiresAt": "2023-01-01T00:00:00Z"
}
```

### Square Callback
```
POST /square/callback
```

This endpoint handles webhook notifications from Square after a payment is processed.

### Tap to Pay Initiation
```
POST /admin/tap-to-pay
```

This endpoint initiates the Tap to Pay flow for in-person payments.

## Testing

Test your Square integration using:

1. Square Sandbox environment
2. Test credit cards provided by Square
3. Webhook testing via tunneling tools like ngrok
