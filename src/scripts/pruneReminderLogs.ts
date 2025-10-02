import { prisma } from "@/lib/prisma";

async function main() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const res = await prisma.reminderLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  console.log("Deleted logs:", res.count);
}

main().catch(e => { console.error(e); process.exit(1); });
