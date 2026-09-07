import prisma from "../lib/prisma.js";
import {
    ReportStatus,
    ReviewAction,
    TaskPriority,
    TaskStatus
} from "../../generated/prisma/enums.js";

interface TaskCompletedInput {
    taskName: string;
    priority: TaskPriority;
    plannedPercentage: number;
    actualPercentage: number;
    status: TaskStatus;
    plannedHours: number;
    spentHours: number;
    deliverable?: string;
}

interface NextWeekTaskInput {
    taskName: string;
    description?: string;
}

interface BlockerInput {
    description: string;
    isKeyIssue?: boolean;
}

interface AchievementInput {
    description: string;
    isKeyAchievement?: boolean;
}

interface HoursInput {
    development?: number;
    testing?: number;
    meetings?: number;
    documentation?: number;
    other?: number;
}

interface CreateReportInput {
    userId: number;
    projectId: number;
    weekStart: Date;
    weekEnd: Date;
    tasksCompleted?: TaskCompletedInput[];
    nextWeekTasks?: NextWeekTaskInput[];
    blockers?: BlockerInput[];
    achievements?: AchievementInput[];
    hours?: HoursInput;
}

interface UpdateReportInput {
    tasksCompleted?: TaskCompletedInput[];
    nextWeekTasks?: NextWeekTaskInput[];
    blockers?: BlockerInput[];
    achievements?: AchievementInput[];
    hours?: HoursInput;
}

export const createReport = async ({
    userId,
    projectId,
    weekStart,
    weekEnd,
    tasksCompleted = [],
    nextWeekTasks = [],
    blockers = [],
    achievements = [],
    hours
}: CreateReportInput) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw new Error("Project not found");
    }

    if (!project.isActive) {
        throw new Error("Cannot create a report against an inactive project");
    }

    const existingReport = await prisma.report.findUnique({
        where: {
            userId_weekStart: {
                userId,
                weekStart
            }
        }
    });

    if (existingReport) {
        throw new Error("A report for this week already exists");
    }

    const keyIssueCount = blockers.filter((b) => b.isKeyIssue).length;

    if (keyIssueCount > 1) {
        throw new Error("Only one blocker can be flagged as the key issue");
    }

    const keyAchievementCount = achievements.filter((a) => a.isKeyAchievement).length;

    if (keyAchievementCount > 1) {
        throw new Error("Only one achievement can be flagged as the key achievement");
    }

    const hasHours =
        !!hours &&
        (hours.development ?? 0) +
        (hours.testing ?? 0) +
        (hours.meetings ?? 0) +
        (hours.documentation ?? 0) +
        (hours.other ?? 0) > 0;

    const totalHours = hasHours
        ? (hours!.development ?? 0) +
        (hours!.testing ?? 0) +
        (hours!.meetings ?? 0) +
        (hours!.documentation ?? 0) +
        (hours!.other ?? 0)
        : 0;

    return prisma.$transaction(async (tx) => {
        const report = await tx.report.create({
            data: {
                userId,
                projectId,
                weekStart,
                weekEnd,
                status: ReportStatus.DRAFT
            }
        });

        const version = await tx.reportVersion.create({
            data: {
                reportId: report.id,
                versionNumber: 1
            }
        });

        if (tasksCompleted.length) {
            await tx.reportVersionTask.createMany({
                data: tasksCompleted.map((task, index) => ({
                    reportVersionId: version.id,
                    ...task,
                    sortOrder: index
                }))
            });
        }

        if (nextWeekTasks.length) {
            await tx.reportVersionNextTask.createMany({
                data: nextWeekTasks.map((task, index) => ({
                    reportVersionId: version.id,
                    ...task,
                    sortOrder: index
                }))
            });
        }

        if (blockers.length) {
            await tx.reportVersionBlocker.createMany({
                data: blockers.map((blocker, index) => ({
                    reportVersionId: version.id,
                    ...blocker,
                    sortOrder: index
                }))
            });
        }

        if (achievements.length) {
            await tx.reportVersionAchievement.createMany({
                data: achievements.map((achievement, index) => ({
                    reportVersionId: version.id,
                    ...achievement,
                    sortOrder: index
                }))
            });
        }

        if (hasHours) {
            await tx.reportVersionHours.create({
                data: {
                    reportVersionId: version.id,
                    ...hours,
                    totalHours
                }
            });
        }

        return tx.report.findUniqueOrThrow({
            where: { id: report.id },
            include: {
                versions: {
                    include: {
                        tasks: true,
                        nextTasks: true,
                        blockers: true,
                        achievements: true,
                        hours: true
                    }
                }
            }
        });
    });
};


