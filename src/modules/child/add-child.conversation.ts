import { Conversation } from "@grammyjs/conversations";
import { BotContext } from "../../shared/types/context.js";
import { addChild } from "../child/child.service.js";
import { formatCardNumber } from "../child/child.repository.js";
import { findOrCreateUser } from "../user/user.service.js";
import { showChildren } from "../child/child.handler.js";
import { NAME_REGEX, parseBirthDate, waitForValidText } from "../../shared/utils/validation.js";


export async function addChildConversation(
  conversation: Conversation<BotContext, BotContext>,
  ctx: BotContext
) {
  if (!ctx.from) {
    await ctx.reply("Не вдалося визначити користувача. Спробуйте ще раз через /start.");
    return;
  }

  // Той самий findOrCreateUser, що й при /start — гарантує User навіть
  // якщо чомусь ще не був створений раніше.
  const user = await findOrCreateUser({
    telegramId: BigInt(ctx.from.id),
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name,
    username: ctx.from.username,
  });

  await ctx.reply("Введіть ім'я дитини:");
  const firstName = await waitForValidText(
    conversation,
    ctx,
    "Ім'я має містити від 2 до 50 літер (без цифр і спецсимволів). Спробуйте ще раз:",
    (text) => NAME_REGEX.test(text)
  );

  await ctx.reply(
    "Введіть дату народження у форматі ДД.ММ.РРРР (наприклад, 12.05.2020):"
  );

  let birthDate: Date | null = null;
  while (!birthDate) {
    const raw = await waitForValidText(
      conversation,
      ctx,
      "Некоректний формат. Введіть дату у форматі ДД.ММ.РРРР:"
    );

    birthDate = parseBirthDate(raw);

    if (!birthDate) {
      await ctx.reply(
        "Такої дати не існує, або вона в майбутньому. Спробуйте ще раз:"
      );
    }
  }

  const child = await addChild(user.id, { firstName, birthDate });

  await ctx.reply(`✅ Дитину додано\n\n${child.firstName}\n№${formatCardNumber(child.cardNumber)}`);

  await showChildren(ctx);
}