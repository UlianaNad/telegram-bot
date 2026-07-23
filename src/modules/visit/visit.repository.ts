import { prisma } from "../../database/prisma.js";
import { VisitStatus } from "../../generated/prisma/enums.js";

export async function findActiveOrPendingVisitByChildId(childId: string) {
    return prisma.visit.findFirst({
        where: {
            childId,
            status: { in: [VisitStatus.PENDING, VisitStatus.ACTIVE] },
        },
    });
}

export async function findVisitById(id: string) {
    return prisma.visit.findUnique({ where: { id } });
}

export async function createPendingVisit(data: { childId: string; openedById: string }) {
    return prisma.visit.create({
        data: {
            childId: data.childId,
            openedById: data.openedById,
            status: VisitStatus.PENDING,
        },
    });
}

/**
 * Підтверджує візит (PENDING -> ACTIVE) і одразу переводить дитину
 * в статус "У кімнаті" — в одній транзакції, щоб уникнути неузгодженого
 * стану, якщо друга операція раптом впаде.
 */
export async function confirmVisitAndSetInRoom(visitId: string) {
    return prisma.$transaction(async (tx) => {
        const visit = await tx.visit.update({
            where: { id: visitId },
            data: { status: VisitStatus.ACTIVE },
        });

        await tx.child.update({
            where: { id: visit.childId },
            data: { status: "IN_ROOM" },
        });

        return visit;
    });
}

export async function rejectVisit(visitId: string) {
    return prisma.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.CANCELLED },
    });
}

interface FinishVisitInput {
    visitId: string;
    closedById: string;
    durationMinutes: number;
    priceCents: number;
    isFreeVisit: boolean;
    freeVisitEvery: number;
}

/**
 * Завершує візит і оновлює лічильники лояльності дитини — все в одній
 * транзакції (той самий підхід, що й createChildWithOwner): рахунки
 * не повинні розʼїхатись, якщо щось впаде на півдорозі.
 */
export async function finishVisitTransaction(input: FinishVisitInput) {
    return prisma.$transaction(async (tx) => {
        const visit = await tx.visit.update({
            where: { id: input.visitId },
            data: {
                status: VisitStatus.FINISHED,
                finishedAt: new Date(),
                durationMinutes: input.durationMinutes,
                priceCents: input.priceCents,
                isFreeVisit: input.isFreeVisit,
                closedById: input.closedById,
            },
        });

        const child = await tx.child.findUniqueOrThrow({ where: { id: visit.childId } });

        if (input.isFreeVisit) {
            await tx.child.update({
                where: { id: child.id },
                data: {
                    status: "OUTSIDE",
                    totalVisits: { increment: 1 },
                    freeVisitBalance: { decrement: 1 },
                    freeVisitsUsed: { increment: 1 },
                },
            });
        } else {
            const newLoyaltyVisits = child.loyaltyVisits + 1;
            const bonusEarned = newLoyaltyVisits >= input.freeVisitEvery;

            await tx.child.update({
                where: { id: child.id },
                data: {
                    status: "OUTSIDE",
                    totalVisits: { increment: 1 },
                    loyaltyVisits: bonusEarned ? 0 : newLoyaltyVisits,
                    ...(bonusEarned ? { freeVisitBalance: { increment: 1 } } : {}),
                },
            });
        }

        return visit;
    });
}

export async function findActiveVisitsWithChildren() {
    return prisma.visit.findMany({
        where: { status: VisitStatus.ACTIVE },
        include: { child: true },
        orderBy: { startedAt: "asc" },
    });
}

export async function getVisitStatsForRange(from: Date, to: Date) {
    const finished = await prisma.visit.findMany({
        where: {
            status: VisitStatus.FINISHED,
            finishedAt: { gte: from, lt: to },
        },
        select: { priceCents: true, isFreeVisit: true },
    });

    const activeCount = await prisma.visit.count({
        where: { status: VisitStatus.ACTIVE },
    });

    const totalVisits = finished.length;
    const freeVisits = finished.filter((v) => v.isFreeVisit).length;
    const paidVisits = totalVisits - freeVisits;
    const revenueCents = finished.reduce((sum, v) => sum + (v.priceCents ?? 0), 0);

    return { totalVisits, paidVisits, freeVisits, revenueCents, activeCount };
}