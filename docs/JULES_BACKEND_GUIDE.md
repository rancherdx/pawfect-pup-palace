# GDS Puppies - JULES Backend Development Guide

## Project Overview
**Purpose**: E-commerce + adoption workflow for GDS Puppies (staging: new.gdspuppies.com, prod: gdspuppies.com)  
**Frontend**: React + Vite + Tailwind + shadcn/ui (TypeScript)  
**Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)  
**Payments**: Square (sandbox + production), Apple Pay domain verification  

## Database Schema Reference

### Core Puppy Management Tables

#### `puppies` Table
```sql
CREATE TABLE public.puppies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE, -- NEW: Auto-generated from name, used for URLs
  breed text NOT NULL,
  breed_template_id uuid REFERENCES breed_templates(id),
  litter_id uuid REFERENCES litters(id),
  owner_user_id uuid,
  birth_date date,
  price numeric,
  weight numeric,
  color text,
  gender text,
  description text,
  status puppy_status NOT NULL DEFAULT 'Available',
  temperament text[],
  image_urls text[] DEFAULT '{}',
  video_urls text[] DEFAULT '{}',
  photo_url text, -- Legacy field
  is_featured boolean DEFAULT false,
  banner_text text,
  banner_color text DEFAULT '#ef4444',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Parent Information (stored as text for flexibility)
-- dam_name and sire_name can reference stud_dogs table or be free text
```

#### `litters` Table  
```sql
CREATE TABLE public.litters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE, -- NEW: Custom slug for SEO-friendly URLs
  dam_name text, -- Mother's name
  sire_name text, -- Father's name  
  breed text NOT NULL,
  breed_template_id uuid REFERENCES breed_templates(id),
  date_of_birth date,
  expected_date date,
  puppy_count integer,
  status litter_status NOT NULL DEFAULT 'Active',
  description text,
  cover_image_url text, -- Legacy field
  image_urls text[] DEFAULT '{}',
  video_urls text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### `breed_templates` Table
```sql
CREATE TABLE public.breed_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_name text NOT NULL,
  description text,
  size text,
  temperament text[],
  care_instructions text,
  common_traits text[],
  exercise_needs text,
  grooming_needs text,
  average_weight_min numeric,
  average_weight_max numeric,
  life_expectancy_min integer,
  life_expectancy_max integer,
  akc_group text,
  origin_country text,
  health_considerations text[],
  good_with_kids boolean DEFAULT true,
  good_with_pets boolean DEFAULT true,
  hypoallergenic boolean DEFAULT false,
  photo_url text,
  gallery_urls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `stud_dogs` Table (Parents Management)
```sql
CREATE TABLE public.stud_dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  breed_id text NOT NULL, -- References breed name
  age integer,
  description text,
  temperament text,
  certifications text[],
  image_urls text[],
  stud_fee numeric NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  owner_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### SEO & Content Management Tables

#### `seo_meta` Table
```sql
CREATE TABLE public.seo_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL, -- 'puppy', 'litter', 'home', 'about', etc.
  page_id text, -- puppy.id, litter.id, etc.
  page_slug text, -- For slug-based pages
  meta_title text,
  meta_description text,
  meta_keywords text[],
  og_title text,
  og_description text,
  og_image text,
  og_type text DEFAULT 'website',
  twitter_card text DEFAULT 'summary_large_image',
  twitter_title text,
  twitter_description text,
  twitter_image text,
  canonical_url text,
  robots text DEFAULT 'index,follow',
  schema_markup jsonb, -- Structured data for Google
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### User Management & Security

#### `profiles` Table
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY, -- References auth.users(id)
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### `user_roles` Table
```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- References auth.users(id)
  role app_role NOT NULL, -- ENUM: 'user', 'admin', 'super-admin'
  UNIQUE(user_id, role)
);
```

### E-commerce & Communication

