import { createConversation } from "@grammyjs/conversations";
import { addChildConversation } from "./add-child.conversation.js";
import { bot } from "../../bot/bot.js";

bot.use(createConversation(addChildConversation));