// Lightweight safeFetch with XMLHttpRequest fallback for environments where fetch may be unreliable.
// Returns a Response-like object or null on failure.

type AnyRecord = Record<string, any>;

export async function safeFetch(input: RequestInfo, init: RequestInit = {}): Promise<any | null> {
  const fn = (globalThis as any).fetch;
  if (fn && typeof fn === 'function') {
    try {
      // Use native fetch but fall back to XHR on runtime error or rejected promise
      // Ensure we return a promise that resolves to a Response-like object or null
      return await fn.call(globalThis, input, init).catch(() => xhrFallback(input, init));
    } catch {
      return xhrFallback(input, init);
    }
  }
  return xhrFallback(input, init);
}

function xhrFallback(input: RequestInfo, init: RequestInit = {}) {
  return new Promise<any>((resolve) => {
    try {
      const url = typeof input === 'string' ? input : String(input);
      const xhr = new XMLHttpRequest();
      const method = (init && (init as any).method) || 'GET';
      xhr.open(method, url, true);

      if ((init as any).credentials === 'include') xhr.withCredentials = true;
      const headers = (init && (init as any).headers) || {};
      if (headers && typeof headers === 'object') {
        Object.keys(headers).forEach((k) => {
          try { xhr.setRequestHeader(k, (headers as AnyRecord)[k]); } catch (e) { /* ignore */ }
        });
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        const ok = xhr.status >= 200 && xhr.status < 300;
        const responseText = xhr.responseText;
        const resLike: any = {
          ok,
          status: xhr.status,
          text: () => Promise.resolve(responseText),
          json: () => {
            try {
              return Promise.resolve(responseText ? JSON.parse(responseText) : {});
            } catch {
              return Promise.resolve({});
            }
          },
        };
        resolve(resLike);
      };

      xhr.onerror = () => resolve(null);
      xhr.ontimeout = () => resolve(null);
      if ((init as any).timeout) xhr.timeout = (init as any).timeout;

      const body = (init as any).body ?? null;
      xhr.send(body);
    } catch {
      resolve(null);
    }
  });
}
