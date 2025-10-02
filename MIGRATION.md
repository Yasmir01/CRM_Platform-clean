Prisma schema was updated to add:

- Company: email, phone, address fields
- ServiceProvider model

To apply these changes to your database locally or in your dev environment, run:

1. Generate Prisma client

   npx prisma generate

2. Create and apply a migration (development):

   npx prisma migrate dev --name add-company-serviceprovider

This will create a new migration and apply it to your database defined in DATABASE_URL.

If you are using a production environment or CI, follow your usual migration process (e.g., prisma migrate deploy).

Notes:
- Ensure DATABASE_URL points to the correct database.
- If you manage database migrations via your deployment pipeline, commit the migration files created by the above command and deploy as usual.
- If you need SQL for manual review, use:

   npx prisma migrate dev --name add-company-serviceprovider --create-only

Then inspect the generated SQL in prisma/migrations/*/migration.sql before applying.
