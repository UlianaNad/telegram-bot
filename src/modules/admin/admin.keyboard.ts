import { InlineKeyboard } from "grammy";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";
import { ChildKeyboardItem } from "../child/child.types.js";

export function createAdminHomeKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("🔍 Пошук картки", CALLBACKS.ADMIN.SEARCH)
        .text("🟢 Активні візити", CALLBACKS.ADMIN.ACTIVE_VISITS)
        .row()
        .text("📊 Сьогодні", CALLBACKS.ADMIN.TODAY)
        .text("➕ Новий клієнт", CALLBACKS.ADMIN.NEW_CLIENT);
}

export function createAdminBackKeyboard(): InlineKeyboard {
    return new InlineKeyboard().text("⬅ Назад", CALLBACKS.ADMIN.BACK);
}

export function createSearchResultsKeyboard(results: ChildKeyboardItem[]): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    for (const child of results) {
        keyboard
            .text(
                `${child.firstName}   №${String(child.cardNumber).padStart(4, "0")}`,
                `${CALLBACKS.CHILD.CARD}:${child.id}`
            )
            .row();
    }

    keyboard.text("⬅ Назад", CALLBACKS.ADMIN.BACK);

    return keyboard;
}