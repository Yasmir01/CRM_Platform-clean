import { prisma } from "../../../../api/_db";
import { NextResponse } from "next/server";

export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const res = await prisma.reminderLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return NextResponse.json({ deleted: res.count });
}
