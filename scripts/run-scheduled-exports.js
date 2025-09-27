/* Run: node scripts/run-scheduled-exports.js
   This script finds active ScheduledExport records and runs exports, emailing attachments.
*/
const { prisma } = require('../pages/api/_db');
const { sendEmail } = require('../src/lib/mailer');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

async function generateCsv(history) {
  const fields = ['id', 'action', 'details', 'createdAt', 'user.email', 'user.role', 'subscriber.name'];
  const parser = new Parser({ fields });
  return parser.parse(history);
}

async function generatePdfBuffer(history) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 36 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text('Super Admin Global History', { align: 'center' }).moveDown();

      history.forEach((h) => {
        doc
          .fontSize(12)
          .text(`Action: ${h.action}`)
          .text(`User: ${h.user?.email || 'system'} (${h.user?.role || '-'})`)
          .text(`Subscriber: ${h.subscriber?.name || 'N/A'}`)
          .text(`Time: ${new Date(h.createdAt).toLocaleString()}`)
          .text(`Details: ${h.details || ''}`)
          .moveDown();
      });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function run() {
  try {
    const exports = await prisma.scheduledExport.findMany({ where: { active: true } });
    for (const exp of exports) {
      try {
        // simple: export all history (or could restrict by last run/frequency)
        const history = await prisma.history.findMany({ include: { user: { select: { email: true, role: true } }, subscriber: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });

        if (exp.type === 'CSV') {
          const csv = await generateCsv(history);
          await sendEmail({ to: exp.email, subject: `Scheduled CSV Export (${exp.frequency})`, text: 'Attached is your scheduled export.', attachments: [{ filename: 'history.csv', content: Buffer.from(csv) }] });
        } else if (exp.type === 'PDF') {
          const buf = await generatePdfBuffer(history);
          await sendEmail({ to: exp.email, subject: `Scheduled PDF Export (${exp.frequency})`, text: 'Attached is your scheduled export.', attachments: [{ filename: 'history.pdf', content: buf }] });
        }

        console.log('Scheduled export sent to', exp.email);
      } catch (e) {
        console.error('Failed to run scheduled export', exp.id, e?.message || e);
      }
    }
  } catch (e) {
    console.error('run-scheduled-exports failed', e?.message || e);
  } finally {
    process.exit(0);
  }
}

run();
