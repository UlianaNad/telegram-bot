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