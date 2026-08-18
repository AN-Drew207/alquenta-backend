-- Hand-written, same reason as the other migrations since 20260814120000 —
-- see api/CLAUDE.md's "Migraciones y drift del historial" for the full
-- explanation. Applied via `prisma migrate deploy`, not `migrate dev`.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
