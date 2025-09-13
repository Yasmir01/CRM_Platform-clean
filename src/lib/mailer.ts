import nodemailer from 'nodemailer';

const HOST = process.env.EMAIL_HOST || process.env.SMTP_HOST || '';
const PORT = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
const USER = process.env.EMAIL_USER || process.env.SMTP_USER || '';
const PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || '';
const FROM = process.env.EMAIL_FROM || (USER ? `"MyCRM Reports" <${USER}>` : '"MyCRM Reports" <noreply@localhost>');

export const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: PORT === 465, // true for 465, false for other ports
  auth: USER ? { user: USER, pass: PASS } : undefined,
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  try {
    await transporter.sendMail({
      from: FROM,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      text,
      html,
      attachments,
    });
    console.log(`✅ Email sent to ${Array.isArray(to) ? to.join(',') : to}`);
  } catch (err) {
    console.error('❌ Email error:', err);
    throw err;
  }
}

// Backwards compatibility helpers used across the codebase
export async function sendMail(to: string[], subject: string, text: string, attachments?: any[]) {
  return sendEmail({ to, subject, text, attachments });
}

export async function sendHtmlMail(to: string[], subject: string, html: string, attachments?: any[]) {
  return sendEmail({ to, subject, text: html, html, attachments });
}
