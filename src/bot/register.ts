import {Bot} from "grammy";

import {registerStartCommand} from "./commands/start.command.js";

export function registerCommands(bot: Bot) {
    registerStartCommand(bot);
}
