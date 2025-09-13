// src/lib/recaptcha.ts
export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) {
    console.warn('RECAPTCHA_SECRET not set, skipping verification');
    return true;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();
    // Accept if success and score > 0.5 (when provided)
    return data.success && (data.score ? data.score > 0.5 : true);
  } catch (err) {
    console.error('ReCAPTCHA verification failed', err);
    return false;
  }
}
