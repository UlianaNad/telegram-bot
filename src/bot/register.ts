import {Bot} from "grammy";

import {registerStartCommand} from "./commands/start.command.js";
import { showChildren } from "../modules/child/child.handler.js";
import { showHome } from "../modules/home/home.handler.js";

export function registerBot(bot: Bot) {
    registerStartCommand(bot);

    bot.callbackQuery("home:children", async (ctx) => {
        await showChildren(ctx);
    });
    bot.callbackQuery("child:back", async (ctx) => {
        await showHome(ctx);
    });
}
