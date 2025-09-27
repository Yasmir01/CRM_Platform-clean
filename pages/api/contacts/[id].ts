// pages/api/contacts/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      const contact = await prisma.contact.findUnique({ where: { id } });
      if (!contact) return res.status(404).json({ error: "Contact not found" });
      return res.status(200).json(contact);
    }

    if (req.method === "PUT") {
      const { firstName, lastName, email, phone, companyId } = req.body;
      const updated = await prisma.contact.update({
        where: { id },
        data: { firstName, lastName, email, phone, companyId },
      });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await prisma.contact.delete({ where: { id } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
