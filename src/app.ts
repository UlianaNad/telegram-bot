import "dotenv/config";
import {bot} from "./bot/bot.js";

bot.command("start", async (ctx) => {
  await ctx.reply("PlayRoom CRM запущено 🚀");
});

bot.start();

console.log("Bot is running...");