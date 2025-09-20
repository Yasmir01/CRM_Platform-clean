// src/services/api.ts
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || ""; // when empty, will use same origin

let authToken: string | null = null;
export function setToken(token: string | null) { authToken = token; }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const base = API_BASE || '';
  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const data = await request<{ ok: boolean; token?: string; user?: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data.user;
  },

  // Contacts
  listContacts() { return request<any[]>('/api/contacts'); },
  getContact(id: string) { return request<any>(`/api/contacts/${id}`); },
  createContact(body: any) { 
    return request('/api/contacts', { method: 'POST', body: JSON.stringify(body) }); 
  },

  // Applications
  listApplications() { return request<any[]>('/api/applications/list'); },
  createApplication(body: any) {
    return request('/api/applications/create', { method: 'POST', body: JSON.stringify(body) });
  },

  // Payments
  initiatePayment(body: { orgId: string; tenantId: string; amountUsd: number }) {
    return request<{ ok: boolean; clientSecret: string }>('/api/payments/initiate', { method: 'POST', body: JSON.stringify(body) });
  },
  checkout(body: { leaseId: string; amountUsd: number }) {
    return request<{ url: string }>('/api/payments/checkout', { method: 'POST', body: JSON.stringify(body) });
  },

  // Accounting
  providers() { return request('/api/accounting/providers'); },
};
