import { InlineKeyboard } from "grammy";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";

export function createAdminHomeKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("🔍 Пошук картки", CALLBACKS.ADMIN.SEARCH)
        .text("🟢 Активні візити", CALLBACKS.ADMIN.ACTIVE_VISITS)
        .row()
        .text("📊 Сьогодні", CALLBACKS.ADMIN.TODAY)
        .text("➕ Новий клієнт", CALLBACKS.ADMIN.NEW_CLIENT);
}