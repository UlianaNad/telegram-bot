import { Bot } from "grammy";

import { env } from "../config/env.js";

export const bot = new Bot(env.botToken);