export const submitReport = async (
    reportId: number,
    userId: number,
    correctionData: UpdateReportInput = {}
) => {
    const report = await prisma.report.findUnique({
        where: { id: reportId }
    });

    if (!report) {
        throw new Error("Report not found");
    }

    if (report.userId !== userId) {
        throw new Error("You can only submit your own reports");
    }

    if (
        report.status !== ReportStatus.DRAFT &&
        report.status !== ReportStatus.NEEDS_CORRECTION
    ) {
        throw new Error(`Cannot submit a report with status ${report.status}`);
    }

    if (
        report.status === ReportStatus.NEEDS_CORRECTION &&
        Object.keys(correctionData).length > 0
    ) {
        await saveReportData(
            reportId,
            userId,
            correctionData,
            ReportStatus.NEEDS_CORRECTION
        );
    }

    const version = await prisma.reportVersion.findFirst({
        where: { reportId },
        orderBy: { versionNumber: "desc" },
        include: {
            tasks: true,
            nextTasks: true
        }
    });

    if (!version) {
        throw new Error("Report has no version to submit");
    }

    if (version.tasks.length === 0) {
        throw new Error("Add at least one completed task before submitting");
    }

    if (version.nextTasks.length === 0) {
        throw new Error("Add at least one task planned for next week before submitting");
    }

    const [, updatedReport] = await prisma.$transaction([
        prisma.reportVersion.update({
            where: { id: version.id },
            data: { submittedAt: new Date() }
        }),
        prisma.report.update({
            where: { id: reportId },
            data: { status: ReportStatus.SUBMITTED },
            include: {
                versions: {
                    where: { id: version.id },
                    include: {
                        tasks: true,
                        nextTasks: true,
                        blockers: true,
                        achievements: true,
                        hours: true
                    }
                }
            }
        })
    ]);

    return updatedReport;
};

const reportVersionInclude = {
    tasks: true,
    nextTasks: true,
    blockers: true,
    achievements: true,
    hours: true
} as const;

const cloneReportVersion = async (
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    sourceVersion: {
        reportId: number;
        tasks: Array<{
            id: number;
            reportVersionId: number;
            taskName: string;
            priority: TaskPriority;
            plannedPercentage: number;
            actualPercentage: number;
            status: TaskStatus;
            plannedHours: number;
            spentHours: number;
            deliverable: string | null;
            sortOrder: number;
        }>;
        nextTasks: Array<{
            id: number;
            reportVersionId: number;
            taskName: string;
            description: string | null;
            sortOrder: number;
        }>;
        blockers: Array<{
            id: number;
            reportVersionId: number;
            description: string;
            isKeyIssue: boolean;
            sortOrder: number;
        }>;
        achievements: Array<{
            id: number;
            reportVersionId: number;
            description: string;
            isKeyAchievement: boolean;
            sortOrder: number;
        }>;
        hours: {
            id: number;
            reportVersionId: number;
            development: number;
            testing: number;
            meetings: number;
            documentation: number;
            other: number;
            totalHours: number;
        } | null;
    },
    versionNumber: number
) => {
    const version = await tx.reportVersion.create({
        data: {
            reportId: sourceVersion.reportId,
            versionNumber
        }
    });

    if (sourceVersion.tasks.length) {
        await tx.reportVersionTask.createMany({
            data: sourceVersion.tasks.map(({ id, reportVersionId, ...task }) => ({
                ...task,
                reportVersionId: version.id
            }))
        });
    }

    if (sourceVersion.nextTasks.length) {
        await tx.reportVersionNextTask.createMany({
            data: sourceVersion.nextTasks.map(({ id, reportVersionId, ...task }) => ({
                ...task,
                reportVersionId: version.id
            }))
        });
    }

    if (sourceVersion.blockers.length) {
        await tx.reportVersionBlocker.createMany({
            data: sourceVersion.blockers.map(({ id, reportVersionId, ...blocker }) => ({
                ...blocker,
                reportVersionId: version.id
            }))
        });
    }

    if (sourceVersion.achievements.length) {
        await tx.reportVersionAchievement.createMany({
            data: sourceVersion.achievements.map(({ id, reportVersionId, ...achievement }) => ({
                ...achievement,
                reportVersionId: version.id
            }))
        });
    }

    if (sourceVersion.hours) {
        const { id, reportVersionId, ...hours } = sourceVersion.hours;
        await tx.reportVersionHours.create({
            data: {
                ...hours,
                reportVersionId: version.id
            }
        });
    }

    return version;
};

