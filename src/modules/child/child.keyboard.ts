import {InlineKeyboard} from "grammy";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";
import { ChildKeyboardItem } from "./child.types.js";

export function createChildKeyboard(
    children: ChildKeyboardItem[]
): InlineKeyboard {
    const keyboard = new InlineKeyboard();

    for (const child of children) {
        keyboard
            .text(
                `${child.firstName}   №${String(child.cardNumber).padStart(4, "0")}`,
                `${CALLBACKS.CHILD.CARD}:${child.id}`
            )
            .row();
    }

    keyboard
        .text("➕ Додати дитину", CALLBACKS.CHILD.ADD)
        .row()
        .text("⬅ Назад", CALLBACKS.CHILD.BACK);

    return keyboard;
}