import fs from "fs";
import path from "path";

export async function saveLeaseFile(file: { buffer: Buffer; originalName: string }) {
  const dir = path.join(process.cwd(), "public", "leases");
  fs.mkdirSync(dir, { recursive: true });
  const safe = `${Date.now()}-${file.originalName.replace(/\s+/g, "_")}`;
  const dest = path.join(dir, safe);
  fs.writeFileSync(dest, file.buffer);
  return { storageKey: `/leases/${safe}`, filename: file.originalName, sizeBytes: fs.statSync(dest).size };
}

export function getSignedLeaseUrl(storageKey: string) {
  return storageKey;
}
