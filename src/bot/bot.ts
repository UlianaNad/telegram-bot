import { Bot } from "grammy";

import { env } from "../config/env.js";
import { BotContext } from "../shared/types/context.js";

export const bot = new Bot<BotContext>(env.botToken);