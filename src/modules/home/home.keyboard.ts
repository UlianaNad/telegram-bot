import { InlineKeyboard } from "grammy";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";

export function createHomeKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("👶 Мої діти", CALLBACKS.HOME.CHILDREN)
        .text("💰 Ціни", CALLBACKS.HOME.PRICES)
        .row()
        .text("ℹ️ Про кімнату", CALLBACKS.HOME.ABOUT)
        .text("👤 Профіль", CALLBACKS.HOME.PROFILE);
}