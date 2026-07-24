import { ChildStatus } from "../../generated/prisma/enums.js";
import { ChildCardData } from "./child.types.js";

export function createChildText(): string {
    return `
👶 <b>Діти</b>

Оберіть дитину.
`;
}

const STATUS_LABELS: Record<ChildStatus, string> = {
    IN_ROOM: "🟢 У кімнаті",
    OUTSIDE: "⚪ Поза кімнатою",
};

function formatBirthDate(birthDate: Date): string {
    const day = String(birthDate.getUTCDate()).padStart(2, "0");
    const month = String(birthDate.getUTCMonth() + 1).padStart(2, "0");
    const year = birthDate.getUTCFullYear();
    return `${day}.${month}.${year}`;
}

export function createChildCardText(child: ChildCardData): string {
    const pendingNote = child.visitStatus === "PENDING"
        ? "\n⏳ Очікує підтвердження адміністратора.\n"
        : "";

    return `
👶 <b>${child.firstName}</b>
№${String(child.cardNumber).padStart(4, "0")}

Дата народження: ${formatBirthDate(child.birthDate)}
Статус: ${STATUS_LABELS[child.status]}
${pendingNote}
Всього відвідувань: ${child.totalVisits}
Платних до бонусу: ${child.visitsUntilBonus}
Доступно безкоштовних годин: ${child.freeVisitBalance}
`;
}

const ROLE_LABELS: Record<string, string> = {
    OWNER: "👑 Власник",
    PARENT: "👨‍👩‍👧 Батьки",
    GUARDIAN: "🧑‍🤝‍🧑 Опікун",
};

export function createChildParentsText(
    parents: { firstName: string | null; lastName: string | null; phone: string | null; role: string }[],
    pendingInvites: { phone: string }[] = []
): string {
    const items = parents
        .map((p) => {
            const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || "Без імені";
            return `${ROLE_LABELS[p.role] ?? p.role}\n${name}\n${p.phone ?? "—"}`;
        })
        .join("\n━━━━━━━━━━━━\n");

    const pendingSection = pendingInvites.length > 0
        ? `\n\n⏳ <b>Очікують реєстрації</b>\n${pendingInvites.map((i) => i.phone).join("\n")}`
        : "";

    return `
👨‍👩‍👧 <b>Батьки</b>

${items}${pendingSection}
`;
}