import fs from "fs";
import path from "path";

// Replace this with S3/Cloudflare/GCS SDK later
export async function uploadFileMock(localPath: string): Promise<string> {
  // For now, just simulate an upload by moving to /public/receipts
  const fileName = path.basename(localPath);
  const destDir = path.join(process.cwd(), "public", "receipts");
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, fileName);
  fs.copyFileSync(localPath, dest);
  return `/receipts/${fileName}`; // relative URL served by your app
}
