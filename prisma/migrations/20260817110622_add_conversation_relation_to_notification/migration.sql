-- Hand-written, same reason as 20260814120000_add_first_last_name_and_rename_show_whatsapp:
-- the dev database has pre-existing drift versus migration history (see that
-- migration's header comment for the root cause — earlier schema work applied
-- directly to the DB without a matching migration file, before Prisma Migrate
-- was tracking it). `prisma migrate dev` refuses to proceed without a
-- destructive reset because of that unrelated drift, so this is applied via
-- `prisma migrate deploy` instead (runs pending files in order, no diff/reset).
--
-- The "Notification"."conversationId" column already exists (it was part of
-- that same untracked drift) but was never given a real foreign key, unlike
-- "messageId" on the same table. This migration only adds the missing
-- constraint — it does not touch any data.

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id")
  ON UPDATE CASCADE ON DELETE CASCADE;
