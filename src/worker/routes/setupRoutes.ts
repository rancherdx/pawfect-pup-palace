import { IRequest } from 'itty-router';
import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';
import { checkSetupStatus, createFirstAdmin } from '../controllers/setup';

export const setupRoutes = (router: unknown) => {
  // Check if setup is required
  router.get('/api/setup/status', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    return checkSetupStatus(request as unknown as Request, env);
  });

  // Create first admin user
  router.post('/api/setup/admin', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    return createFirstAdmin(request as unknown as Request, env);
  });
};
};
