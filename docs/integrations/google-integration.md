
# Google Integration Guide

This document outlines the complete setup and integration process for Google OAuth authentication, Google Calendar sync, and Google Workspace email functionality.

## Overview

This integration provides:
- Google OAuth login/authentication
- Google Calendar synchronization
- Transactional emails via Google Workspace
- User profile information from Google

## Required Google Cloud Platform Setup

### 1. Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Google Calendar API
   - Gmail API
   - Google+ API (for profile information)
   - Google Workspace Admin SDK (if needed)

### 2. OAuth 2.0 Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Configure the OAuth consent screen:
   - Application type: Web application
   - Authorized JavaScript origins: 
     - `https://yourdomain.com`
     - `https://your-cloudflare-pages.pages.dev`
   - Authorized redirect URIs:
     - `https://yourdomain.com/auth/google/callback`
     - `https://your-cloudflare-pages.pages.dev/auth/google/callback`

### 3. Service Account (for server-side operations)

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Download the JSON key file
4. Store the service account key securely in Cloudflare Workers secrets

## Required Environment Variables

### Frontend (Cloudflare Pages)
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### Backend (Cloudflare Workers)
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_json_key_here
GOOGLE_WORKSPACE_DOMAIN=yourdomain.com
GOOGLE_WORKSPACE_ADMIN_EMAIL=admin@yourdomain.com
```

## Frontend Implementation

### 1. Google OAuth Button Component

```typescript
// components/auth/GoogleAuthButton.tsx
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

const GoogleAuthButton = () => {
  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const scope = encodeURIComponent([
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send'
    ].join(' '));
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleGoogleAuth}
      className="w-full"
    >
      <Chrome className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>
  );
};

export default GoogleAuthButton;
```

### 2. OAuth Callback Handler

```typescript
// pages/GoogleCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      if (error) {
        toast.error('Google authentication failed');
        navigate('/login');
        return;
      }
      
      if (code) {
        try {
          const response = await fetch('/api/auth/google/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Store tokens and redirect
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('jwtToken', data.jwt);
            toast.success('Successfully logged in with Google');
            navigate('/dashboard');
          } else {
            throw new Error(data.error);
          }
        } catch (error) {
          toast.error('Failed to complete Google authentication');
          navigate('/login');
        }
      }
    };
    
    handleCallback();
  }, [searchParams, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Completing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
```

## Backend API Endpoints

### 1. Google OAuth Callback Handler

```typescript
// POST /api/auth/google/callback
{
  "code": "authorization_code_from_google"
}

// Response:
{
  "success": true,
  "token": "session_token",
  "jwt": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "profile_picture_url",
    "google_id": "google_user_id"
  }
}
```

### 2. Calendar Sync Endpoints

```typescript
// GET /api/calendar/events
// Headers: Authorization: Bearer {token}
// Query params: start_date, end_date, calendar_id

// POST /api/calendar/events
// Body: {
//   "title": "Puppy Appointment",
//   "description": "Meeting with potential adopter",
//   "start_time": "2024-01-15T10:00:00Z",
//   "end_time": "2024-01-15T11:00:00Z",
//   "attendees": ["client@example.com"]
// }

// PUT /api/calendar/events/:eventId
// DELETE /api/calendar/events/:eventId
```

### 3. Email Integration Endpoints

```typescript
// POST /api/email/send
// Body: {
//   "to": ["recipient@example.com"],
//   "subject": "Adoption Confirmation",
//   "template": "adoption_confirmation",
//   "data": {
//     "puppy_name": "Buddy",
//     "adopter_name": "John Doe"
//   }
// }
```

## Required Google API Scopes

```javascript
const REQUIRED_SCOPES = [
  'openid',                                           // Basic OpenID
  'profile',                                          // User profile info
  'email',                                           // User email
  'https://www.googleapis.com/auth/calendar',        // Full calendar access
  'https://www.googleapis.com/auth/gmail.send',      // Send emails
  'https://www.googleapis.com/auth/gmail.compose'    // Compose emails
];
```

## Database Schema Updates

### Users Table
```sql
ALTER TABLE users ADD COLUMN google_id TEXT;
ALTER TABLE users ADD COLUMN google_access_token TEXT;
ALTER TABLE users ADD COLUMN google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN google_token_expires_at INTEGER;
ALTER TABLE users ADD COLUMN profile_picture TEXT;
ALTER TABLE users ADD COLUMN calendar_sync_enabled BOOLEAN DEFAULT FALSE;
```

### Calendar Events Table
```sql
CREATE TABLE calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  google_event_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Email Templates

### Adoption Confirmation Template
```html
<!DOCTYPE html>
<html>
<head>
  <title>Adoption Confirmation</title>
</head>
<body>
  <h1>Congratulations on your new puppy!</h1>
  <p>Dear {{adopter_name}},</p>
  <p>We're excited to confirm that {{puppy_name}} is now officially yours!</p>
  <!-- Template content -->
</body>
</html>
```

## Security Considerations

### Token Storage
- Store Google refresh tokens encrypted in database
- Use short-lived access tokens (1 hour)
- Implement automatic token refresh

### API Security
- Validate all Google OAuth tokens server-side
- Implement rate limiting on email sending
- Use CSRF protection for OAuth flows

### Data Privacy
- Only request necessary scopes
- Allow users to revoke Google integration
- Comply with Google API Terms of Service

## Implementation Steps

### Phase 1: Basic OAuth
1. Set up Google Cloud Console project
2. Implement OAuth login flow
3. Store user profile information
4. Test authentication flow

### Phase 2: Calendar Integration
1. Add calendar API endpoints
2. Implement event CRUD operations
3. Set up webhook for calendar changes
4. Test calendar synchronization

### Phase 3: Email Integration
1. Configure Google Workspace domain
2. Set up email templates
3. Implement transactional email sending
4. Test email delivery

## Testing

### OAuth Flow Testing
- Test with multiple Google accounts
- Verify token refresh mechanism
- Test account linking/unlinking

### Calendar Testing
- Create, read, update, delete events
- Test with different calendar permissions
- Verify webhook notifications

### Email Testing
- Send test emails to various providers
- Check spam folder placement
- Verify delivery rates

## Monitoring and Analytics

### Metrics to Track
- OAuth conversion rates
- Calendar sync success rates
- Email delivery rates
- API error rates

### Logging
- Log all OAuth attempts
- Track calendar API usage
- Monitor email sending volumes

## Troubleshooting

### Common Issues
1. **OAuth consent screen not approved**: Submit for Google verification
2. **Token refresh failures**: Check refresh token storage
3. **Email delivery issues**: Verify SPF/DKIM records
4. **Calendar sync delays**: Check webhook configuration

### Error Codes
- `invalid_grant`: Refresh token expired
- `insufficient_scope`: Missing required permissions
- `rate_limit_exceeded`: API quota exceeded

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Workspace Admin SDK](https://developers.google.com/admin-sdk)
