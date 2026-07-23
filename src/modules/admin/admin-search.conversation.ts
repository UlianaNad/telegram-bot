import { Conversation } from "@grammyjs/conversations";
import { BotContext } from "../../shared/types/context.js";
import { searchChildrenForAdmin } from "../child/child.service.js";
import { showAdminSearchResults } from "../admin/admin.handler.js";

export async function adminSearchConversation(
  conversation: Conversation<BotContext, BotContext>,
  ctx: BotContext
) {
  await ctx.reply(
    "Введіть номер картки, ім'я дитини, ім'я одного з батьків або телефон:"
  );

  let query: string | undefined;
  while (!query) {
    const { message } = await conversation.wait();
    const text = message?.text?.trim();

    if (!text) {
      await ctx.reply("Будь ласка, надішліть текст.");
      continue;
    }

    query = text;
  }

  const results = await searchChildrenForAdmin(query);

  await showAdminSearchResults(ctx, results);
}