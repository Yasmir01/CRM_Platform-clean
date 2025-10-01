import axios from "axios";
import qs from "qs";

const AUTH_BASE = "https://appcenter.intuit.com/connect/oauth2";
const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

export function qbAuthUrl(state: string) {
  const params = qs.stringify({
    client_id: process.env.QB_CLIENT_ID,
    redirect_uri: process.env.QB_REDIRECT_URI,
    response_type: "code",
    scope: (process.env.QB_SCOPES || "").trim(),
    state,
  });
  return `${AUTH_BASE}/connect?${params}`;
}

export async function qbExchange(code: string) {
  const body = qs.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.QB_REDIRECT_URI,
  });
  const auth = Buffer.from(`${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`).toString("base64");
  const res = await axios.post(TOKEN_URL, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${auth}` },
  });
  return res.data as { access_token: string; refresh_token: string; expires_in: number; x_refresh_token_expires_in?: number };
}

export async function qbRefresh(refreshToken: string) {
  const body = qs.stringify({ grant_type: "refresh_token", refresh_token: refreshToken });
  const auth = Buffer.from(`${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`).toString("base64");
  const res = await axios.post(TOKEN_URL, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${auth}` },
  });
  return res.data as { access_token: string; refresh_token?: string; expires_in: number };
}
