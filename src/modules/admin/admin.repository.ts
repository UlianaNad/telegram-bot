import { prisma } from "../../database/prisma.js";

/**
 * Повертає всіх активних співробітників (ADMIN + SUPER_ADMIN)
 * для розсилки сповіщень про нові запити на візит.
 */
export async function findAdmins() {
    return prisma.user.findMany({
        where: {
            userType: "EMPLOYEE",
            isActive: true,
        },
    });
}