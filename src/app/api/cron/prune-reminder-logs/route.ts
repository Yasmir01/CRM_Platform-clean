<<<<<<< HEAD
import { prisma } from "../../../../api/_db";
=======
import { prisma } from "../../../../pages/api/_db";
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { NextResponse } from "next/server";

export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const res = await prisma.reminderLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return NextResponse.json({ deleted: res.count });
}
