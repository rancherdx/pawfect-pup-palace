# GDS Puppies Documentation

## Overview

GDS Puppies is a modern puppy breeder management system built with Supabase as the backend infrastructure.

## Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** for UI components
- **React Router** for client-side routing
- **TanStack Query** for data fetching and caching

### Backend (Supabase)
- **PostgreSQL Database** with Row Level Security
- **Supabase Auth** for user authentication
- **Supabase Storage** for file uploads
- **Edge Functions** for custom server-side logic

## Key Features

### Authentication & Authorization
- Email/password authentication via Supabase Auth
- Role-based access control (user, admin, super-admin)
- Row Level Security policies for data protection

### Data Management
- **Puppies**: Complete puppy information, photos, and availability status
- **Litters**: Litter tracking with dam/sire information
- **Users**: Profile management and role assignment
- **Testimonials**: Customer reviews and feedback

### File Management
- Image uploads to Supabase Storage
- Automatic image optimization and resizing
- Public and private storage buckets

### Security & Privacy
- GDPR-compliant data deletion requests
- Audit logging for administrative actions
- Encrypted sensitive data storage

## API Structure

All API calls use the Supabase JavaScript client directly:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Example: Fetching puppies
const { data, error } = await supabase
  .from('puppies')
  .select('*')
  .eq('status', 'Available');
```

## Database Schema

### Core Tables
- `profiles` - User profile information
- `user_roles` - Role assignments
- `puppies` - Puppy listings and information
- `litters` - Litter management
- `testimonials` - Customer reviews
- `data_deletion_requests` - Privacy compliance

### Storage Buckets
- `puppy-images` - Public puppy photos
- `litter-images` - Public litter photos  
- `brand-assets` - Website branding materials
- `videos` - Video content

## Development Guide

### Getting Started
1. Set up Supabase project
2. Configure environment variables  
3. Run database migrations
4. Start development server

### Code Organization
- `src/api/` - Supabase client wrappers
- `src/components/` - React components
- `src/pages/` - Route components
- `src/types/` - TypeScript type definitions
- `supabase/` - Database migrations and edge functions

### Adding New Features
1. Define database schema changes in migrations
2. Update TypeScript types
3. Create API wrapper functions
4. Build UI components
5. Add proper RLS policies

## Deployment

The application is designed to be deployed as a static site with Supabase handling all backend functionality:

1. Build the React application
2. Deploy static files to hosting service
3. Supabase handles database, auth, and storage automatically

No server infrastructure required - fully serverless architecture.