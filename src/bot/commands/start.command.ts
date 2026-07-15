import {Bot } from "grammy";
import { showHome } from "../../modules/home/home.handler.js";

export function registerStartCommand(bot: Bot) {
    bot.command("start", async (ctx) => {
        await showHome(ctx);
    });
}
