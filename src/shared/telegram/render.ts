import { InlineKeyboard, Context } from "grammy";

export interface Screen {
    text: string;
    keyboard?: InlineKeyboard;
    parse_mode?: "HTML" | "MarkdownV2";
}

export async function renderScreen(ctx: Context, screen: Screen) {
    if("callback_query" in ctx.update) {
        await ctx.editMessageText(screen.text, {
            reply_markup: screen.keyboard,
            parse_mode: screen.parse_mode ?? "HTML",
        });
        await ctx.answerCallbackQuery();
        return;
    }
    await ctx.reply(screen.text, {
        reply_markup: screen.keyboard,
        parse_mode: screen.parse_mode ?? "HTML",
    });
}