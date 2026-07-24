import { Conversation } from "@grammyjs/conversations";
import { BotContext } from "../types/context.js";

export const NAME_REGEX = /^[A-Za-zА-Яа-яЇїІіЄєҐґ'’\- ]{2,50}$/;
const DATE_REGEX = /^(\d{2})[.\/](\d{2})[.\/](\d{4})$/;

export function parseBirthDate(input: string): Date | null {
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

export async function waitForValidText(
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