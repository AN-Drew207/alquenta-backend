-- Alquenta is now B2B-only for real estate agencies: ADMIN accounts no
-- longer represent individual property owners, so reclassify any existing
-- "OWNER" accounts as "AGENCY".
UPDATE "User" SET "accountType" = 'AGENCY' WHERE "accountType" = 'OWNER';
