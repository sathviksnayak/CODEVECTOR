-- Reconciliation migration for the existing out-of-band Problem.tags column.
-- This migration must be marked as applied with prisma migrate resolve.
ALTER TABLE "Problem" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];