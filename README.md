# CRM Platform (Material UI + Vite + Tailwind CSS + Prisma)

![CI](https://github.com/yasmir01/CRM_Platform/actions/workflows/ci.yml/badge.svg)
![Vercel Deploy](https://img.shields.io/github/deployments/yasmir01/CRM_Platform/production?label=vercel&logo=vercel&color=black)
![Node.js](https://img.shields.io/badge/node-22.x-brightgreen?logo=node.js)
![npm](https://img.shields.io/badge/npm-10.x-CB3837?logo=npm)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?logo=prisma)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Overview

This CRM System started as **Material UI + Vite + Tailwind CSS in TypeScript**, and has been extended into a full SaaS-ready CRM platform:

- 📊 **Payment reporting** (PDF / CSV)
- 📧 **Email export + audit logs**
- 🔔 **Real-time notifications** (Pusher)
- 🛠 **Admin / Super Admin dashboards**
- 🎨 **Builder.io integration** with AI-generated enhancements
- 🗄 **Prisma ORM** + PostgreSQL with migrations and seeds

---

## 🚀 Getting Started

### Clone the repo

```bash
git clone https://github.com/yasmir01/CRM_Platform.git
cd CRM_Platform
Install dependencies
bash
Copy code
npm install
Start the dev server
bash
Copy code
npm run dev
Local: http://localhost:3000

🛠 Included Tech
Tailwind CSS + Vite

Material UI (@mui/material, @mui/icons-material, @mui/lab)

Emotion (MUI’s default style engine)

Prisma ORM with PostgreSQL

Builder.io for UI components + AI agent enhancements

Nodemailer, PDFKit, json2csv for exports

Pusher for real-time events

📜 Available Scripts
Script	Description
npm run dev	Starts the Vite development server.
npm run build	Production build (Vercel-friendly, no DB sync).
npm run preview	Preview the production build locally.
npm run build:with-db	Build with Prisma schema sync (prisma db push) before Vite build.
npm run prisma:generate	Generate Prisma client from the schema.
npm run prisma:push	Push schema changes to the database.
npm run prisma:migrate	Run Prisma migrations (dev --name init).
npm run prisma:test	Run custom Prisma test script (prisma/test.ts).
npm run prisma:seed:dev	Seed the database with dev seed data.
npm run prisma:seed:prod	Seed the database with prod seed data.
npm run prisma:seed	Run general seed script.
npm run reset-db	Reset DB: drop, migrate, push schema, generate client, run auto-seed.
npm run seed:auto	Auto-selects seed script (prod vs dev) based on NODE_ENV.
npm run sync	Run local sync helper (sync-push.ps1, Windows only).
npm test	Placeholder test script (currently prints “No tests yet!”).

🌐 Deployment (Vercel)
Vercel automatically runs:

bash
Copy code
npm run build
⚠️ Note: Vercel builds do not push schema changes to the database (serverless limitation).
For schema changes, run locally before pushing:

bash
Copy code
npm run build:with-db
npx prisma migrate deploy
✅ Deployment Checklist
Ensure Builder.io changes are synced → GitHub.

Push commits to main branch (Vercel auto-deploys).

Run local migrations if schema changed:

bash
Copy code
npx prisma migrate deploy
Set required env vars in Vercel:

DATABASE_URL

SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER

NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER

Test /api/test-pusher for real-time events.

Check Vercel logs for build errors.

Verify dashboards, exports, and email reports in production.

🔐 Environment Variables
Example .env file:

env
Copy code
DATABASE_URL=postgresql://user:pass@host:5432/db

# SMTP / Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
SMTP_FROM="CRM Platform <no-reply@crm.com>"

# Pusher
PUSHER_APP_ID=xxxx
PUSHER_KEY=xxxx
PUSHER_SECRET=xxxx
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=xxxx
NEXT_PUBLIC_PUSHER_CLUSTER=us2
📄 License
This project is licensed under the MIT License.
See LICENSE for full terms.

yaml
Copy code
