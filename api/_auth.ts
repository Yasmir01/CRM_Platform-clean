export function isMutatingMethod(method?: string) {
  return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}

export function isAuthorizedAdmin(req: any) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return true; // if no token configured, allow (development)
  const header = (req.headers?.['x-admin-token'] || req.headers?.['X-Admin-Token'] || '') as string;
  return header === token;
}

export function requireAdminOr403(req: any, res: any) {
  if (!isAuthorizedAdmin(req)) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}
