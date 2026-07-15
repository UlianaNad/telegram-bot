import {bot} from "./bot/bot.js";
import { registerBot } from "./bot/register.js";

registerBot(bot);

await bot.start();

console.log("Bot is running...");