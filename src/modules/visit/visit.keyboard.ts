import { InlineKeyboard } from "grammy";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";

export function createVisitRequestKeyboard(visitId: string): InlineKeyboard {
    return new InlineKeyboard()
        .text("✅ Підтвердити", `${CALLBACKS.VISIT.CONFIRM}:${visitId}`)
        .text("❌ Відхилити", `${CALLBACKS.VISIT.REJECT}:${visitId}`);
}

export function createVisitActiveKeyboard(visitId: string): InlineKeyboard {
    return new InlineKeyboard().text("🏁 Завершити візит", `${CALLBACKS.VISIT.FINISH}:${visitId}`);
}

export function createActiveVisitsKeyboard(
    visits: { childId: string; firstName: string; cardNumber: number }[]
): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    for (const visit of visits) {
        keyboard
            .text(
                `${visit.firstName}   №${String(visit.cardNumber).padStart(4, "0")}`,
                `${CALLBACKS.CHILD.CARD}:${visit.childId}`
            )
            .row();
    }

    keyboard.text("⬅ Назад", CALLBACKS.ADMIN.BACK);

    return keyboard;
}

export function createChildHistoryKeyboard(childId: string): InlineKeyboard {
    return new InlineKeyboard().text("⬅ Назад", `${CALLBACKS.CHILD.CARD}:${childId}`);
}