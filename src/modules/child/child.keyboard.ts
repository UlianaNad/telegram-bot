import {InlineKeyboard} from "grammy";

export function createChildKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("⬅ Назад", "child:back");
}