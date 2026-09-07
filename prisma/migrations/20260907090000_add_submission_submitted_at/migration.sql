-- Add the request-start timestamp without losing existing submission history.
ALTER TABLE "Submission" ADD COLUMN "submittedAt" TIMESTAMP(3);

UPDATE "Submission"
SET "submittedAt" = "createdAt"
WHERE "submittedAt" IS NULL;

ALTER TABLE "Submission" ALTER COLUMN "submittedAt" SET NOT NULL;