import { Bot } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";

/**
 * Реєструє callback-хендлери адмін-панелі.
 * Поки що заглушки — реалізація прийде разом з Visit-флоу.
 */
export function registerAdminCallbacks(bot: Bot<BotContext>) {
    bot.callbackQuery(CALLBACKS.ADMIN.SEARCH, async (ctx) => {
        // TODO Visit-флоу: пошук картки за номером / ім'ям / телефоном
        await ctx.answerCallbackQuery({ text: "Скоро буде доступно." });
    });

    bot.callbackQuery(CALLBACKS.ADMIN.ACTIVE_VISITS, async (ctx) => {
        // TODO Visit-флоу: список активних візитів
        await ctx.answerCallbackQuery({ text: "Скоро буде доступно." });
    });

    bot.callbackQuery(CALLBACKS.ADMIN.TODAY, async (ctx) => {
        // TODO Visit-флоу: статистика за сьогодні
        await ctx.answerCallbackQuery({ text: "Скоро буде доступно." });
    });

    bot.callbackQuery(CALLBACKS.ADMIN.NEW_CLIENT, async (ctx) => {
        // TODO: реєстрація нового клієнта адміном (окремий conversation)
        await ctx.answerCallbackQuery({ text: "Скоро буде доступно." });
    });
}