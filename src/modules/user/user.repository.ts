import { prisma } from "../../database/prisma.js";

export async function findUserByTelegramId(telegramId: bigint) {
    return prisma.user.findUnique({
        where: {
            telegramId,
        },
    });
}

export async function findUserById(id: string) {
    return prisma.user.findUnique({
        where: {
            id,
        },
    });
}

export async function findUserByPhone(phone: string) {
    return prisma.user.findUnique({
        where: { phone },
    });
}

export async function createUser(data: {
    telegramId: bigint;
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
}) {
    return prisma.user.create({
        data,
    });
}