import { execSync } from 'node:child_process';

const hasDbUrl = Boolean(process.env.DATABASE_URL);

if (hasDbUrl) {
  console.log('[build] DATABASE_URL detected. Running: prisma db push');
  try {
    execSync('npx prisma db push --schema prisma/schema.prisma', { stdio: 'inherit' });
  } catch (err) {
    console.error('[build] prisma db push failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
} else {
  console.log('[build] DATABASE_URL not set. Skipping prisma db push.');
}
