import { IRequest } from 'itty-router';
import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';
import { requestDataDeletion } from '../controllers/privacyController';
import { getAllPuppies, getPuppyById } from '../controllers/puppies';
import { getAllLitters, getLitterById } from '../controllers/litters';
import { getSiteSettings as getPublicSiteSettings } from '../controllers/settings';
import { getSystemStatus, getSystemUptime } from '../controllers/systemStatusController';

// Minimal router interface compatible with itty-router instance
type AppRouter = { get: (...args: any[]) => any; post: (...args: any[]) => any };

export const publicRoutes = (router: AppRouter) => {
  // Privacy routes
  router.post('/api/privacy/deletion-request', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    requestDataDeletion(request as unknown as Request, env));

  // Public Resource Routes
  router.get('/api/puppies', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    getAllPuppies(request as unknown as Request, env));
  router.get('/api/puppies/:id', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    getPuppyById(request as unknown as Request, env));

  router.get('/api/litters', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    getAllLitters(request as unknown as Request, env));
  router.get('/api/litters/:id', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    getLitterById(request as unknown as Request, env));

  router.get('/api/settings/public', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    getPublicSiteSettings(request as unknown as Request, env));

  // Public System Status Routes
  router.get('/api/system/status', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    getSystemStatus(request as unknown as Request, env));
  router.get('/api/system/uptime', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    getSystemUptime(request as unknown as Request, env));
};
