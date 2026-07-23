import { formatCardNumber } from "../child/child.repository.js";

export function createVisitRequestTextForAdmin(child: { firstName: string; cardNumber: number }): string {
    return `
🔔 <b>Новий запит на візит</b>

${child.firstName} №${formatCardNumber(child.cardNumber)}

Підтвердити початок відвідування?
`;
}

export function createVisitActiveTextForAdmin(child: { firstName: string; cardNumber: number }): string {
    return `
✅ <b>Візит підтверджено</b>

${child.firstName} №${formatCardNumber(child.cardNumber)}
🟢 У кімнаті
`;
}

export function createVisitRejectedTextForAdmin(child: { firstName: string; cardNumber: number }): string {
    return `
❌ <b>Запит відхилено</b>

${child.firstName} №${formatCardNumber(child.cardNumber)}
`;
}

export function createVisitConfirmedTextForParent(child: { firstName: string }): string {
    return `✅ Візит підтверджено. ${child.firstName} у кімнаті.`;
}

export function createVisitRejectedTextForParent(child: { firstName: string }): string {
    return `❌ Запит на візит для ${child.firstName} відхилено адміністратором.`;
}

function formatCents(cents: number, currency: string): string {
    return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function createVisitFinishedText(input: {
    childFirstName: string;
    durationMinutes: number;
    priceCents: number;
    isFreeVisit: boolean;
    currency: string;
    freeVisitEvery: number;
    loyaltyVisits: number;
    freeVisitBalance: number;
}): string {
    const priceLine = input.isFreeVisit
        ? "Безкоштовна година"
        : `Сума: ${formatCents(input.priceCents, input.currency)}`;

    const bonusLine = input.freeVisitBalance > 0
        ? "🎉 Вітаємо! Наступна година вже доступна."
        : `До наступної безкоштовної години: ${Math.max(input.freeVisitEvery - input.loyaltyVisits, 0)}`;

    return `
🏁 <b>Візит завершено</b>

${input.childFirstName}
Час: ${input.durationMinutes} хв
${priceLine}

${bonusLine}
`;
}

function formatElapsed(startedAt: Date): string {
    const totalMinutes = Math.floor((Date.now() - startedAt.getTime()) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function createActiveVisitsText(
    visits: { firstName: string; cardNumber: number; startedAt: Date }[]
): string {
    if (visits.length === 0) {
        return `
🟢 <b>Активні візити</b>

Зараз немає активних візитів.
`;
    }

    const items = visits
        .map((v) => `👶 ${v.firstName} №${formatCardNumber(v.cardNumber)}\n${formatElapsed(v.startedAt)}`)
        .join("\n━━━━━━━━━━━━\n");

    return `
🟢 <b>Активні візити</b>

${items}
`;
}