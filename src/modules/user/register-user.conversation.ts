import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { findOrCreateUser } from "../user/user.service.js";
import { showHome } from "../home/home.handler.js";
import { showAdminHome } from "../admin/admin.handler.js";

export async function registerUserConversation(
  conversation: Conversation<BotContext, BotContext>,
  ctx: BotContext
) {
  if (!ctx.from) {
    return;
  }

  const contactKeyboard = new Keyboard()
    .requestContact("📱 Поділитись номером телефону")
    .resized()
    .oneTime();

  await ctx.reply(
    "Вітаємо! Щоб продовжити, поділіться, будь ласка, номером телефону.",
    { reply_markup: contactKeyboard }
  );

  let phone: string | undefined;

  while (!phone) {
    const { message } = await conversation.wait();

    if (message?.contact) {
      if (message.contact.user_id !== ctx.from.id) {
        await ctx.reply("Будь ласка, поділіться саме своїм номером телефону.");
        continue;
      }
      phone = message.contact.phone_number;
      break;
    }

    await ctx.reply(
      "Натисніть кнопку нижче, щоб поділитись номером телефону.",
      { reply_markup: contactKeyboard }
    );
  }

  const user = await findOrCreateUser({
    telegramId: BigInt(ctx.from.id),
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    username: ctx.from.username,
    phone,
  });

  await ctx.reply("Дякуємо!", { reply_markup: { remove_keyboard: true } });

  if (user.userType === "EMPLOYEE") {
    await showAdminHome(ctx);
    return;
  }

  await showHome(ctx);
}