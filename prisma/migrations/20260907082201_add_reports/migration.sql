-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ReviewAction" AS ENUM ('APPROVED', 'REQUESTED_CHANGES');

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersion" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersionTask" (
    "id" SERIAL NOT NULL,
    "reportVersionId" INTEGER NOT NULL,
    "taskName" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL,
    "plannedPercentage" DOUBLE PRECISION NOT NULL,
    "actualPercentage" DOUBLE PRECISION NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "plannedHours" DOUBLE PRECISION NOT NULL,
    "spentHours" DOUBLE PRECISION NOT NULL,
    "deliverable" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ReportVersionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersionNextTask" (
    "id" SERIAL NOT NULL,
    "reportVersionId" INTEGER NOT NULL,
    "tasks" JSONB NOT NULL,

    CONSTRAINT "ReportVersionNextTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersionBlocker" (
    "id" SERIAL NOT NULL,
    "reportVersionId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isKeyIssue" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ReportVersionBlocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersionAchievement" (
    "id" SERIAL NOT NULL,
    "reportVersionId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isKeyAchievement" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ReportVersionAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVersionHours" (
    "id" SERIAL NOT NULL,
    "reportVersionId" INTEGER NOT NULL,
    "development" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "testing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meetings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "documentation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "other" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ReportVersionHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportReview" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "reportVersionId" INTEGER NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "action" "ReviewAction" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_projectId_idx" ON "Report"("projectId");

-- CreateIndex
CREATE INDEX "Report_weekStart_idx" ON "Report"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "Report_userId_weekStart_key" ON "Report"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "ReportVersion_reportId_versionNumber_key" ON "ReportVersion"("reportId", "versionNumber");

-- CreateIndex
CREATE INDEX "ReportVersionTask_reportVersionId_idx" ON "ReportVersionTask"("reportVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportVersionNextTask_reportVersionId_key" ON "ReportVersionNextTask"("reportVersionId");

-- CreateIndex
CREATE INDEX "ReportVersionBlocker_reportVersionId_idx" ON "ReportVersionBlocker"("reportVersionId");

-- CreateIndex
CREATE INDEX "ReportVersionAchievement_reportVersionId_idx" ON "ReportVersionAchievement"("reportVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportVersionHours_reportVersionId_key" ON "ReportVersionHours"("reportVersionId");

-- CreateIndex
CREATE INDEX "ReportReview_reportId_idx" ON "ReportReview"("reportId");

-- CreateIndex
CREATE INDEX "ReportReview_reportVersionId_idx" ON "ReportReview"("reportVersionId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersion" ADD CONSTRAINT "ReportVersion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersionTask" ADD CONSTRAINT "ReportVersionTask_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES "ReportVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersionNextTask" ADD CONSTRAINT "ReportVersionNextTask_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES "ReportVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersionBlocker" ADD CONSTRAINT "ReportVersionBlocker_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES "ReportVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersionAchievement" ADD CONSTRAINT "ReportVersionAchievement_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES "ReportVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVersionHours" ADD CONSTRAINT "ReportVersionHours_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES "ReportVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES "ReportVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportReview" ADD CONSTRAINT "ReportReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
