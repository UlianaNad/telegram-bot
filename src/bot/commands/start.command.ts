import {Bot } from "grammy";
import { showHome } from "../../modules/home/home.handler.js";
import { findOrCreateUser } from "../../modules/user/user.service.js";

export function registerStartCommand(bot: Bot) {
    bot.command("start", async (ctx) => {
         if (!ctx.from) {
        return;
        }
        const telegramId = BigInt(ctx.from.id);
        const user = await findOrCreateUser(ctx.from);
        console.log("User:", user);
        await showHome(ctx);
    });
}
