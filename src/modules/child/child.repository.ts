import { prisma } from "../../database/prisma.js";
import { ChildRole } from "../../generated/prisma/enums.js";

/**
 * Повертає всіх дітей, до яких користувач має активний доступ.
 */
export async function findChildrenByUserId(userId: string) {
    return prisma.child.findMany({
        where: {
            accesses: {
                some: {
                    userId,
                    isActive: true,
                },
            },
        },
        orderBy: {
            cardNumber: "asc",
        },
    });
}

/**
 * Повертає одну дитину за id, або null якщо не знайдено.
 */
export async function findChildById(id: string) {
    return prisma.child.findUnique({
        where: { id },
    });
}

/**
 * Створює нову дитину.
 */
export async function createChild(data: {
    cardNumber: number;
    firstName: string;
    birthDate: Date;
}) {
    return prisma.child.create({
        data,
    });
}

/**
 * Повертає останній виданий номер картки.
 */
export async function getLastCardNumber() {
    const child = await prisma.child.findFirst({
        orderBy: {
            cardNumber: "desc",
        },
    });
    return child?.cardNumber ?? 0;
}

interface CreateChildWithOwnerInput {
    userId: string;
    firstName: string;
    birthDate: Date;
}

/**
 * Створює Child і ChildAccess(OWNER) в одній транзакції.
 * Номер картки рахується всередині транзакції (tx), а не окремим
 * getLastCardNumber() + createChild() — це прибирає race condition,
 * коли два адміністратори одночасно додають дитину і отримують однаковий номер.
 */
export async function createChildWithOwner(input: CreateChildWithOwnerInput) {
    return prisma.$transaction(async (tx) => {
        const last = await tx.child.findFirst({
            orderBy: { cardNumber: "desc" },
            select: { cardNumber: true },
        });

        const nextCardNumber = (last?.cardNumber ?? 0) + 1;

        const child = await tx.child.create({
            data: {
                firstName: input.firstName,
                birthDate: input.birthDate,
                cardNumber: nextCardNumber,
            },
        });

        await tx.childAccess.create({
            data: {
                childId: child.id,
                userId: input.userId,
                role: ChildRole.OWNER,
            },
        });

        return child;
    });
}

/**
 * Форматує номер картки для показу користувачу: 1 -> "0001"
 */
export function formatCardNumber(cardNumber: number): string {
    return String(cardNumber).padStart(4, "0");
}

/**
 * Пошук дитини за номером картки, іменем дитини, іменем/прізвищем
 * одного з батьків або телефоном.
 */
export async function searchChildren(query: string) {
    const trimmed = query.trim();
    const isNumeric = /^\d+$/.test(trimmed);

    return prisma.child.findMany({
        where: {
            isActive: true,
            OR: [
                ...(isNumeric ? [{ cardNumber: Number(trimmed) }] : []),
                { firstName: { contains: trimmed, mode: "insensitive" } },
                {
                    accesses: {
                        some: {
                            isActive: true,
                            user: {
                                OR: [
                                    { firstName: { contains: trimmed, mode: "insensitive" } },
                                    { lastName: { contains: trimmed, mode: "insensitive" } },
                                    { phone: { contains: trimmed } },
                                ],
                            },
                        },
                    },
                },
            ],
        },
        orderBy: { cardNumber: "asc" },
        take: 20,
    });
}

export async function findAccessesByChildId(childId: string) {
    return prisma.childAccess.findMany({
        where: { childId, isActive: true },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });
}

export async function findAccessForUser(childId: string, userId: string) {
    return prisma.childAccess.findUnique({
        where: { userId_childId: { userId, childId } },
    });
}

/**
 * Видає доступ ролі PARENT. Якщо доступ уже існував, але був
 * деактивований раніше — реактивує його замість дубліката.
 */
export async function grantParentAccess(childId: string, userId: string) {
    const existing = await findAccessForUser(childId, userId);

    if (existing) {
        if (existing.isActive) {
            return { access: existing, alreadyHadAccess: true };
        }
        const reactivated = await prisma.childAccess.update({
            where: { id: existing.id },
            data: { isActive: true },
        });
        return { access: reactivated, alreadyHadAccess: false };
    }

    const created = await prisma.childAccess.create({
        data: { childId, userId, role: "PARENT" },
    });
    return { access: created, alreadyHadAccess: false };
}

export async function findPendingInviteForChildAndPhone(childId: string, phone: string) {
    return prisma.parentInvite.findFirst({
        where: { childId, phone, status: "PENDING" },
    });
}

export async function createParentInvite(data: { childId: string; phone: string; invitedById: string }) {
    return prisma.parentInvite.create({ data });
}

export async function findPendingInvitesByPhone(phone: string) {
    return prisma.parentInvite.findMany({
        where: { phone, status: "PENDING" },
    });
}

export async function findPendingInvitesByChildId(childId: string) {
    return prisma.parentInvite.findMany({
        where: { childId, status: "PENDING" },
        orderBy: { createdAt: "asc" },
    });
}

export async function fulfillInvite(inviteId: string) {
    return prisma.parentInvite.update({
        where: { id: inviteId },
        data: { status: "FULFILLED" },
    });
}