#### `transactions` Table
```sql
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- References auth.users(id)
  puppy_id uuid REFERENCES puppies(id),
  amount integer NOT NULL, -- Amount in cents
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL, -- 'pending', 'completed', 'failed', 'cancelled'
  square_payment_id text,
  payment_method_details jsonb, -- Masked payment info
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### `conversations` & `messages` Tables
```sql
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- References auth.users(id)
  title text NOT NULL,
  related_entity_type text, -- 'puppy', 'litter', 'general'
  related_entity_id uuid,
  is_archived boolean NOT NULL DEFAULT false,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  sender_id uuid NOT NULL, -- References auth.users(id)
  sender_type text NOT NULL DEFAULT 'user', -- 'user', 'admin', 'system'
  content text NOT NULL,
  attachments text,
  read_at timestamptz,
  sent_at timestamptz NOT NULL DEFAULT now()
);
```

### Configuration & Integration Tables

#### `third_party_integrations` Table (Supabase Vault Storage)
```sql
CREATE TABLE public.third_party_integrations (
  service text NOT NULL, -- 'square', 'google-business', 'apple-pay'
  environment text NOT NULL, -- 'sandbox', 'production'
  data_ciphertext text NOT NULL, -- AES-256-GCM encrypted JSON
  other_config jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### `site_settings` Table
```sql
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

## API Architecture

### Public APIs (`/src/api/publicApi.ts`)
**Purpose**: Optimized queries for public pages, no authentication required

Key Functions:
- `getFeaturedPuppies(limit?: number)` - Homepage featured puppies
- `getAllPuppies(filters)` - Puppy listings with search/filter
- `getPuppyById(id)` - Single puppy details
- `getPuppyBySlug(slug)` - NEW: Slug-based puppy retrieval
- `getLitters(limit?)` - Litter listings
- `getLitterBySlug(slug)` - NEW: Slug-based litter retrieval
- `getTestimonials(limit?)` - Customer reviews
- `getAvailableBreeds()` - Breed filter options

### Admin APIs (`/src/api/adminApi.ts`)
**Purpose**: Full CRUD operations, requires admin authentication

Key Categories:
- **Puppy Management**: Create, update, delete puppies with image handling
- **Litter Management**: Full litter lifecycle management
- **Parent Management**: Stud dog management and breeding records
- **SEO Management**: Meta tag and schema markup management
- **Integration Management**: Third-party API configuration
- **User Management**: Role assignment and profile management

### Edge Functions (`/supabase/functions/`)
**Purpose**: Secure server-side operations and integrations

Current Functions:
- `integrations-upsert` - Encrypted credential storage
- `applepay-upload` - Apple Pay domain verification
- `send-email` - Templated email system
- `square-checkout` - Payment processing
- `square-webhook` - Payment status updates

**NEW Functions Needed**:
- `vault-management` - Supabase Vault operations
- `seo-generator` - Auto-generate SEO meta tags
- `slug-generator` - Auto-generate URL slugs
- `google-reviews-sync` - Google Business API integration

## Security Model

### Row Level Security (RLS)
All tables have RLS enabled with policies based on:
- **Public access**: Available puppies, published content
- **User access**: Own profiles, own transactions, own conversations
- **Admin access**: All puppy management, user management, settings
- **Super-admin access**: Security logs, integrations, system settings

### Role-Based Access Control
```sql
-- Helper function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
```

### Data Encryption
- **Third-party credentials**: AES-256-GCM encryption via shared crypto functions
- **Payment details**: Automatic masking via database triggers
- **Sensitive logs**: Encrypted audit trail for compliance

## Key Business Rules & Relationships

### Puppy-Litter Relationships
- Puppies can optionally belong to a litter (`litter_id`)
- Litters track expected vs actual puppy count
- Parent information stored as text fields for flexibility
- Breed templates provide reusable breed information

### SEO Strategy
- **Slugs**: Auto-generated from names, manually overrideable
- **URL Structure**: `/puppy/[slug]`, `/litter/[slug]`
- **Meta Tags**: Dynamic generation based on puppy/litter data
- **Schema Markup**: Google Merchant-ready product schemas

### Image Management
- **Multiple formats**: Support for legacy `photo_url` and new `image_urls[]`
- **Automatic optimization**: Thumbnail generation, WebP conversion
- **Storage buckets**: Separate buckets for puppies, litters, brand assets
- **Upload pipeline**: Cropping interface with auto-optimization

### Payment Flow
- **Square Integration**: Async inventory sync between site and Square
- **Manual Sales**: Admin can process cash/alternative payments
- **Customer Linking**: All sales must link to customer profile
- **Receipt System**: Unified receipts regardless of payment method

## Development Priorities

### PHASE 1 (IMMEDIATE)
1. **Database Migrations**: Add slug fields to puppies/litters tables
2. **SEO Infrastructure**: Create seo_meta management system
3. **Slug Generation**: Auto-generate slugs with conflict resolution
4. **Vault Migration**: Move secrets to Supabase Vault

### PHASE 2 (HIGH PRIORITY)  
1. **Public Page Optimization**: Slug-based routing and SEO
2. **Admin Puppy Management**: Unified management interface
3. **Image Pipeline**: Upload, crop, optimize workflow
4. **Parent Relationships**: Link sire/dam to puppies/litters

### PHASE 3 (MEDIUM PRIORITY)
1. **Google Reviews**: API integration and sync
2. **Square Integration**: Inventory sync and payment processing  
3. **Customer Communication**: Live chat and email templates
4. **Advanced SEO**: Structured data and Google Merchant

## Integration Points for JULES

### Database Operations
- Always use the Supabase client, never raw SQL in Edge Functions
- Respect RLS policies - use service role key in functions when needed
- Log significant actions to `security_audit_log`
- Use `has_role()` function for permission checking

### API Development
- Follow existing patterns in `adminApi.ts` and `publicApi.ts`
- Use React Query for caching and optimistic updates
- Implement proper error handling with user-friendly messages
- Add loading states and skeleton components

### Security Best Practices
- Encrypt sensitive data before storage
- Use SECURITY DEFINER functions for privileged operations
- Implement rate limiting for public endpoints
- Audit all admin actions automatically

### File Organization
- Keep components small and focused
- Use TypeScript interfaces from `/src/types/`
- Follow existing naming conventions
- Create reusable hooks for complex operations

## Current Implementation Status

### ✅ Completed
- Core database schema with proper relationships
- Basic admin API endpoints for CRUD operations
- User authentication and role-based access
- Image storage with multiple bucket support
- Basic SEO meta tag structure

### 🚧 In Progress  
- Slug-based routing system
- Supabase Vault integration
- Advanced image optimization pipeline
- Unified puppy management interface

### 📋 Planned
- Google Business API integration
- Square inventory synchronization
- Advanced SEO with structured data
- Customer communication system
- Performance monitoring and analytics

---

**Last Updated**: 2025-01-17  
**Version**: 1.0.0  
**Contact**: Reference main project documentation for support