import {Bot } from "grammy";

export function registerStartCommand(bot: Bot) {
    bot.command("start", async (ctx) => {
        await ctx.reply("PlayRoom CRM запущено 🚀");
    });
}
