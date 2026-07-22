import {Bot } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { showHome } from "../../modules/home/home.handler.js";
import { findOrCreateUser } from "../../modules/user/user.service.js";

export function registerStartCommand(bot: Bot<BotContext>) {
    bot.command("start", async (ctx) => {
         if (!ctx.from) {
            return;
        }
        const user = await findOrCreateUser({
            telegramId: BigInt(ctx.from.id),
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            username: ctx.from.username
        });
        console.log("User:", user);
        await showHome(ctx);
    });
}
