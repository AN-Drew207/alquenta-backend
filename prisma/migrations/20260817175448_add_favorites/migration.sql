-- Hand-written, same reason as 20260814120000_add_first_last_name_and_rename_show_whatsapp
-- and 20260817110622_add_conversation_relation_to_notification: the dev
-- database has pre-existing drift versus migration history from before
-- Prisma Migrate was tracking it, so `prisma migrate dev`'s shadow-database
-- diff refuses to proceed (fails replaying an earlier hand-written migration
-- from scratch) without a destructive reset. Applied via `prisma migrate
-- deploy` instead (runs pending files in order, no diff/reset). This
-- migration itself is a clean additive new table, unaffected by the drift.

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_propertyId_key" ON "Favorite"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
