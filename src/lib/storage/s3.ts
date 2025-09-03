import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-east-1';
const s3 = new S3Client({ region });

export async function putBufferToS3(buffer: Uint8Array, key: string, contentType = 'application/pdf') {
  const bucket = process.env.S3_BUCKET || process.env.AWS_BUCKET;
  if (!bucket) throw new Error('S3_BUCKET/AWS_BUCKET not configured');
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: contentType,
  }));
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}
