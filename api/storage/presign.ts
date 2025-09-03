import type { VercelRequest, VercelResponse } from "@vercel/node";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { getUserOr401 } from "../../src/utils/authz";
import { rateLimit } from "../../src/utils/rateLimit";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const ip = ((req.headers["x-forwarded-for"] as string) || "").split(",")[0]?.trim() || (req.socket as any).remoteAddress || "unknown";
  const { allowed, remaining } = rateLimit(ip, req.url || "presign", 60, 60_000);
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  if (!allowed) return res.status(429).json({ error: "Too many requests" });

  const user = getUserOr401(req, res);
  if (!user) return;

  const bucket = process.env.S3_BUCKET as string;
  if (!bucket) return res.status(500).json({ error: "S3_BUCKET not set" });

  const { contentType, ext } = (req.body || {}) as { contentType?: string; ext?: string };
  const key = `uploads/${user.sub || user.id}/${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext ? `.${ext.replace(".", "")}` : ""}`;

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType || "application/octet-stream",
    ACL: "private",
    Metadata: { uploadedBy: String(user.sub || user.id) },
  });

  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
  res.status(200).json({ uploadUrl: url, key });
}
