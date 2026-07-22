import { prisma } from "../../database/prisma.js";

export async function getSettings() {
    return prisma.settings.findUniqueOrThrow({
        where: { id: "global" },
    });
}