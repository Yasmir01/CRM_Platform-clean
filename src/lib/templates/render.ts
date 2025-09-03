export type LeaseVars = Record<string, string | number | boolean | null | undefined>;

export function renderTemplate(content: string, vars: LeaseVars) {
  return String(content || '').replace(/{{\s*([\w.]+)\s*}}/g, (_m, key) => {
    const v = get(vars, key);
    return escapeHtml(v == null ? '' : String(v));
  });
}

function get(obj: any, path: string) {
  return String(path || '')
    .split('.')
    .reduce((o, k) => (o && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined), obj);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
