import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

async function isSuperAdmin(req: Request): Promise<boolean> {
  return req.headers.get("x-user-role") === "SA";
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      deal: { include: { company: { include: { org: { include: { settings: true } } } } } },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const superAdmin = await isSuperAdmin(req);
  const allowOverride = task.deal?.company?.org?.settings?.allowSADeletes ?? false;

  // If task is not completed, deletion requires Super Admin + OrgSettings override
  if (task.status !== "completed" && !(superAdmin && allowOverride)) {
    return NextResponse.json(
      { error: "Cannot delete active task unless completed (SA override not allowed)" },
      { status: 403 }
    );
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ success: true, override: superAdmin && allowOverride });
}
