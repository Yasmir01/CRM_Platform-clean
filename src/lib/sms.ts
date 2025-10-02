export async function sendSMS(to: string, body: string) {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    return { ok: false, skipped: true, reason: 'Missing Twilio env vars' };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({ From: from, To: to, Body: body });

  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Twilio SMS failed: ${resp.status} ${text}`);
  }

  return resp.json();
}
