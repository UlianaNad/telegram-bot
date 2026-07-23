import { getSettings } from "../settings/settings.repository.js";
import {
    findChildrenByUserId,
    createChildWithOwner,
    findChildById,
    searchChildren,
    findAccessesByChildId,
    findAccessForUser,
    grantParentAccess,
} from "./child.repository.js";
import { ChildCardData, ChildKeyboardItem } from "./child.types.js";
import { findActiveOrPendingVisitByChildId } from "../visit/visit.repository.js";
import { findUserByPhone } from "../user/user.repository.js";

/**
 * Повертає дітей для відображення у клавіатурі.
 */
export async function getUserChildren(userId: string): Promise<ChildKeyboardItem[]> {
    const children = await findChildrenByUserId(userId);
    return children.map((child) => ({
        id: child.id,
        firstName: child.firstName,
        cardNumber: child.cardNumber,
    }));
}

/**
 * Створює нову дитину і одразу видає власнику (userId) доступ ролі OWNER.
 * Замінює стару createNewChild(): та не була атомарною (окремі
 * getLastCardNumber() + createChild()) і взагалі не створювала ChildAccess,
 * тож додана дитина була нікому не видима в "Мої діти".
 */
export async function addChild(
    userId: string,
    data: { firstName: string; birthDate: Date }
) {
    return createChildWithOwner({
        userId,
        firstName: data.firstName,
        birthDate: data.birthDate,
    });
}

/**
 * Збирає дані для картки дитини: сирі поля Child + розрахунок
 * "скільки платних візитів лишилось до бонусної години".
 */
export async function getChildCardData(childId: string): Promise<ChildCardData | null> {
    const child = await findChildById(childId);
    if (!child) return null;

    const settings = await getSettings();
    const visitsUntilBonus = Math.max(settings.freeVisitEvery - child.loyaltyVisits, 0);
    const activeVisit = await findActiveOrPendingVisitByChildId(childId);
    
    return {
        firstName: child.firstName,
        cardNumber: child.cardNumber,
        birthDate: child.birthDate,
        status: child.status,
        totalVisits: child.totalVisits,
        freeVisitBalance: child.freeVisitBalance,
        visitsUntilBonus,
        visitStatus: activeVisit?.status === "ACTIVE" ? "ACTIVE" : activeVisit?.status === "PENDING" ? "PENDING" : "NONE",
        activeVisitId: activeVisit?.status === "ACTIVE" ? activeVisit.id : undefined,
    };
}

export async function searchChildrenForAdmin(query: string): Promise<ChildKeyboardItem[]> {
    const children = await searchChildren(query);
    return children.map((child) => ({
        id: child.id,
        firstName: child.firstName,
        cardNumber: child.cardNumber,
    }));
}


export async function getChildParents(childId: string) {
    const accesses = await findAccessesByChildId(childId);
    return accesses.map((access) => ({
        role: access.role,
        firstName: access.user.firstName,
        lastName: access.user.lastName,
        phone: access.user.phone,
    }));
}

export async function isChildOwner(childId: string, userId: string): Promise<boolean> {
    const access = await findAccessForUser(childId, userId);
    return access?.role === "OWNER" && access.isActive;
}

export async function inviteParentByPhone(childId: string, phone: string) {
    const user = await findUserByPhone(phone);
    if (!user) {
        return { ok: false as const };
    }

    const result = await grantParentAccess(childId, user.id);
    return {
        ok: true as const,
        alreadyHadAccess: result.alreadyHadAccess,
        parentName: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Батьки",
    };
}