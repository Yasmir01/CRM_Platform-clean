import axios from "axios";
import qs from "qs";

// Replace AUTH/TOKEN endpoints with Wave OAuth endpoints when ready:
const AUTH_URL = "https://api.waveplaceholder.com/oauth/authorize";
const TOKEN_URL = "https://api.waveplaceholder.com/oauth/token";

export function waveAuthUrl(state: string) {
  const params = qs.stringify({
    client_id: process.env.WAVE_CLIENT_ID,
    redirect_uri: process.env.WAVE_REDIRECT_URI,
    response_type: "code",
    scope: (process.env.WAVE_SCOPES || "").trim(),
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export async function waveExchange(code: string) {
  const body = qs.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.WAVE_REDIRECT_URI,
    client_id: process.env.WAVE_CLIENT_ID,
    client_secret: process.env.WAVE_CLIENT_SECRET,
  });
  const res = await axios.post(TOKEN_URL, body, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  return res.data as { access_token: string; refresh_token: string; expires_in: number; token_type: string };
}

export async function waveRefresh(refreshToken: string) {
  const body = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.WAVE_CLIENT_ID,
    client_secret: process.env.WAVE_CLIENT_SECRET,
  });
  const res = await axios.post(TOKEN_URL, body, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  return res.data as { access_token: string; refresh_token?: string; expires_in: number; token_type: string };
}
