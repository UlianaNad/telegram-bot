import {
    findActiveOrPendingVisitByChildId,
    createPendingVisit,
    findVisitById,
    confirmVisitAndSetInRoom,
    rejectVisit as rejectVisitRepo,
    finishVisitTransaction,
    findActiveVisitsWithChildren,
    getVisitStatsForRange,
    findVisitHistoryByChildId,
} from "./visit.repository.js";
import { getSettings } from "../settings/settings.repository.js";
import { findChildById } from "../child/child.repository.js";
import { AuditAction, AuditEntity } from "../../generated/prisma/enums.js";
import { logAudit } from "../audit/audit.service.js";

export async function requestVisit(childId: string, parentUserId: string) {
    const existing = await findActiveOrPendingVisitByChildId(childId);
    if (existing) {
        return { ok: false as const };
    }

    const visit = await createPendingVisit({ childId, openedById: parentUserId });

    await logAudit({
        userId: parentUserId,
        action: AuditAction.CREATE,
        entity: AuditEntity.VISIT,
        entityId: visit.id,
        metadata: { childId, status: "PENDING" },
    });

    return { ok: true as const, visit };
}

export async function confirmVisit(visitId: string, adminId: string) {
    const visit = await confirmVisitAndSetInRoom(visitId);

    await logAudit({
        userId: adminId,
        action: AuditAction.UPDATE,
        entity: AuditEntity.VISIT,
        entityId: visit.id,
        metadata: { status: "ACTIVE" },
    });

    return visit;
}

export async function rejectVisitRequest(visitId: string, adminId: string) {
    const visit = await rejectVisitRepo(visitId);

    await logAudit({
        userId: adminId,
        action: AuditAction.UPDATE,
        entity: AuditEntity.VISIT,
        entityId: visit.id,
        metadata: { status: "CANCELLED" },
    });

    return visit;
}

function calculatePrice(durationMinutes: number, priceFirst30: number, priceNext10: number): number {
    if (durationMinutes <= 30) return priceFirst30;
    const extraMinutes = durationMinutes - 30;
    const extraBlocks = Math.ceil(extraMinutes / 10);
    return priceFirst30 + extraBlocks * priceNext10;
}

export async function finishVisit(visitId: string, adminId: string) {
    const visit = await findVisitById(visitId);
    if (!visit) return null;

    const childBeforeFinish = await findChildById(visit.childId);
    if (!childBeforeFinish) return null;

    const settings = await getSettings();

    const durationMs = Date.now() - visit.startedAt.getTime();
    const durationMinutes = Math.max(Math.ceil(durationMs / 60000), 1);

    const isFreeVisit = childBeforeFinish.freeVisitBalance > 0;
    const priceCents = isFreeVisit
        ? 0
        : calculatePrice(durationMinutes, settings.priceFirst30MinutesCents, settings.priceNext10MinutesCents);

    const finishedVisit = await finishVisitTransaction({
        visitId,
        closedById: adminId,
        durationMinutes,
        priceCents,
        isFreeVisit,
        freeVisitEvery: settings.freeVisitEvery,
    });

    const childAfterFinish = await findChildById(visit.childId);
    await logAudit({
        userId: adminId,
        action: AuditAction.UPDATE,
        entity: AuditEntity.VISIT,
        entityId: finishedVisit.id,
        metadata: { status: "FINISHED", durationMinutes, priceCents, isFreeVisit },
    });



    return { visit: finishedVisit, durationMinutes, priceCents, isFreeVisit, child: childAfterFinish };
}

export async function getActiveVisits() {
    const visits = await findActiveVisitsWithChildren();
    return visits.map((visit) => ({
        childId: visit.childId,
        firstName: visit.child.firstName,
        cardNumber: visit.child.cardNumber,
        startedAt: visit.startedAt,
    }));
}

export async function getTodayStats() {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);

    const stats = await getVisitStatsForRange(from, to);
    const settings = await getSettings();

    return { ...stats, currency: settings.currency };
}

export async function getChildVisitHistory(childId: string) {
    const visits = await findVisitHistoryByChildId(childId);
    return visits.map((v) => ({
        status: v.status,
        startedAt: v.startedAt,
        durationMinutes: v.durationMinutes,
        priceCents: v.priceCents,
        isFreeVisit: v.isFreeVisit,
    }));
}

