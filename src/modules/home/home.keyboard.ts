import { InlineKeyboard } from "grammy";

export function createHomeKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("👶 Мої діти", "home:children")
        .text("💰 Ціни", "home:prices")
        .row()
        .text("ℹ️ Про кімнату", "home:about")
        .text("👤 Профіль", "home:profile");
}