#!/usr/bin/env bash
set -euo pipefail

# Creates a Prisma migration (create-only) so you can review the SQL before applying.
# Run this locally from the project root.

MIGRATION_NAME=${1:-sync-relations}

echo "Creating prisma migration (create-only) with name: $MIGRATION_NAME"

# Create migration files without applying them to the database
npx prisma migrate dev --name "$MIGRATION_NAME" --create-only

echo "Migration created. Review the files under prisma/migrations and when ready run:"
echo "  npx prisma migrate deploy"

echo "Or to run and apply interactively (dev):"
echo "  npx prisma migrate dev --name $MIGRATION_NAME"
