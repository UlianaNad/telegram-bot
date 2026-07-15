import {bot} from "./bot/bot.js";
import { registerStartCommand } from "./bot/commands/start.command.js";

registerStartCommand(bot);

bot.start();

console.log("Bot is running...");