# GDS Puppies - Advanced Breeder Management Platform

GDS Puppies is a comprehensive, modern web application designed to streamline the operations of a professional puppy breeder. It provides a robust suite of tools for managing puppies and litters, handling customer interactions, processing payments, and maintaining a professional online presence. This platform is built with a focus on security, scalability, and user experience, utilizing a powerful tech stack centered around React and Supabase.

[![GDS Puppies Screenshot](https://user-images.githubusercontent.com/12345/some-image-url.png)](https://your-live-demo-url.com)
*A placeholder for a screenshot of the application's dashboard.*

**[Live Demo](https://your-live-demo-url.com)** (Link to be added)

## ✨ Features

- 🐾 **Puppy & Litter Management**: A full CRUD interface for managing puppy profiles and tracking litters from birth to adoption.
- 🔐 **Secure User Authentication**: Robust user and admin authentication system with role-based access control (RBAC) using Supabase Auth.
- 💳 **E-commerce Ready**: Integrated with Square for secure payment processing, including a multi-step checkout flow.
- ダ **Advanced Admin Dashboard**: A comprehensive dashboard for administrators to manage all aspects of the application, including:
    - Content Management (Blog, Testimonials, SEO)
    - Transaction History
    - User Management
    - Secure Third-Party Integrations (e.g., Google, Square)
    - System Health & Security Monitoring
- 🚀 **Serverless Backend**: Powered by Supabase Edge Functions for scalable, secure backend logic.
- 🖼️ **Cloud Storage**: Securely manage and serve images and videos using Supabase Storage.
- ✉️ **Transactional Emails**: Automated email system for welcome messages, payment confirmations, and notifications.
- 📱 **Responsive & Modern UI**: A beautiful, mobile-first design built with Tailwind CSS and shadcn/ui.
- 🔍 **System & API Monitoring**: Built-in pages for system status checks and API documentation (Swagger & ReDoc).
- 🔒 **Security-First Design**: Implements Row Level Security (RLS), encrypted secrets, and detailed audit logging.

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Emails**: React Email, MailChannels

## 🚀 Getting Started

Follow these instructions to set up the project for local development.

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Environment Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/gds-puppies.git
    cd gds-puppies
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    - Log in to the Supabase CLI: `npx supabase login`
    - Link your local repository to your Supabase project: `npx supabase link --project-ref <your-project-id>`
    - Push the database schema: `npx supabase db push`

4.  **Configure Environment Variables:**
    - Create a `.env` file in the root of the project by copying the example file:
      ```bash
      cp .env.example .env
      ```
    - Populate the `.env` file with your Supabase project's URL and anon key. You can find these in your Supabase project's "API" settings.
    - Create a `.env` file in the `supabase/functions` directory for local function development.

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

## Usage

### Initial Setup
Once the application is running, navigate to `/setup` in your browser to create the first super administrator account. This page is protected and can only be used to create up to two admin accounts.

### Admin Dashboard
After creating an admin account, log in and navigate to `/admin` to access the admin dashboard. From here, you can manage all aspects of the application.

## 🔗 API Documentation

The application includes self-hosted API documentation. Once the application is running, you can access it at the following routes:
- **Swagger UI**: `/api-docs` (select the Swagger tab)
- **ReDoc**: `/api-docs` (select the ReDoc tab)

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new feature branch:** `git checkout -b feature/your-feature-name`
3.  **Make your changes.** Please ensure your code follows the existing style and conventions.
4.  **Commit your changes:** `git commit -m 'feat: Add some amazing feature'`
5.  **Push to the branch:** `git push origin feature/your-feature-name`
6.  **Submit a pull request.**

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.