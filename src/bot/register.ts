import { Bot } from "grammy";
import { BotContext } from "../shared/types/context.js";
import { registerStartCommand } from "./commands/start.command.js";
import { showChildren } from "../modules/child/child.handler.js";
import { CALLBACKS } from "../shared/telegram/callbacks.js";
import { conversations, createConversation } from "@grammyjs/conversations";
import { addChildConversation } from "../modules/child/add-child.conversation.js";
import { registerChildCallbacks } from "../modules/child/child.callback.js";

export function registerBot(bot: Bot<BotContext>) {
    bot.use(conversations());
    bot.use(createConversation(addChildConversation));

    registerStartCommand(bot);

    // ASSUMPTION: HOME.CHILDREN лишив тут, бо технічно це кнопка Home-екрана.
    // Якщо захочете таку ж модульність для Home — заведемо home.callback.ts
    // за тим самим принципом, і тут лишиться тільки registerX(bot) виклики.
    bot.callbackQuery(CALLBACKS.HOME.CHILDREN, async (ctx) => {
        await showChildren(ctx);
    });

    registerChildCallbacks(bot);
}