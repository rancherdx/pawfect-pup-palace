# Frontend Project Prompt - Puppy Breeder Website (Cloudflare Pages)

## Project Overview
Create a modern, responsive frontend application for a puppy breeder business using React, TypeScript, and Tailwind CSS. This will be deployed on Cloudflare Pages and connect to the separate Cloudflare Workers backend API.

## Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router DOM
- **State Management**: Tanstack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deployment**: Cloudflare Pages

## Backend API Connection
The frontend will connect to a separate Cloudflare Workers backend API. Configure the API base URL:

```typescript
// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-worker.your-subdomain.workers.dev';
```

## Required Environment Variables
```bash
VITE_API_URL=https://your-backend-api.workers.dev
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

## Project Structure
```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── admin/                 # Admin dashboard components
│   ├── checkout/              # Checkout flow components
│   ├── dashboard/             # User dashboard components
│   ├── puppy-details/         # Puppy detail page components
│   ├── search/                # Search functionality
│   └── financing/             # Financing components
├── pages/                     # Route components
├── hooks/                     # Custom React hooks
├── api/                       # API integration layer
├── types/                     # TypeScript type definitions
├── contexts/                  # React contexts
├── lib/                       # Utility functions
└── assets/                    # Static assets
```

## Core Pages & Components

### 1. Public Pages
```typescript
// Main public routes
- Home (/)
- About (/about)
- Available Puppies (/litters)
- Puppy Details (/puppies/:id)
- Adoption Process (/adopt)
- Reviews (/reviews)
- Health Information (/health)
- Contact (/contact)
- Blog (/blog)
- Blog Post (/blog/:slug)
- Stud Services (/stud)
- Financing (/financing)
- System Status (/system-status)
```

### 2. Authentication Pages
```typescript
- Login (/login)
- Register (/register)
- Google OAuth Callback (/auth/google/callback)
```

### 3. Protected User Pages
```typescript
- User Dashboard (/dashboard)
- Checkout Process (/checkout)
- Payment Success (/payment-success)
- Payment Cancelled (/payment-cancelled)
```

### 4. Admin Pages
```typescript
- Admin Dashboard (/admin)
- Admin Testing (/admin-test) [Super Admin only]
```

## Key Components Implementation

### Hero Section
```typescript
// Modern hero with CTA, hero image, and key messaging
- Responsive design with mobile-first approach
- Call-to-action buttons
- Statistics display
- Background video/image support
```

### Puppy Card Component
```typescript
interface PuppyCardProps {
  puppy: {
    id: string;
    name: string;
    breed: string;
    price: number;
    status: string;
    image_url: string;
    birth_date: string;
    gender: string;
    color: string;
  };
  isAdmin?: boolean;
}
```

### Search System
```typescript
// Global search with filtering
- Search across puppies, litters, blog posts
- Filter by breed, price range, availability
- Real-time search results
- Search result highlighting
```

### Admin Dashboard Components
```typescript
// Comprehensive admin management
- Puppy Management (CRUD operations)
- Litter Management
- Blog Management
- Affiliate Partner Management
- SEO Manager
- Transaction History
- Settings Panel
- Square/Stripe Integration panels
```

### Checkout Flow
```typescript
// Multi-step checkout process
- Puppy Confirmation
- Adoption Questions
- Add-ons Selection
- Payment Methods (Square/Stripe)
- Success Animation with confetti
```

## Authentication Integration

### Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}
```

### Google OAuth Integration
```typescript
// Google authentication flow
- OAuth button component
- Callback handler
- Calendar sync integration
- Profile picture from Google
```

## API Integration Layer

### Base API Client
```typescript
// src/api/base.ts
class ApiClient {
  private baseURL: string;
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Auto-attach auth headers
    // Handle token refresh
    // Error handling and retries
  }
}
```

### API Modules
```typescript
// Organized API calls by feature
- authApi.ts (login, register, Google OAuth)
- puppiesApi.ts (CRUD operations)
- littersApi.ts (CRUD operations)
- blogApi.ts (posts, categories)
- affiliateApi.ts (partners, promo codes)
- paymentsApi.ts (Square, Stripe integration)
```

## Design System

### Color Palette
```css
:root {
  --brand-red: #dc2626;      /* Primary brand color */
  --brand-blue: #2563eb;     /* Secondary color */
  --accent-gold: #f59e0b;    /* Accent color */
  --success: #16a34a;        /* Success states */
  --warning: #ea580c;        /* Warning states */
  --error: #dc2626;          /* Error states */
}
```