const saveReportData = async (
    reportId: number,
    userId: number,
    data: UpdateReportInput,
    requiredStatus: ReportStatus
) => {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true, userId: true, status: true }
    });

    if (!report) {
        throw new Error("Report not found");
    }

    if (report.userId !== userId) {
        throw new Error("You can only update your own reports");
    }

    if (report.status !== requiredStatus) {
        throw new Error(
            requiredStatus === ReportStatus.DRAFT
                ? "Only draft reports can be updated"
                : "Only reports needing correction can be updated"
        );
    }

    if (data.blockers && data.blockers.filter((blocker) => blocker.isKeyIssue).length > 1) {
        throw new Error("Only one blocker can be flagged as the key issue");
    }

    if (
        data.achievements &&
        data.achievements.filter((achievement) => achievement.isKeyAchievement).length > 1
    ) {
        throw new Error("Only one achievement can be flagged as the key achievement");
    }

    return prisma.$transaction(async (tx) => {
        const version = await tx.reportVersion.findFirstOrThrow({
            where: { reportId },
            orderBy: { versionNumber: "desc" }
        });

        if (data.tasksCompleted !== undefined) {
            await tx.reportVersionTask.deleteMany({ where: { reportVersionId: version.id } });
            await tx.reportVersionTask.createMany({
                data: data.tasksCompleted.map((task, index) => ({
                    reportVersionId: version.id,
                    ...task,
                    sortOrder: index
                }))
            });
        }

        if (data.nextWeekTasks !== undefined) {
            await tx.reportVersionNextTask.deleteMany({ where: { reportVersionId: version.id } });
            await tx.reportVersionNextTask.createMany({
                data: data.nextWeekTasks.map((task, index) => ({
                    reportVersionId: version.id,
                    ...task,
                    sortOrder: index
                }))
            });
        }

        if (data.blockers !== undefined) {
            await tx.reportVersionBlocker.deleteMany({ where: { reportVersionId: version.id } });
            await tx.reportVersionBlocker.createMany({
                data: data.blockers.map((blocker, index) => ({
                    reportVersionId: version.id,
                    ...blocker,
                    sortOrder: index
                }))
            });
        }

        if (data.achievements !== undefined) {
            await tx.reportVersionAchievement.deleteMany({ where: { reportVersionId: version.id } });
            await tx.reportVersionAchievement.createMany({
                data: data.achievements.map((achievement, index) => ({
                    reportVersionId: version.id,
                    ...achievement,
                    sortOrder: index
                }))
            });
        }

        if (data.hours !== undefined) {
            await tx.reportVersionHours.deleteMany({ where: { reportVersionId: version.id } });
            const totalHours = Object.values(data.hours).reduce(
                (total, value) => total + (value ?? 0),
                0
            );

            if (totalHours > 0) {
                await tx.reportVersionHours.create({
                    data: {
                        reportVersionId: version.id,
                        ...data.hours,
                        totalHours
                    }
                });
            }
        }

        return tx.report.findUniqueOrThrow({
            where: { id: reportId },
            include: {
                versions: {
                    include: reportVersionInclude
                }
            }
        });
    });
};

export const updateDraftReport = async (
    reportId: number,
    userId: number,
    data: UpdateReportInput
) => saveReportData(reportId, userId, data, ReportStatus.DRAFT);

export const reviewReport = async (
    reportId: number,
    reviewerId: number,
    action: ReviewAction,
    comment?: string
) => {
    return prisma.$transaction(async (tx) => {
        const report = await tx.report.findUnique({
            where: { id: reportId },
            include: {
                versions: {
                    orderBy: { versionNumber: "desc" },
                    take: 1,
                    include: reportVersionInclude
                }
            }
        });

        if (!report) {
            throw new Error("Report not found");
        }

        if (report.status !== ReportStatus.SUBMITTED) {
            throw new Error("Only submitted reports can be reviewed");
        }

        const currentVersion = report.versions[0];

        if (!currentVersion) {
            throw new Error("Report has no version to review");
        }

        if (action === ReviewAction.REQUESTED_CHANGES) {
            await cloneReportVersion(tx, currentVersion, currentVersion.versionNumber + 1);
        }

        await tx.reportReview.create({
            data: {
                reportId,
                reportVersionId: currentVersion.id,
                reviewerId,
                action,
                comment: comment ?? null
            }
        });

        return tx.report.update({
            where: { id: reportId },
            data: {
                status:
                    action === ReviewAction.APPROVED
                        ? ReportStatus.APPROVED
                        : ReportStatus.NEEDS_CORRECTION
            },
            include: {
                versions: {
                    include: reportVersionInclude
                }
            }
        });
    });
};


export const deleteDraftReport = async (reportId: number, userId: number) => {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: {
            id: true,
            userId: true,
            status: true
        }
    });

    if (!report) {
        throw new Error("Report not found");
    }

    if (report.userId !== userId) {
        throw new Error("Report does not belong to this user");
    }

    if (report.status !== ReportStatus.DRAFT) {
        throw new Error("Only draft reports can be deleted");
    }

    await prisma.report.delete({
        where: { id: reportId }
    });
};

export const forceDeleteReport = async (reportId: number) => {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: { id: true }
    });

    if (!report) {
        throw new Error("Report not found");
    }

    await prisma.report.delete({
        where: { id: reportId }
    });
};