import { IRequest } from 'itty-router';
import type { Env } from '../env';
import { generateAuthUrl, handleOAuthCallback, getOAuthStatus, revokeOAuth } from '../controllers/squareOAuth';
import { handleSquareWebhook } from '../controllers/payment';
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

  // Square OAuth routes (admin only)
  router.get('/api/square/oauth/auth-url', async (request: IRequest, env: Env) => {
    const guard = await requireAdmin(request as unknown as Request, env);
    if (guard) return guard;
    return generateAuthUrl(request as unknown as Request, env);
  });
  
  router.get('/api/square/oauth/callback', async (request: IRequest, env: Env) => {
    const guard = await requireAdmin(request as unknown as Request, env);
    if (guard) return guard;
    return handleOAuthCallback(request as unknown as Request, env);
  });
  
  router.get('/api/square/oauth/status', async (request: IRequest, env: Env) => {
    const guard = await requireAdmin(request as unknown as Request, env);
    if (guard) return guard;
    return getOAuthStatus(request as unknown as Request, env);
  });
  
  router.post('/api/square/oauth/revoke', async (request: IRequest, env: Env) => {
    const guard = await requireAdmin(request as unknown as Request, env);
    if (guard) return guard;
    return revokeOAuth(request as unknown as Request, env);
  });
  
  // Square webhook routes (do not require auth, verified by signature)
  router.post('/api/webhooks/square/payment', (request: IRequest, env: Env) => 
    handleSquareWebhook(request as unknown as Request, env));
};