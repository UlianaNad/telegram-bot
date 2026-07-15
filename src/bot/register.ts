import {Bot} from "grammy";

import {registerStartCommand} from "./commands/start.command.js";
import { showChildren } from "../modules/child/child.handler.js";
import { showHome } from "../modules/home/home.handler.js";
import { CALLBACKS } from "../shared/telegram/callbacks.js";

export function registerBot(bot: Bot) {
    registerStartCommand(bot);

    bot.callbackQuery(CALLBACKS.HOME.CHILDREN, async (ctx) => {
        await showChildren(ctx);
    });
    bot.callbackQuery(CALLBACKS.CHILD.BACK, async (ctx) => {
        await showHome(ctx);
    });

    bot.callbackQuery(CALLBACKS.CHILD.ADD, async (ctx) => {
        await ctx.answerCallbackQuery({
            text: "Функція додавання дитини ще не реалізована.",
        });
    });

    bot.callbackQuery(CALLBACKS.CHILD.CARD, async (ctx) => {
        await ctx.answerCallbackQuery({
            text: "Функція перегляду картки дитини ще не реалізована.",
        });
    });
}
