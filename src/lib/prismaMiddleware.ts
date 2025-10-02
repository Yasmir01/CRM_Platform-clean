// src/lib/prismaMiddleware.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { getSessionFromContext } from './sessionContext';

export function applyRoleBasedMiddleware(prisma: PrismaClient) {
  prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
    // Try to get session stored in context for the current request
    const session = getSessionFromContext();
    // If no session, skip role-based scoping (allow background jobs/admin scripts)
    if (!session || !session.user) {
      return next(params);
    }

    const user = session.user as any;
    const roleRaw = user.role || (Array.isArray(user.roles) ? user.roles[0] : undefined) || 'SUBSCRIBER';
    const role = String(roleRaw || '').toLowerCase();
    const companyId = user.companyId || user.subscriberId || user.orgId || null;

    // admins / super-admin should have full access
    if (role === 'admin' || role === 'super_admin' || role === 'superadmin' || role === 'super-admin') {
      return next(params);
    }

    // Apply scoping for subscribers
    if (role === 'subscriber' || role === 'user' || role === 'member') {
      const modelsToScope = new Set(['Company', 'Contact', 'Deal', 'ServiceProvider', 'Property', 'Tenant', 'Application']);
      const model = params.model as string | undefined;

      if (model && modelsToScope.has(model)) {
        // For read operations
        if (params.action === 'findMany') {
          params.args = params.args || {};
          params.args.where = {
            ...(params.args.where || {}),
            companyId: companyId,
          };
        }

        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.args = params.args || {};
          params.args.where = {
            ...(params.args.where || {}),
            companyId: companyId,
          };
        }

        // For write operations, ensure companyId is set on create/update
        if (params.action === 'create') {
          params.args = params.args || {};
          params.args.data = {
            ...(params.args.data || {}),
            companyId: companyId,
          };
        }

        if (params.action === 'update' || params.action === 'updateMany') {
          // If update includes where, ensure it is scoped
          params.args = params.args || {};
          if (params.args.where) {
            params.args.where = {
              ...(params.args.where || {}),
              companyId: companyId,
            };
          }
          // Also, if data attempts to change companyId, force it back
          params.args.data = {
            ...(params.args.data || {}),
            companyId: companyId,
          };
        }

        if (params.action === 'delete' || params.action === 'deleteMany') {
          params.args = params.args || {};
          if (params.args.where) {
            params.args.where = {
              ...(params.args.where || {}),
              companyId: companyId,
            };
          }
        }
      }
    }

    return next(params);
  });
}
