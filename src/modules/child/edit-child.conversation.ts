import { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { findUserByTelegramId } from "../user/user.repository.js";
import { isChildOwner } from "../child/child.service.js";
import { findChildById, updateChild } from "../child/child.repository.js";
import { showChildCard } from "../child/child.handler.js";
import { NAME_REGEX, parseBirthDate, waitForValidText } from "../../shared/utils/validation.js";
import { logAudit } from "../audit/audit.service.js";
import { AuditAction, AuditEntity } from "../../generated/prisma/enums.js";

const EDIT_FIELD = {
    NAME: "editfield:name",
    BIRTHDATE: "editfield:birthdate",
    NOTES: "editfield:notes",
    DONE: "editfield:done",
} as const;

function createEditMenuKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("✏ Ім'я", EDIT_FIELD.NAME)
        .row()
        .text("🎂 Дата народження", EDIT_FIELD.BIRTHDATE)
        .row()
        .text("📝 Нотатки", EDIT_FIELD.NOTES)
        .row()
        .text("✅ Завершити", EDIT_FIELD.DONE);
}

export async function editChildConversation(
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

  const canEdit = user.userType === "EMPLOYEE" || (await isChildOwner(childId, user.id));
  if (!canEdit) {
    await ctx.reply("Редагувати картку може лише власник або адміністратор.");
    return;
  }

  const child = await findChildById(childId);
  if (!child) {
    await ctx.reply("Дитину не знайдено.");
    return;
  }

  while (true) {
    await ctx.reply("Що хочете змінити?", { reply_markup: createEditMenuKeyboard() });

    const fieldCtx = await conversation.waitForCallbackQuery([
      EDIT_FIELD.NAME,
      EDIT_FIELD.BIRTHDATE,
      EDIT_FIELD.NOTES,
      EDIT_FIELD.DONE,
    ]);
    await fieldCtx.answerCallbackQuery();

    const choice = fieldCtx.callbackQuery.data;

    if (choice === EDIT_FIELD.DONE) {
      break;
    }

    if (choice === EDIT_FIELD.NAME) {
      await ctx.reply("Введіть нове ім'я дитини:");
      const firstName = await waitForValidText(
        conversation,
        ctx,
        "Ім'я має містити від 2 до 50 літер (без цифр і спецсимволів). Спробуйте ще раз:",
        (text) => NAME_REGEX.test(text)
      );
      await updateChild(childId, { firstName });
      await logAudit({
        userId: user.id,
        action: AuditAction.UPDATE,
        entity: AuditEntity.CHILD,
        entityId: childId,
        metadata: { field: "firstName", before: child.firstName, after: firstName },
      });
      child.firstName = firstName;
      await ctx.reply("✅ Ім'я оновлено.");
      continue;
    }

    if (choice === EDIT_FIELD.BIRTHDATE) {
      await ctx.reply("Введіть нову дату народження у форматі ДД.ММ.РРРР:");
      let birthDate: Date | null = null;
      while (!birthDate) {
        const raw = await waitForValidText(
          conversation,
          ctx,
          "Некоректний формат. Введіть дату у форматі ДД.ММ.РРРР:"
        );
        birthDate = parseBirthDate(raw);
        if (!birthDate) {
          await ctx.reply("Такої дати не існує, або вона в майбутньому. Спробуйте ще раз:");
        }
      }
      await updateChild(childId, { birthDate });
      await logAudit({
        userId: user.id,
        action: AuditAction.UPDATE,
        entity: AuditEntity.CHILD,
        entityId: childId,
        metadata: { field: "birthDate", before: child.birthDate.toISOString(), after: birthDate.toISOString() },
      });
      child.birthDate = birthDate;
      await ctx.reply("✅ Дату народження оновлено.");
      continue;
    }

    if (choice === EDIT_FIELD.NOTES) {
      await ctx.reply('Введіть нотатки (або надішліть "-", щоб очистити):');
      const raw = await waitForValidText(conversation, ctx, "Будь ласка, надішліть текст.");
      const newNotes = raw === "-" ? null : raw;
      await updateChild(childId, { notes: newNotes });
      await logAudit({
        userId: user.id,
        action: AuditAction.UPDATE,
        entity: AuditEntity.CHILD,
        entityId: childId,
        metadata: { field: "notes", before: child.notes, after: newNotes },
      });
      child.notes = newNotes;
      await ctx.reply("✅ Нотатки оновлено.");
      continue;
    }
  }

  await showChildCard(ctx, childId);
}