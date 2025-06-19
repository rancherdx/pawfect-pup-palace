import { IRequest } from 'itty-router';
import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';
import { verifyJwtAuth, adminAuthMiddleware } from '../auth';
import { listUsers, getUserByIdAdmin, updateUserAdmin, deleteUserAdmin } from '../controllers/users';
import { getAllPuppies, createPuppy, updatePuppy, deletePuppy } from '../controllers/puppies';
import { createLitter, updateLitter, deleteLitter } from '../controllers/litters';
import { getSiteSettings as getAllSiteSettings, updateSiteSettings as updateSiteSetting } from '../controllers/settings';
import { listEmailTemplates, getEmailTemplateById, updateEmailTemplate } from '../controllers/emailTemplates';
import { listIntegrations, updateIntegration } from '../controllers/integrations';
import { listDataDeletionRequests, getDataDeletionRequestById, updateDataDeletionRequestStatus } from '../controllers/adminPrivacyController';
import { createAdminTestSession, createImpersonationSession, getTestSessionLogs } from '../controllers/adminTestController';

export const adminRoutes = (router: any) => {
  // User Management (Admin)
  router.get('/api/admin/users', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    return listUsers(request as unknown as Request, env);
  });

  router.get('/api/admin/users/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return getUserByIdAdmin(request as unknown as Request, env, params.id);
  });

  router.put('/api/admin/users/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return updateUserAdmin(request as unknown as Request, env, params.id);
  });

  router.delete('/api/admin/users/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return deleteUserAdmin(request as unknown as Request, env, params.id);
  });

  // Puppy Management (Admin)
  router.get('/api/admin/puppies', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    return getAllPuppies(request as unknown as Request, env);
  });

  router.post('/api/admin/puppies', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return createPuppy(request as unknown as Request, env, authResult.decodedToken);
  });

  router.put('/api/admin/puppies/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return updatePuppy(request as unknown as Request, env, authResult.decodedToken);
  });

  router.delete('/api/admin/puppies/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return deletePuppy(request as unknown as Request, env, authResult.decodedToken);
  });

  // Litter Management (Admin)
  router.post('/api/admin/litters', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return createLitter(request as unknown as Request, env, authResult.decodedToken);
  });

  router.put('/api/admin/litters/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return updateLitter(request as unknown as Request, env, authResult.decodedToken);
  });

  router.delete('/api/admin/litters/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return deleteLitter(request as unknown as Request, env, authResult.decodedToken);
  });

  // Site Settings (Admin)
  router.get('/api/admin/settings', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    return getAllSiteSettings(request as unknown as Request, env);
  });

  router.put('/api/admin/settings/:key', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return updateSiteSetting(request as unknown as Request, env, params.key);
  });

  // Email Templates (Admin)
  router.get('/api/admin/email-templates', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    return listEmailTemplates(request as unknown as Request, env);
  });

  router.get('/api/admin/email-templates/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return getEmailTemplateById(request as unknown as Request, env, params.id);
  });

  router.post('/api/admin/email-templates', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    // Since there's no createEmailTemplate function, we'll return a not implemented response
    return new Response(JSON.stringify({ error: 'Create email template not implemented' }), {
      status: 501,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  });

  router.put('/api/admin/email-templates/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return updateEmailTemplate(request as unknown as Request, env, params.id);
  });

  router.delete('/api/admin/email-templates/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    // Since there's no deleteEmailTemplate function, we'll return a not implemented response
    return new Response(JSON.stringify({ error: 'Delete email template not implemented' }), {
      status: 501,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  });

  // Integrations (Admin)
  router.get('/api/admin/integrations', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    return listIntegrations(request as unknown as Request, env);
  });

  router.put('/api/admin/integrations/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return updateIntegration(request as unknown as Request, env, params.id);
  });

  // Data Deletion Requests (Admin)
  router.get('/api/admin/data-deletion-requests', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    return listDataDeletionRequests(request as unknown as Request, env);
  });

  router.get('/api/admin/data-deletion-requests/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return getDataDeletionRequestById(request as unknown as Request, env, { id: params.id });
  });

  router.put('/api/admin/data-deletion-requests/:id/status', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const params = request.params || {};
    return updateDataDeletionRequestStatus(request as unknown as Request, env, { id: params.id });
  });

  // Admin Test Routes
  router.post('/api/admin/test-session', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return createAdminTestSession(request as unknown as Request, env, authResult.decodedToken);
  });

  router.post('/api/admin/test-session/impersonate', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return createImpersonationSession(request as unknown as Request, env, authResult.decodedToken);
  });

  router.get('/api/admin/test-logs', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    const authResult = await verifyJwtAuth(request as unknown as Request, env);
    if (!authResult.decodedToken) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
    }
    return getTestSessionLogs(request as unknown as Request, env, authResult.decodedToken);
  });

  // Transaction History Route
  router.get('/api/admin/transactions', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
    if (authResponse) return authResponse;
    
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const status = url.searchParams.get('status');
      const searchQuery = url.searchParams.get('searchQuery');
      const offset = (page - 1) * limit;

      let query = `SELECT * FROM transactions`;
      let countQuery = `SELECT COUNT(*) as total FROM transactions`;
      const params: any[] = [];
      const countParams: any[] = [];

      const conditions: string[] = [];

      if (status && status !== 'All') {
        conditions.push('status = ?');
        params.push(status);
        countParams.push(status);
      }

      if (searchQuery) {
        conditions.push('(id LIKE ? OR square_payment_id LIKE ?)');
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
        countParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
      }

      if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        query += whereClause;
        countQuery += whereClause;
      }

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [transactionsResult, countResult] = await Promise.all([
        env.PUPPIES_DB.prepare(query).bind(...params).all(),
        env.PUPPIES_DB.prepare(countQuery).bind(...countParams).first()
      ]);

      const total = (countResult as any)?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return new Response(JSON.stringify({
        transactions: transactionsResult.results,
        currentPage: page,
        totalPages,
        totalTransactions: total,
        limit
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  });
};
