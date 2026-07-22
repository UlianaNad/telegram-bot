import {prisma} from "../../database/prisma.js";

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

import { ChildRole } from "../../generated/prisma/enums.js";

interface CreateChildWithOwnerInput {
  userId: string;
  firstName: string;
  birthDate: Date;
}

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

export function formatCardNumber(cardNumber: number): string {
  return String(cardNumber).padStart(4, "0");
}