import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { createUser, findUserByPhone } from "../user/user.repository.js";
import { resolvePendingParentInvites } from "../child/child.service.js";
import { showHome } from "../home/home.handler.js";
import { showAdminHome } from "../admin/admin.handler.js";
import { normalizePhone } from "../../shared/utils/phone.js";

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
      phone = normalizePhone(message.contact.phone_number);
      break;
    }

    await ctx.reply(
      "Натисніть кнопку нижче, щоб поділитись номером телефону.",
      { reply_markup: contactKeyboard }
    );
  }

  const existingByPhone = await findUserByPhone(phone);

  if (existingByPhone) {
    await ctx.reply(
      "Цей номер телефону вже зареєстрований в іншому акаунті. Зверніться до адміністратора закладу.",
      { reply_markup: { remove_keyboard: true } }
    );
    return;
  }

  const user = await createUser({
    telegramId: BigInt(ctx.from.id),
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    username: ctx.from.username,
    phone,
  });

  const grantedCount = await resolvePendingParentInvites(phone, user.id);

  await ctx.reply(
    grantedCount > 0
      ? `Дякуємо! Вам також надано доступ до ${grantedCount} ${grantedCount === 1 ? "картки" : "карток"} дітей.`
      : "Дякуємо!",
    { reply_markup: { remove_keyboard: true } }
  );

  if (user.userType === "EMPLOYEE") {
    await showAdminHome(ctx);
    return;
  }

  await showHome(ctx);
}