import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { decrypt, encrypt } from "../utils/crypto";
import { qbRefresh } from "./providers/quickbooks";

const prisma = new PrismaClient();

export async function getQBClient(orgId: string) {
  const acc = await prisma.integrationAccount.findFirstOrThrow({
    where: { organizationId: orgId, provider: "QUICKBOOKS" },
  });
  if (!acc.accessTokenEnc) throw new Error("No QB access token");

  let accessToken = decrypt(acc.accessTokenEnc);
  const expiresAt = acc.expiresAt ? new Date(acc.expiresAt).getTime() : 0;

  if (Date.now() > expiresAt - 60_000 && acc.refreshTokenEnc) {
    const tokens = await qbRefresh(decrypt(acc.refreshTokenEnc));
    accessToken = tokens.access_token;
    await prisma.integrationAccount.update({
      where: { id: acc.id },
      data: {
        accessTokenEnc: encrypt(accessToken),
        refreshTokenEnc: tokens.refresh_token ? encrypt(tokens.refresh_token) : acc.refreshTokenEnc,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : acc.expiresAt,
      },
    });
  }

  if (!acc.displayName?.startsWith("realm:")) throw new Error("No QuickBooks realmId set");
  const realmId = acc.displayName.replace("realm:", "");
  const base = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}`;

  const client = axios.create({
    baseURL: base,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return client;
}
