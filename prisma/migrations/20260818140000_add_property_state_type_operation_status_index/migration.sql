-- Hand-written, same reason as the other migrations since 20260814120000 —
-- see api/CLAUDE.md's "Migraciones y drift del historial". Applied via
-- `prisma migrate deploy`, not `migrate dev`.
--
-- Publisher analytics Fase 3 (benchmarking): comparable-listing lookups
-- filter Property by (state, type, operationType, status=AVAILABLE) — this
-- index backs that query. Purely additive, no data changes.

-- CreateIndex
CREATE INDEX "Property_state_type_operationType_status_idx" ON "Property"("state", "type", "operationType", "status");
