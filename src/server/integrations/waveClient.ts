import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { decrypt, encrypt } from "../utils/crypto";
import { waveRefresh } from "./providers/wave";

const prisma = new PrismaClient();

export async function getWaveClient(orgId: string) {
  const acc = await prisma.integrationAccount.findFirstOrThrow({
    where: { organizationId: orgId, provider: "WAVE" },
  });
  if (!acc.accessTokenEnc) throw new Error("No Wave access token");

  let accessToken = decrypt(acc.accessTokenEnc);
  const expiresAt = acc.expiresAt ? new Date(acc.expiresAt).getTime() : 0;

  if (Date.now() > expiresAt - 60_000 && acc.refreshTokenEnc) {
    const tokens = await waveRefresh(decrypt(acc.refreshTokenEnc));
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
    baseURL: "https://gql.waveapps.com/graphql/public",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return client;
}
