-- AlterTable
ALTER TABLE "Property" ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- Backfill: best-effort guess for pre-existing cancelled rows, using their
-- last modification time as a stand-in for when they were cancelled.
UPDATE "Property" SET "cancelledAt" = "updatedAt" WHERE status = 'CANCELLED' AND "cancelledAt" IS NULL;
