import { IRequest } from 'itty-router';
import type { Env } from '../env';
import { processPayment, handleSquareWebhook } from '../controllers/payment';
import { upsertSquareConfig, getSquareStatus } from '../controllers/squarePayment';
import { authenticate } from '../utils/auth';
import { corsHeaders } from '../utils/cors';

export const squareRoutes = (router: { get: (...args: any[]) => any; post: (...args: any[]) => any }) => {
  const requireAdmin = async (request: Request, env: Env) => {
    try {
      const auth = await authenticate(request, env);
      const roles = auth?.roles || [];
      if (!auth?.userId || (!roles.includes('admin') && !roles.includes('super-admin')))
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return null;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  };

  // Square configuration routes (admin only)
  router.post('/api/square/config', async (request: IRequest, env: Env) => {
    const guard = await requireAdmin(request as unknown as Request, env);
    if (guard) return guard;
    return upsertSquareConfig(request as unknown as Request, env);
  });
  
  router.get('/api/square/status', async (request: IRequest, env: Env) => {
    const guard = await requireAdmin(request as unknown as Request, env);
    if (guard) return guard;
    return getSquareStatus(request as unknown as Request, env);
  });
  
  // Payment processing routes
  router.post('/api/checkout', (request: IRequest, env: Env) => 
    processPayment(request as unknown as Request, env));
  
  // Square webhook routes (do not require auth, verified by signature)
  router.post('/api/webhooks/square/payment', (request: IRequest, env: Env) => 
    handleSquareWebhook(request as unknown as Request, env));

  // Apple Pay domain verification
  router.get('/.well-known/apple-developer-merchantid-domain-association', async (request: IRequest, env: Env) => {
    // Serve Apple Pay verification file from storage or return 404
    try {
      const object = await env.STATIC_ASSETS.get('.well-known/apple-developer-merchantid-domain-association');
      if (object) {
        return new Response(object.body, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    } catch (error) {
      console.error('Error serving Apple Pay verification file:', error);
    }
    return new Response('Not Found', { status: 404 });
  });
};