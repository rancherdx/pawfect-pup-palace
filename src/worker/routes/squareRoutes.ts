import { IRequest } from 'itty-router';
import type { Env } from '../env';
import { generateAuthUrl, handleOAuthCallback, getOAuthStatus, revokeOAuth } from '../controllers/squareOAuth';
import { handleSquareWebhook } from '../controllers/payment';

export const squareRoutes = (router: unknown) => {
  // Square OAuth routes
  router.get('/api/square/oauth/auth-url', (request: IRequest, env: Env) => 
    generateAuthUrl(request as unknown as Request, env));
  
  router.get('/api/square/oauth/callback', (request: IRequest, env: Env) => 
    handleOAuthCallback(request as unknown as Request, env));
  
  router.get('/api/square/oauth/status', (request: IRequest, env: Env) => 
    getOAuthStatus(request as unknown as Request, env));
  
  router.post('/api/square/oauth/revoke', (request: IRequest, env: Env) => 
    revokeOAuth(request as unknown as Request, env));
  
  // Square webhook routes
  router.post('/api/webhooks/square/payment', (request: IRequest, env: Env) => 
    handleSquareWebhook(request as unknown as Request, env));
};