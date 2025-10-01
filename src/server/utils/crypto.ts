import crypto from "crypto";

const PREFIX = "v1:";

function getKey(): Buffer {
  const raw = process.env.TOKENS_ENC_KEY || "";
  if (!raw.startsWith("base64:")) throw new Error("TOKENS_ENC_KEY must start with base64:");
  const b64 = raw.replace(/^base64:/, "");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) throw new Error("TOKENS_ENC_KEY must decode to 32 bytes");
  return key;
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(payload: string): string {
  if (!payload.startsWith(PREFIX)) throw new Error("Bad token");
  const raw = Buffer.from(payload.slice(PREFIX.length), "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
