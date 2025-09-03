import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(to: string[], subject: string, text: string, attachments?: any[]) {
  await transporter.sendMail({
    from: `"MyCRM Reports" <${process.env.SMTP_USER}>`,
    to: to.join(','),
    subject,
    text,
    attachments,
  });
}
