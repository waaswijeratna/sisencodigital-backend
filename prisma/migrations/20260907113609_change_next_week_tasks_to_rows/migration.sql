-- DropIndex
DROP INDEX "ReportVersionNextTask_reportVersionId_key";

-- Add the new columns as nullable while the existing JSON rows are expanded.
ALTER TABLE "ReportVersionNextTask"
ADD COLUMN "description" TEXT,
ADD COLUMN "sortOrder" INTEGER,
ADD COLUMN "taskName" TEXT;

CREATE TEMP TABLE "_ReportVersionNextTaskLegacy" AS
SELECT "reportVersionId", "tasks"
FROM "ReportVersionNextTask";

DELETE FROM "ReportVersionNextTask";

INSERT INTO "ReportVersionNextTask" ("reportVersionId", "taskName", "description", "sortOrder")
SELECT
  legacy."reportVersionId",
  task->>'taskName',
  task->>'description',
  (task_index - 1)::INTEGER
FROM "_ReportVersionNextTaskLegacy" AS legacy
CROSS JOIN LATERAL jsonb_array_elements(legacy."tasks") WITH ORDINALITY AS expanded(task, task_index);

DROP TABLE "_ReportVersionNextTaskLegacy";

ALTER TABLE "ReportVersionNextTask"
DROP COLUMN "tasks",
ALTER COLUMN "sortOrder" SET NOT NULL,
ALTER COLUMN "taskName" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ReportVersionNextTask_reportVersionId_idx" ON "ReportVersionNextTask"("reportVersionId");
