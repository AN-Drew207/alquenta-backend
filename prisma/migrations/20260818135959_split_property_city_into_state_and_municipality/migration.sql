-- Hand-written, same reason as the other migrations since 20260814120000 --
-- see api/CLAUDE.md's "Migraciones y drift del historial". Applied via
-- `prisma migrate deploy`, not `migrate dev`.
--
-- schema.prisma replaced Property.city with the required state/municipality
-- pair, but the split was only ever applied by hand to the dev database
-- (untracked drift) -- no tracked migration created these columns or
-- dropped "city". The next migration (20260818140000, the state/type/
-- operationType/status index) assumes "state" already exists and fails on
-- any database bootstrapped purely from migration history (caught by CI).
--
-- Confirmed with the user (2026-08-29): production has no real Property
-- rows yet, so this needs no data backfill -- state/municipality go
-- straight to NOT NULL and "city" is dropped outright. `IF EXISTS`/
-- `IF NOT EXISTS` keep this a safe no-op on the dev database, where the
-- drift already did this by hand.
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "municipality" TEXT;
ALTER TABLE "Property" ALTER COLUMN "state" SET NOT NULL;
ALTER TABLE "Property" ALTER COLUMN "municipality" SET NOT NULL;
DROP INDEX IF EXISTS "Property_status_type_city_idx";
ALTER TABLE "Property" DROP COLUMN IF EXISTS "city";
