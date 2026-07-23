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