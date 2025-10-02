import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = process.env.AWS_BUCKET;

const s3 = new S3Client({ region: REGION });

export async function s3Upload(key: string, fileBuffer: Uint8Array | ArrayBuffer) {
  if (!BUCKET) throw new Error("AWS_BUCKET not configured");
  const body = fileBuffer instanceof Uint8Array ? Buffer.from(fileBuffer) : Buffer.from(new Uint8Array(fileBuffer as ArrayBuffer));

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: "application/pdf",
  });

  await s3.send(cmd);

  // Return public URL (assuming public bucket or appropriate CDN in front)
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(key)}`;
}
