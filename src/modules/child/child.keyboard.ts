import {InlineKeyboard} from "grammy";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";

export function createChildKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("Sofia", CALLBACKS.CHILD.CARD)
        .row()
        .text("➕ Додати дитину", CALLBACKS.CHILD.ADD)
        .row()
        .text("⬅ Назад", CALLBACKS.CHILD.BACK);
}