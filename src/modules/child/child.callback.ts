import { Bot } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";
import { showHome } from "../home/home.handler.js";
import { showChildCard, showChildParents } from "./child.handler.js";
import { showChildHistory } from "../visit/visit.handler.js";

/**
 * Реєструє всі callback-хендлери, що стосуються модуля Child.
 * Викликається один раз з registerBot().
 */
export function registerChildCallbacks(bot: Bot<BotContext>) {
    bot.callbackQuery(CALLBACKS.CHILD.ADD, async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("addChildConversation");
    });
 
    bot.callbackQuery(CALLBACKS.CHILD.BACK, async (ctx) => {
        await ctx.answerCallbackQuery();
        await showHome(ctx);
    });
 
    bot.callbackQuery(/^child:card:/, async (ctx) => {
        const childId = ctx.callbackQuery.data.split(":")[2];
        await showChildCard(ctx, childId);
    });

    bot.callbackQuery(/^child:parents:/, async (ctx) => {
    const childId = ctx.callbackQuery.data.split(":")[2];
    if (!childId) {
        await ctx.answerCallbackQuery({ text: "Помилка запиту." });
        return;
    }
    await showChildParents(ctx, childId);
    });

    bot.callbackQuery(/^child:parents_add:/, async (ctx) => {
        const childId = ctx.callbackQuery.data.split(":")[2];
        if (!childId) {
            await ctx.answerCallbackQuery({ text: "Помилка запиту." });
            return;
        }
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("inviteParentConversation", childId);
    });

    bot.callbackQuery(/^child:history:/, async (ctx) => {
    const childId = ctx.callbackQuery.data.split(":")[2];
    if (!childId) {
        await ctx.answerCallbackQuery({ text: "Помилка запиту." });
        return;
    }
    await showChildHistory(ctx, childId);
    });

    bot.callbackQuery(/^child:edit:/, async (ctx) => {
        const childId = ctx.callbackQuery.data.split(":")[2];
        if (!childId) {
            await ctx.answerCallbackQuery({ text: "Помилка запиту." });
            return;
        }
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("editChildConversation", childId);
    });
}
 