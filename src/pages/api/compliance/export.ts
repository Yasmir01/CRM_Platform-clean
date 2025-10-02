import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch data
    const impersonations = await prisma.imprLog.findMany({
      include: { superAdmin: true, subscriber: true },
    });

    const subscriptions = await prisma.subscription.findMany({
      include: { organization: true },
    });

    const history = await prisma.history.findMany({
      include: { actor: true, organization: true },
    });

    // Transform to JSON arrays
    const impersonationData = impersonations.map((log) => ({
      ID: log.id,
      SuperAdmin: log.superAdmin?.email ?? "",
      Organization: log.subscriber?.name ?? "",
      Started: log.startedAt,
      Ended: log.endedAt ?? "",
      AlertSent: log.alertSent,
    }));

    const subscriptionData = subscriptions.map((sub) => ({
      ID: sub.id,
      Organization: sub.organization?.name ?? "",
      Plan: sub.plan,
      Active: sub.active,
      StartDate: sub.startDate,
      EndDate: sub.endDate ?? "",
    }));

    const historyData = history.map((h) => ({
      ID: h.id,
      Organization: h.organization?.name ?? "",
      Actor: h.actor?.email ?? "",
      Action: h.action,
      Date: h.createdAt,
    }));

    // Build Excel workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(impersonationData),
      "ImpersonationLogs"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(subscriptionData),
      "Subscriptions"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(historyData),
      "History"
    );

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Send response
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="compliance_export.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to generate compliance export" });
  }
}
