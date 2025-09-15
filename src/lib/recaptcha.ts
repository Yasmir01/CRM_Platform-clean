const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY || '';

export async function verifyRecaptcha(token?: string, remoteip?: string) {
  if (!RECAPTCHA_SECRET) {
    // dev mode: pass-through but warn
    // eslint-disable-next-line no-console
    console.warn('RECAPTCHA_SECRET_KEY is not set — skipping captcha verification (dev only).');
    return { success: true, score: 1.0, action: null, error: 'no-secret' };
  }
  if (!token) return { success: false, error: 'missing-token' };

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET);
    params.append('response', token);
    if (remoteip) params.append('remoteip', remoteip);

    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const json = await resp.json();
    return json;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('recaptcha verify error', e);
    return { success: false, error: 'verify-failed' };
  }
}
