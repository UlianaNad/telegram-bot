import { prisma } from "../../database/prisma.js";
import { AuditAction, AuditEntity } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";

export async function createAuditLog(data: {
    userId: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
}) {
    return prisma.auditLog.create({
        data: {
            userId: data.userId,
            action: data.action,
            entity: data.entity,
            entityId: data.entityId,
            metadata: data.metadata,
        },
    });
}