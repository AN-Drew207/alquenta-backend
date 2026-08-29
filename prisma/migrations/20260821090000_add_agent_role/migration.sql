-- Adds the AGENT role, User.parentAdminId (self-relation "AgencyAgents")
-- and Property.agentId (relation "AgentProperties").
--
-- `ALTER TYPE ... ADD VALUE` cannot be used inside the same transaction it
-- is declared in (Postgres restriction). This migration only declares new
-- columns/FKs without touching existing rows, so running it as a single
-- statement batch via `prisma migrate deploy` (each statement executed
-- sequentially, not wrapped by us in an explicit transaction) is safe.
ALTER TYPE "Role" ADD VALUE 'AGENT';
ALTER TABLE "User" ADD COLUMN "parentAdminId" TEXT;
ALTER TABLE "Property" ADD COLUMN "agentId" TEXT;
CREATE INDEX "User_parentAdminId_idx" ON "User"("parentAdminId");
CREATE INDEX "Property_agentId_idx" ON "Property"("agentId");
ALTER TABLE "User" ADD CONSTRAINT "User_parentAdminId_fkey" FOREIGN KEY ("parentAdminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Property" ADD CONSTRAINT "Property_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
