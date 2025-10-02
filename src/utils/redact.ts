export function redactPII(input: any) {
  const json = typeof input === "string" ? input : JSON.stringify(input);
  return json
    .replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, "***-**-****")
    .replace(/\b\d{12,19}\b/g, "****")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]");
}
