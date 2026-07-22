import { Conversation } from "@grammyjs/conversations";
import { BotContext } from "../../shared/types/context.js";
import { addChild } from "../child/child.service.js";
import { formatCardNumber } from "../child/child.repository.js";
import { findOrCreateUser } from "../user/user.service.js";
import { showChildren } from "../child/child.handler.js";

const NAME_REGEX = /^[A-Za-zА-Яа-яЇїІіЄєҐґ'’\- ]{2,50}$/;
const DATE_REGEX = /^(\d{2})[.\/](\d{2})[.\/](\d{4})$/;

function parseBirthDate(input: string): Date | null {
  const match = input.trim().match(DATE_REGEX);
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  const date = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isRealDate) return null;
  if (date > new Date()) return null;

  return date;
}

async function waitForValidText(
  conversation: Conversation<BotContext, BotContext>,
  ctx: BotContext,
  errorMessage: string,
  validate?: (text: string) => boolean
): Promise<string> {
  while (true) {
    const { message } = await conversation.wait();
    const text = message?.text?.trim();

    if (!text) {
      await ctx.reply("Будь ласка, надішліть текст.");
      continue;
    }

    if (validate && !validate(text)) {
      await ctx.reply(errorMessage);
      continue;
    }

    return text;
  }
}

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
