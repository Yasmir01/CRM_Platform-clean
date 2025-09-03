import { redactPII } from "./redact";

export function logEvent(event: string, data?: any) {
  const time = new Date().toISOString();
  const safe = data ? redactPII(data) : "";
  // eslint-disable-next-line no-console
  console.log(`[${time}] ${event} ${safe}`);
}
