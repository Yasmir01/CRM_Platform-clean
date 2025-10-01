import express from "express";
import { PrismaClient, IntegrationProvider } from "@prisma/client";
import { encrypt, decrypt } from "../utils/crypto";
import { qbAuthUrl, qbExchange, qbRefresh } from "./providers/quickbooks";
import { xeroAuthUrl, xeroExchange, xeroRefresh } from "./providers/xero";
import { waveAuthUrl, waveExchange, waveRefresh } from "./providers/wave";
import { syncQuickBooks, syncXero } from "../jobs/syncAccounting";

const prisma = new PrismaClient();
export const router = express.Router();

// Helper: ensure IntegrationAccount row
async function ensureIntegration(organizationId: string, provider: IntegrationProvider) {
  const existed = await prisma.integrationAccount.findFirst({ where: { organizationId, provider } });
  if (existed) return existed;
  return prisma.integrationAccount.create({
    data: { organizationId, provider, enabled: false, displayName: provider },
  });
}

function getOrgId(req: express.Request): string {
  // derive from auth/session in prod; hard-code for dev
  return (req.query.orgId as string) || "demo-org";
}

// Redirect user to provider auth page
router.get("/:provider/connect", async (req, res) => {
  const provider = (req.params.provider || "").toLowerCase();
  const state = `${getOrgId(req)}:${Date.now()}`; // TODO: sign in prod
  let url = "#";
  if (provider === "quickbooks") url = qbAuthUrl(state);
  else if (provider === "xero") url = xeroAuthUrl(state);
  else if (provider === "wave") url = waveAuthUrl(state);
  else return res.status(400).send("Unsupported provider");
  res.redirect(url);
});

// OAuth callback
router.get("/:provider/callback", async (req, res) => {
  try {
    const provider = (req.params.provider || "").toLowerCase();
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");
    const organizationId = state.split(":")[0] || getOrgId(req);

    let tokens: { access_token: string; refresh_token?: string; expires_in?: number };
    if (provider === "quickbooks") tokens = await qbExchange(code);
    else if (provider === "xero") tokens = await xeroExchange(code);
    else if (provider === "wave") tokens = await waveExchange(code);
    else return res.status(400).send("Unsupported provider");

    const acc = await ensureIntegration(organizationId, provider.toUpperCase() as IntegrationProvider);
    const realmId = provider === "quickbooks" ? (req.query.realmId as string | undefined) : undefined;
    await prisma.integrationAccount.update({
      where: { id: acc.id },
      data: {
        enabled: true,
        displayName: realmId ? `realm:${realmId}` : acc.displayName,
        accessTokenEnc: encrypt(tokens.access_token),
        refreshTokenEnc: tokens.refresh_token ? encrypt(tokens.refresh_token) : acc.refreshTokenEnc,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      },
    });

    res.send("Connected! You can close this window and return to the app.");
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("OAuth callback error:", e?.response?.data || e);
    res.status(500).send("OAuth error");
  }
});

// Refresh access token (on-demand)
router.post("/:provider/refresh", async (req, res) => {
  try {
    const provider = (req.params.provider || "").toLowerCase();
    const organizationId = getOrgId(req);
    const acc = await prisma.integrationAccount.findFirstOrThrow({
      where: { organizationId, provider: provider.toUpperCase() as IntegrationProvider },
    });
    if (!acc.refreshTokenEnc) return res.status(400).send("No refresh token");

    const refresh = decrypt(acc.refreshTokenEnc);
    let tokens: { access_token: string; refresh_token?: string; expires_in?: number };
    if (provider === "quickbooks") tokens = await qbRefresh(refresh);
    else if (provider === "xero") tokens = await xeroRefresh(refresh);
    else if (provider === "wave") tokens = await waveRefresh(refresh);
    else return res.status(400).send("Unsupported provider");

    await prisma.integrationAccount.update({
      where: { id: acc.id },
      data: {
        accessTokenEnc: encrypt(tokens.access_token),
        refreshTokenEnc: tokens.refresh_token ? encrypt(tokens.refresh_token) : acc.refreshTokenEnc,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : acc.expiresAt,
      },
    });

    res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Refresh error:", e);
    res.status(500).json({ ok: false });
  }
});

// Manual sync endpoint
router.post("/:provider/sync", async (req, res) => {
  try {
    const provider = (req.params.provider || "").toLowerCase();
    const organizationId = getOrgId(req);
    await prisma.integrationAccount.findFirstOrThrow({
      where: { organizationId, provider: provider.toUpperCase() as IntegrationProvider },
    });

    if (provider === "quickbooks") {
      const result = await syncQuickBooks(organizationId);
      return res.json({ ok: true, provider, ...result });
    }
    if (provider === "xero") {
      const result = await syncXero(organizationId);
      return res.json({ ok: true, provider, ...result });
    }

    // Default stub for other providers
    await prisma.syncLog.create({
      data: {
        organizationId,
        integrationId: (await ensureIntegration(organizationId, provider.toUpperCase() as IntegrationProvider)).id,
        scope: provider,
        status: "success",
        itemCount: 0,
        message: `Manual sync stub for ${provider}`,
      },
    });
    res.json({ ok: true, provider, items: 0 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Sync error:", e);
    res.status(500).json({ ok: false });
  }
});
