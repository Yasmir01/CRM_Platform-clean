import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { decrypt, encrypt } from "../utils/crypto";
import { xeroRefresh } from "./providers/xero";

const prisma = new PrismaClient();

export async function getXeroClient(orgId: string) {
  const acc = await prisma.integrationAccount.findFirstOrThrow({
    where: { organizationId: orgId, provider: "XERO" },
  });
  if (!acc.accessTokenEnc) throw new Error("No Xero access token");

  let accessToken = decrypt(acc.accessTokenEnc);
  const expiresAt = acc.expiresAt ? new Date(acc.expiresAt).getTime() : 0;

  if (Date.now() > expiresAt - 60_000 && acc.refreshTokenEnc) {
    const tokens = await xeroRefresh(decrypt(acc.refreshTokenEnc));
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

  const client = axios.create({
    baseURL: "https://api.xero.com/api.xro/2.0",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return client;
}
