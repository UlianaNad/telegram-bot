import { createAuditLog } from "./audit.repository.js";
import { AuditAction, AuditEntity } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";

export async function logAudit(input: {
    userId: string;
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
}): Promise<void> {
    try {
        await createAuditLog(input);
    } catch (err) {
        console.error("Не вдалося записати AuditLog:", err);
    }
}