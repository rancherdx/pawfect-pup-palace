import { IRequest } from 'itty-router';
import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';
import { verifyJwtAuth } from '../auth';
import { getCurrentUser, updateUserProfile } from '../controllers/users';
import { getMyPuppies, getPuppyHealthRecords, addPuppyHealthRecord } from '../controllers/puppies';
import { getMyConversations, getMessagesForConversation, sendMessage, startConversation } from '../controllers/chat';

export const protectedRoutes = (router: unknown) => {
  router.get('/api/users/me', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return getCurrentUser(request as unknown as Request, env, authResult.decodedToken);
  });

  router.put('/api/users/me/profile', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return updateUserProfile(request as unknown as Request, env, authResult.decodedToken);
  });

  router.get('/api/my-puppies', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return getMyPuppies(request as unknown as Request, env, authResult.decodedToken);
  });

  router.get('/api/puppies/:puppyId/health-records', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    const params = request.params || {};
    return getPuppyHealthRecords(request as unknown as Request, env, { puppyId: params.puppyId }, authResult.decodedToken);
  });

  router.post('/api/puppies/:puppyId/health-records', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    const params = request.params || {};
    return addPuppyHealthRecord(request as unknown as Request, env, authResult.decodedToken, { puppyId: params.puppyId });
  });

  // Chat routes
  router.get('/api/my-conversations', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return getMyConversations(request as unknown as Request, env, authResult.decodedToken);
  });

  router.post('/api/conversations', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return startConversation(request as unknown as Request, env, authResult.decodedToken);
  });

  router.get('/api/conversations/:conversationId/messages', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    const params = request.params || {};
    return getMessagesForConversation(request as unknown as Request, env, authResult.decodedToken, params.conversationId);
  });

  router.post('/api/conversations/:conversationId/messages', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.authenticated || !authResult.decodedToken) {
      return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    const params = request.params || {};
    return sendMessage(request as unknown as Request, env, authResult.decodedToken, params.conversationId);
  });
};
};
