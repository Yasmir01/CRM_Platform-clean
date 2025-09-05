export async function sendNotification({ userId, type, title, message }: { userId: string; type: string; title: string; message: string; }) {
  // For now, log & simulate push/email/SMS
  console.log(`[NOTIFY] ${userId} - ${title}: ${message} [${type}]`);
}
