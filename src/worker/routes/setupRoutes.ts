import { IRequest } from 'itty-router';
import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';
import { checkSetupStatus, createFirstAdmin } from '../controllers/setup';

// Minimal router interface compatible with itty-router instance
type AppRouter = { get: (...args: any[]) => any; post: (...args: any[]) => any };

export const setupRoutes = (router: AppRouter) => {
  // Check if setup is required
  router.get('/api/setup/status', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    return checkSetupStatus(request as unknown as Request, env);
  });

  // Create first admin user
  router.post('/api/setup/admin', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    return createFirstAdmin(request as unknown as Request, env);
  });
};
