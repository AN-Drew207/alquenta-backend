-- Hand-written, same reason as the other migrations since 20260814120000 —
-- see api/CLAUDE.md's "Migraciones y drift del historial". Applied via
-- `prisma migrate deploy`, not `migrate dev`.

-- CreateEnum
CREATE TYPE "PropertyAnalyticsEventType" AS ENUM ('VIEW', 'WHATSAPP_REVEAL', 'MESSAGE_STARTED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'UNKNOWN');

-- CreateTable
CREATE TABLE "PropertyAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "PropertyAnalyticsEventType" NOT NULL,
    "deviceType" "DeviceType",
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyAnalyticsEvent_propertyId_type_occurredAt_idx" ON "PropertyAnalyticsEvent"("propertyId", "type", "occurredAt");

-- AddForeignKey
ALTER TABLE "PropertyAnalyticsEvent" ADD CONSTRAINT "PropertyAnalyticsEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
