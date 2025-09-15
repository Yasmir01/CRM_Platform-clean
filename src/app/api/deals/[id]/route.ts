import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function isSuperAdmin(req: Request): Promise<boolean> {
  return req.headers.get("x-user-role") === "SA";
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      tasks: true,
      company: { include: { org: { include: { settings: true } } } },
    },
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const superAdmin = await isSuperAdmin(req);
  const allowOverride = deal.company?.org?.settings?.allowSADeletes ?? false;

  if ((deal.tasks?.length ?? 0) > 0) {
    if (!(superAdmin && allowOverride)) {
      return NextResponse.json(
        { error: "Cannot delete deal with active tasks (SA override not allowed)" },
        { status: 403 }
      );
    }

    // SA override → cascade delete tasks
    await prisma.task.deleteMany({ where: { dealId: id } });
  }

  await prisma.deal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
