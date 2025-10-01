import axios from "axios";
import qs from "qs";

const AUTH_URL = "https://login.xero.com/identity/connect/authorize";
const TOKEN_URL = "https://identity.xero.com/connect/token";

export function xeroAuthUrl(state: string) {
  const params = qs.stringify({
    client_id: process.env.XERO_CLIENT_ID,
    redirect_uri: process.env.XERO_REDIRECT_URI,
    response_type: "code",
    scope: (process.env.XERO_SCOPES || "").trim(),
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export async function xeroExchange(code: string) {
  const body = qs.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.XERO_REDIRECT_URI,
  });
  const auth = Buffer.from(`${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`).toString("base64");
  const res = await axios.post(TOKEN_URL, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${auth}` },
  });
  return res.data as { access_token: string; refresh_token: string; expires_in: number; token_type: string };
}

export async function xeroRefresh(refreshToken: string) {
  const body = qs.stringify({ grant_type: "refresh_token", refresh_token: refreshToken });
  const auth = Buffer.from(`${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`).toString("base64");
  const res = await axios.post(TOKEN_URL, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${auth}` },
  });
  return res.data as { access_token: string; refresh_token?: string; expires_in: number; token_type: string };
}
