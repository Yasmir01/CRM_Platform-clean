import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "url";

const prisma = new PrismaClient();

export async function syncAllProviders(organizationId: string) {
  const integrations = await prisma.integrationAccount.findMany({ where: { organizationId, enabled: true } });
  for (const acc of integrations) {
    await prisma.syncLog.create({
      data: {
        organizationId,
        integrationId: acc.id,
        scope: "payments",
        status: "success",
        itemCount: 3,
        message: `Scheduled sync stub for ${acc.provider}`,
      },
    });
  }
  return integrations.length;
}

const isMain = (() => {
  try {
    const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
    return import.meta.url === entry;
  } catch {
    return false;
  }
})();

if (isMain) {
  (async () => {
    try {
      const n = await syncAllProviders("demo-org");
      // eslint-disable-next-line no-console
      console.log("Synced providers:", n);
      process.exit(0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    }
  })();
}
