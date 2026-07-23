import { Bot } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";
import { showAdminHome } from "./admin.handler.js";
import { showActiveVisits } from "../visit/visit.handler.js";
import { showTodayStats } from "../child/child.handler.js";

export function registerAdminCallbacks(bot: Bot<BotContext>) {
    bot.callbackQuery(CALLBACKS.ADMIN.SEARCH, async (ctx) => {
        // TODO: пошук картки за номером / ім'ям / телефоном
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter("adminSearchConversation");
    });

    bot.callbackQuery(CALLBACKS.ADMIN.ACTIVE_VISITS, async (ctx) => {
        await showActiveVisits(ctx);
    });

    bot.callbackQuery(CALLBACKS.ADMIN.TODAY, async (ctx) => {
        await showTodayStats(ctx);
    });

    bot.callbackQuery(CALLBACKS.ADMIN.NEW_CLIENT, async (ctx) => {
        // TODO: реєстрація нового клієнта адміном (окремий conversation)
        await ctx.answerCallbackQuery({ text: "Скоро буде доступно." });
    });

    bot.callbackQuery(CALLBACKS.ADMIN.BACK, async (ctx) => {
        await ctx.answerCallbackQuery();
        await showAdminHome(ctx);
    });
}