### Typography Scale
```css
/* Headings */
.text-display: 4rem/1.1
.text-h1: 3rem/1.2
.text-h2: 2.25rem/1.3
.text-h3: 1.875rem/1.4
.text-h4: 1.5rem/1.5

/* Body text */
.text-lg: 1.125rem/1.6
.text-base: 1rem/1.6
.text-sm: 0.875rem/1.5
.text-xs: 0.75rem/1.4
```

### Component Variants
```typescript
// Button variants
- Primary (brand-red background)
- Secondary (outline style)
- Ghost (minimal style)
- Destructive (error actions)

// Card variants
- Default (white background, shadow)
- Featured (gradient border)
- Interactive (hover effects)
```

## State Management

### React Query Setup
```typescript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Custom Hooks
```typescript
// Feature-specific hooks
- usePuppies() - Puppy data management
- useLitters() - Litter data management
- useAuth() - Authentication state
- useBlog() - Blog posts and categories
- usePayments() - Payment processing
- useSearch() - Search functionality
```

## Form Handling

### React Hook Form + Zod
```typescript
// Form validation schemas
const puppySchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  price: z.number().positive("Price must be positive"),
  // ... other fields
});

// Form components with validation
- PuppyForm (admin)
- AdoptionQuestions (checkout)
- ContactForm (public)
- LoginForm / RegisterForm
```

## Responsive Design

### Breakpoint Strategy
```css
/* Mobile-first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Component Responsiveness
```typescript
// Responsive patterns
- Mobile navigation with hamburger menu
- Responsive grid layouts (1-2-3-4 columns)
- Adaptive typography scaling
- Touch-friendly interactions
- Progressive image loading
```

## Performance Optimization

### Code Splitting
```typescript
// Route-based code splitting
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PuppyDetails = lazy(() => import('./pages/PuppyDetails'));

// Component-based splitting for heavy components
const ChartComponent = lazy(() => import('./components/ChartComponent'));
```

### Image Optimization
```typescript
// Progressive loading with placeholders
- WebP format support with fallbacks
- Responsive image sizing
- Lazy loading for images below fold
- Blur-up technique for smooth loading
```

### Bundle Optimization
```typescript
// Vite configuration for optimal bundles
- Tree shaking for unused code
- Dynamic imports for vendor chunks
- Asset optimization and compression
- Service worker for caching
```

## SEO & Meta Management

### Dynamic Meta Tags
```typescript
// React Helmet or similar for meta management
- Dynamic page titles
- Open Graph tags for social sharing
- Schema.org markup for puppies/business
- Canonical URLs
- Sitemap generation
```

## Error Handling & UX

### Error Boundaries
```typescript
// Graceful error handling
- Global error boundary
- Route-specific error boundaries
- Network error handling
- Form validation errors
- 404 and error pages
```

### Loading States
```typescript
// Comprehensive loading UX
- Skeleton screens for content
- Button loading states
- Global loading indicators
- Progressive enhancement
- Optimistic updates
```

## Accessibility

### WCAG Compliance
```typescript
// Accessibility features
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance
- Alternative text for images
- ARIA labels and descriptions
```

## Animation & Interactions

### Tailwind Animations
```css
/* Custom animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### Interactive Elements
```typescript
// Micro-interactions
- Hover effects on cards
- Button press animations
- Form input focus states
- Page transition animations
- Success state animations (confetti)
```

## Testing Strategy

### Testing Tools
```typescript
// Testing setup
- Vitest for unit tests
- React Testing Library for component tests
- Cypress or Playwright for E2E tests
- Mock API responses for testing
```

## Deployment Configuration

### Cloudflare Pages
```toml
# wrangler.toml for Pages
[build]
command = "npm run build"
destination = "dist"

[build.environment_variables]
VITE_API_URL = "https://your-backend-worker.workers.dev"
```

### Build Optimization
```typescript
// Vite configuration
- Bundle splitting by route
- Asset optimization
- Environment variable handling
- Source map configuration for production
```

## Content Strategy

### Homepage Content
```typescript
// Key sections
- Hero with value proposition
- Featured available puppies
- Testimonials/reviews
- About the breeder
- Contact information
- Trust indicators (certifications, awards)
```

### SEO Content
```typescript
// Content optimization
- Breed-specific landing pages
- Blog content for SEO
- Local SEO optimization
- Google My Business integration
- Review schema markup
```

## Integration Points

### External Services
```typescript
// Third-party integrations
- Google Maps for location
- Social media feeds
- Email newsletter signup
- Live chat support
- Analytics tracking
```

This frontend should provide a complete, modern, and user-friendly interface for the puppy breeding business with excellent performance, accessibility, and user experience across all devices.
