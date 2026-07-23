import { Conversation } from "@grammyjs/conversations";
import { BotContext } from "../../shared/types/context.js";
import { isChildOwner, inviteParentByPhone } from "../child/child.service.js";
import { findUserByTelegramId } from "../user/user.repository.js";
import { showChildParents } from "../child/child.handler.js";

function normalizePhone(raw: string): string {
    const trimmed = raw.trim();
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");
    return hasPlus ? `+${digits}` : digits;
}

export async function inviteParentConversation(
  conversation: Conversation<BotContext, BotContext>,
  ctx: BotContext,
  childId: string
) {
  if (!ctx.from) {
    return;
  }

  const user = await findUserByTelegramId(BigInt(ctx.from.id));
  if (!user) {
    await ctx.reply("Користувача не знайдено.");
    return;
  }

  const owner = await isChildOwner(childId, user.id);
  if (!owner) {
    await ctx.reply("Лише власник картки може надавати доступ іншим.");
    return;
  }

  await ctx.reply(
    "Введіть номер телефону батьків, яких хочете додати (вони мають бути зареєстровані в боті):"
  );

  let phone: string | undefined;
  while (!phone) {
    const { message } = await conversation.wait();
    const text = message?.text?.trim();
    if (!text) {
      await ctx.reply("Будь ласка, надішліть номер телефону текстом.");
      continue;
    }
    phone = normalizePhone(text);
  }

  const result = await inviteParentByPhone(childId, phone);

  if (!result.ok) {
    await ctx.reply(
      "Користувача з таким номером не знайдено. Попросіть їх спочатку запустити бота (/start) і поділитись номером телефону, а потім спробуйте ще раз."
    );
    return;
  }

  await ctx.reply(
    result.alreadyHadAccess
      ? "Ця людина вже має доступ до картки."
      : `✅ Доступ надано: ${result.parentName}.`
  );

  await showChildParents(ctx, childId);
}