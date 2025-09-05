import { getAllLitters, getLitterById, createLitter, updateLitter, deleteLitter } from '../controllers/litters';
import { listIntegrations, createIntegration, updateIntegration, deleteIntegration } from '../controllers/integrations';
import { getAllPuppies, getPuppyById, createPuppy, updatePuppy, deletePuppy } from '../controllers/puppies';
import { listUsers, getUserByIdAdmin, updateUserAdmin, deleteUserAdmin } from '../controllers/users';
import { listAdminStudDogs, createStudDog, updateStudDog, deleteStudDog } from '../controllers/studDogs';
import { listEmailTemplates, getEmailTemplateById, updateEmailTemplate } from '../controllers/emailTemplates';
import { getSiteSettings, updateSiteSettings } from '../controllers/settings';
import { listAllBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost } from '../controllers/blogPosts';
import { listAllTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonials';
import { listAllBreedTemplates, getBreedTemplateById, createBreedTemplate, updateBreedTemplate, deleteBreedTemplate } from '../controllers/breedTemplates';
import { listAllTestimonials as listEnhancedTestimonials, createTestimonial as createEnhancedTestimonial, updateTestimonial as updateEnhancedTestimonial, deleteTestimonial as deleteEnhancedTestimonial, getTestimonialAnalytics } from '../controllers/enhancedTestimonials';
import { listSEOMeta, getSEOMeta, upsertSEOMeta, deleteSEOMeta, generateSitemap } from '../controllers/seoManagement';
import { authenticate } from '../utils/auth';
import type { Env } from '../env';

// Define the structure for route handlers with authentication
interface Route {
  method: string;
  path: string;
  handler: (request: Request, env: Env, authResult: unknown) => Promise<Response> | Response;
  auth?: boolean;
}

// Define the structure for public route handlers
interface PublicRoute {
  method: string;
  path: string;
  handler: (request: Request, env: Env) => Promise<Response> | Response;
}

// Authentication middleware
const withAuth = (route: Route) => {
  return {
    ...route,
    handler: async (request: Request, env: Env) => {
      const authResult = await authenticate(request, env);
      if (!authResult?.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return route.handler(request, env, authResult);
    },
  };
};

// Public Routes
const publicRoutes: PublicRoute[] = [
  // Health check endpoint
  {
    method: 'GET',
    path: '/health',
    handler: async () => {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    },
  },
];

// Admin Routes
const adminRoutes = [
  // Litters
  {
    method: 'GET',
    path: '/admin/litters',
    handler: async (request, env, authResult) => {
      return getAllLitters(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/litters/:id',
    handler: async (request, env, authResult) => {
      return getLitterById(request, env);
    },
  },
  {
    method: 'POST',
    path: '/admin/litters',
    handler: async (request, env, authResult) => {
      return createLitter(request, env, authResult);
    },
  },
  {
    method: 'PUT',
    path: '/admin/litters/:id',
    handler: async (request, env, authResult) => {
      return updateLitter(request, env, authResult);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/litters/:id',
    handler: async (request, env, authResult) => {
      return deleteLitter(request, env, authResult);
    },
  },
  
  // Third-Party Integrations
  {
    method: 'GET',
    path: '/admin/integrations',
    handler: async (request, env, authResult) => {
      return listIntegrations(request, env);
    },
  },
  {
    method: 'POST',
    path: '/admin/integrations',
    handler: async (request, env, authResult) => {
      return createIntegration(request, env);
    },
  },
  {
    method: 'PUT',
    path: '/admin/integrations/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const integrationId = url.pathname.split('/').pop();
      return updateIntegration(request, env, integrationId);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/integrations/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const integrationId = url.pathname.split('/').pop();
      return deleteIntegration(request, env, integrationId);
    },
  },
  
  // Puppies Management
  {
    method: 'GET',
    path: '/admin/puppies',
    handler: async (request, env, authResult) => {
      return getAllPuppies(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/puppies/:id',
    handler: async (request, env, authResult) => {
      return getPuppyById(request, env);
    },
  },
  {
    method: 'POST',
    path: '/admin/puppies',
    handler: async (request, env, authResult) => {
      return createPuppy(request, env, authResult);
    },
  },
  {
    method: 'PUT',
    path: '/admin/puppies/:id',
    handler: async (request, env, authResult) => {
      return updatePuppy(request, env, authResult);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/puppies/:id',
    handler: async (request, env, authResult) => {
      return deletePuppy(request, env, authResult);
    },
  },

  // User Management
  {
    method: 'GET',
    path: '/admin/users',
    handler: async (request, env, authResult) => {
      return listUsers(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/users/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const userId = url.pathname.split('/').pop();
      return getUserByIdAdmin(request, env, userId);
    },
  },
  {
    method: 'PUT',
    path: '/admin/users/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const userId = url.pathname.split('/').pop();
      return updateUserAdmin(request, env, userId);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/users/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const userId = url.pathname.split('/').pop();
      return deleteUserAdmin(request, env, userId);
    },
  },

  // Stud Dogs Management
  {
    method: 'GET',
    path: '/admin/stud-dogs',
    handler: async (request, env, authResult) => {
      return listAdminStudDogs(request, env);
    },
  },
  {
    method: 'POST',
    path: '/admin/stud-dogs',
    handler: async (request, env, authResult) => {
      return createStudDog(request, env);
    },
  },
  {
    method: 'PUT',
    path: '/admin/stud-dogs/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const studDogId = url.pathname.split('/').pop();
      return updateStudDog(request, env, studDogId);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/stud-dogs/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const studDogId = url.pathname.split('/').pop();
      return deleteStudDog(request, env, studDogId);
    },
  },

  // Email Templates Management
  {
    method: 'GET',
    path: '/admin/email-templates',
    handler: async (request, env, authResult) => {
      return listEmailTemplates(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/email-templates/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const templateId = url.pathname.split('/').pop();
      return getEmailTemplateById(request, env, templateId);
    },
  },
  {
    method: 'PUT',
    path: '/admin/email-templates/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const templateId = url.pathname.split('/').pop();
      return updateEmailTemplate(request, env, templateId);
    },
  },

  // Site Settings Management
  {
    method: 'GET',
    path: '/admin/settings',
    handler: async (request, env, authResult) => {
      return getSiteSettings(request, env);
    },
  },
  {
    method: 'PUT',
    path: '/admin/settings',
    handler: async (request, env, authResult) => {
      return updateSiteSettings(request, env);
    },
  },

  // Blog Posts Management  
  {
    method: 'GET',
    path: '/admin/blog-posts',
    handler: async (request, env, authResult) => {
      return listAllBlogPosts(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/blog-posts/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const postId = url.pathname.split('/').pop();
      return getBlogPostById(request, env, postId);
    },
  },
  {
    method: 'POST',
    path: '/admin/blog-posts',
    handler: async (request, env, authResult) => {
      return createBlogPost(request, env, authResult);
    },
  },
  {
    method: 'PUT',
    path: '/admin/blog-posts/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const postId = url.pathname.split('/').pop();
      return updateBlogPost(request, env, postId, authResult);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/blog-posts/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const postId = url.pathname.split('/').pop();
      return deleteBlogPost(request, env, postId, authResult);
    },
  },

  // Testimonials Management
  {
    method: 'GET',
    path: '/admin/testimonials',
    handler: async (request, env, authResult) => {
      return listAllTestimonials(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/testimonials/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const testimonialId = url.pathname.split('/').pop();
      return getTestimonialById(request, env, testimonialId);
    },
  },
  {
    method: 'POST',
    path: '/admin/testimonials',
    handler: async (request, env, authResult) => {
      return createTestimonial(request, env, authResult);
    },
  },
  {
    method: 'PUT',
    path: '/admin/testimonials/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const testimonialId = url.pathname.split('/').pop();
      return updateTestimonial(request, env, testimonialId, authResult);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/testimonials/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const testimonialId = url.pathname.split('/').pop();
      return deleteTestimonial(request, env, testimonialId, authResult);
    },
  },

  // Breed Templates Management
  {
    method: 'GET',
    path: '/admin/breed-templates',
    handler: async (request, env, authResult) => {
      return listAllBreedTemplates(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/breed-templates/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const breedId = url.pathname.split('/').pop();
      return getBreedTemplateById(request, env, breedId);
    },
  },
  {
    method: 'POST',
    path: '/admin/breed-templates',
    handler: async (request, env, authResult) => {
      return createBreedTemplate(request, env, authResult);
    },
  },
  {
    method: 'PUT',
    path: '/admin/breed-templates/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const breedId = url.pathname.split('/').pop();
      return updateBreedTemplate(request, env, breedId, authResult);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/breed-templates/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const breedId = url.pathname.split('/').pop();
      return deleteBreedTemplate(request, env, breedId, authResult);
    },
  },

  // Enhanced Testimonials Management
  {
    method: 'GET',
    path: '/admin/testimonials/enhanced',
    handler: async (request, env, authResult) => {
      return listEnhancedTestimonials(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/testimonials/analytics',
    handler: async (request, env, authResult) => {
      return getTestimonialAnalytics(request, env);
    },
  },
  {
    method: 'POST',
    path: '/admin/testimonials/enhanced',
    handler: async (request, env, authResult) => {
      return createEnhancedTestimonial(request, env, authResult);
    },
  },
  {
    method: 'PUT',
    path: '/admin/testimonials/enhanced/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const testimonialId = url.pathname.split('/').pop();
      return updateEnhancedTestimonial(request, env, testimonialId, authResult);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/testimonials/enhanced/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const testimonialId = url.pathname.split('/').pop();
      return deleteEnhancedTestimonial(request, env, testimonialId, authResult);
    },
  },
  {
    method: 'POST',
    path: '/admin/testimonials/sync-google',
    handler: async (request, env, authResult) => {
      // Sync Google Reviews by calling the edge function
      const response = await env.SUPABASE_CLIENT.functions.invoke('google-reviews-sync');
      return new Response(JSON.stringify(response.data || {}), {
        headers: { 'Content-Type': 'application/json' }
      });
    },
  },

  // SEO Management
  {
    method: 'GET',
    path: '/admin/seo/meta',
    handler: async (request, env, authResult) => {
      return listSEOMeta(request, env);
    },
  },
  {
    method: 'POST',
    path: '/admin/seo/meta',
    handler: async (request, env, authResult) => {
      return upsertSEOMeta(request, env, authResult);
    },
  },
  {
    method: 'PUT',
    path: '/admin/seo/meta/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const seoId = url.pathname.split('/').pop();
      return upsertSEOMeta(request, env, authResult);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/seo/meta/:id',
    handler: async (request, env, authResult) => {
      const url = new URL(request.url);
      const seoId = url.pathname.split('/').pop();
      return deleteSEOMeta(request, env, seoId, authResult);
    },
  },
  {
    method: 'GET',
    path: '/admin/seo/sitemap',
    handler: async (request, env, authResult) => {
      return generateSitemap(request, env);
    },
  },
];

export default adminRoutes;
