# GDS Puppies - Supabase Edition

A modern puppy breeder management application built with React, TypeScript, and Supabase.

## Features

- 🐕 **Puppy Management**: Add, update, and showcase available puppies
- 🏠 **Litter Tracking**: Manage litters and track puppy availability
- 👥 **User Authentication**: Secure login and user management with Supabase Auth
- 📱 **Responsive Design**: Beautiful, mobile-first design with Tailwind CSS
- 🔒 **Role-Based Access**: Admin and user roles with proper permissions
- 📸 **Image Management**: Upload and manage puppy photos with Supabase Storage
- 🛡️ **Security**: Row Level Security (RLS) policies for data protection

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase project account

### Environment Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd gds-puppies
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

4. Start the development server:
```bash
npm run dev
```

## Supabase Setup

This project requires a Supabase backend with the following setup:

### Database Tables
- `profiles` - User profile information
- `user_roles` - Role-based access control
- `puppies` - Puppy information and listings
- `litters` - Litter management
- `testimonials` - Customer reviews and testimonials
- `data_deletion_requests` - GDPR compliance

### Storage Buckets
- `puppy-images` - Puppy photo storage
- `litter-images` - Litter photo storage
- `brand-assets` - Website assets
- `videos` - Video content

### Authentication
- Email/Password authentication enabled
- Row Level Security (RLS) policies configured
- User roles system implemented

## Deployment

The application can be deployed to any static hosting service like:
- Vercel
- Netlify  
- GitHub Pages
- Supabase Hosting

For Supabase hosting:
```bash
npm run build
npx supabase functions deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.