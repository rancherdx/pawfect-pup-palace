import { IRequest } from 'itty-router';
import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';
import { login, register, logout } from '../controllers/users';

export const authRoutes = (router: unknown) => {
  // Auth routes
  router.post('/api/auth/login', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    login(request as unknown as Request, env));
  router.post('/api/auth/register', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    register(request as unknown as Request, env));
  router.post('/api/auth/logout', (request: IRequest, env: Env, ctx: ExecutionContext) => 
    logout(request as unknown as Request, env));
};
};
