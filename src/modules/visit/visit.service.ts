import {
    findActiveOrPendingVisitByChildId,
    createPendingVisit,
    findVisitById,
    confirmVisitAndSetInRoom,
    rejectVisit as rejectVisitRepo,
    finishVisitTransaction,
} from "./visit.repository.js";
import { getSettings } from "../settings/settings.repository.js";
import { findChildById } from "../child/child.repository.js";

export async function requestVisit(childId: string, parentUserId: string) {
    const existing = await findActiveOrPendingVisitByChildId(childId);
    if (existing) {
        return { ok: false as const };
    }

    const visit = await createPendingVisit({ childId, openedById: parentUserId });
    return { ok: true as const, visit };
}

export async function confirmVisit(visitId: string) {
    return confirmVisitAndSetInRoom(visitId);
}

export async function rejectVisitRequest(visitId: string) {
    return rejectVisitRepo(visitId);
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

    return { visit: finishedVisit, durationMinutes, priceCents, isFreeVisit, child: childAfterFinish };
}