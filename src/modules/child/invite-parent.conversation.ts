import { Conversation } from "@grammyjs/conversations";
import { BotContext } from "../../shared/types/context.js";
import { isChildOwner, inviteParentByPhone } from "../child/child.service.js";
import { findUserByTelegramId } from "../user/user.repository.js";
import { showChildParents } from "../child/child.handler.js";
import { normalizePhone } from "../../shared/utils/phone.js";

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

  await ctx.reply("Введіть номер телефону батьків, яких хочете додати:");

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

  const result = await inviteParentByPhone(childId, phone, user.id);

  if (result.pending) {
    await ctx.reply(
      result.alreadyInvited
        ? "Запрошення на цей номер вже надіслано раніше й очікує реєстрації."
        : "Цю людину ще не зареєстровано в боті. Доступ буде видано автоматично, щойно вона запустить бота і поділиться цим номером телефону."
    );
  } else {
    await ctx.reply(
      result.alreadyHadAccess
        ? "Ця людина вже має доступ до картки."
        : `✅ Доступ надано: ${result.parentName}.`
    );
  }

  await showChildParents(ctx, childId);
}