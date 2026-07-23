import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { createUser, findUserByPhone } from "../user/user.repository.js";
import { showHome } from "../home/home.handler.js";
import { showAdminHome } from "../admin/admin.handler.js";

function normalizePhone(raw: string): string {
    // Прибираємо все, крім цифр і початкового "+" —
    // різні клієнти Telegram віддають номер по-різному
    // (з "+", без нього, з пробілами).
    const trimmed = raw.trim();
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");
    return hasPlus ? `+${digits}` : digits;
}

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

  await ctx.reply("Дякуємо!", { reply_markup: { remove_keyboard: true } });

  if (user.userType === "EMPLOYEE") {
    await showAdminHome(ctx);
    return;
  }

  await showHome(ctx);
}