-- Hand-written, same reason as the other migrations since 20260814120000 —
-- see api/CLAUDE.md's "Migraciones y drift del historial". Applied via
-- `prisma migrate deploy`, not `migrate dev`.
--
-- Publisher analytics Fase 3 (automatic "no contacts" alerts): adds the
-- ANALYTICS_ALERT notification type plus a nullable Notification.propertyId
-- FK, wired identically to the existing nullable messageId/conversationId
-- columns on the same table. Purely additive — new enum value, new nullable
-- column, new FK, new index — no drops, no data loss risk.
--
-- The ADD VALUE statement below does not get used later in this same file,
-- so it's safe to run inside the transaction `prisma migrate deploy` wraps
-- each migration file in (Postgres only forbids using a freshly-added enum
-- value within the same transaction that added it, not unrelated DDL after
-- it) — same reasoning already relied on by 20260813214939_add_superadmin_role.

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ANALYTICS_ALERT';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "propertyId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Notification_propertyId_type_createdAt_idx" ON "Notification"("propertyId", "type", "createdAt");
