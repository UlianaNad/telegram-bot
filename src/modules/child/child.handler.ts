import { Context } from "grammy";
import { createChildKeyboard, createChildCardKeyboard } from "./child.keyboard.js";
import { renderScreen } from "../../shared/telegram/render.js";
import { createChildText, createChildCardText } from "./child.views.js";
import { getUserChildren, getChildCardData } from "./child.service.js";
import { findUserByTelegramId } from "../user/user.repository.js";

export async function showChildren(ctx: Context) {
    if (!ctx.from) {
        return;
    }

    const user = await findUserByTelegramId(BigInt(ctx.from.id));

    if (!user) {
        await ctx.reply("Користувача не знайдено.");
        return;
    }

    const children = await getUserChildren(user.id);

    await renderScreen(ctx, {
        text: createChildText(),
        keyboard: createChildKeyboard(children),
    });
}

export async function showChildCard(ctx: Context, childId: string) {
    if (!ctx.from) {
        return;
    }

    const [card, user] = await Promise.all([
        getChildCardData(childId),
        findUserByTelegramId(BigInt(ctx.from.id)),
    ]);

    if (!card) {
        await ctx.answerCallbackQuery({ text: "Дитину не знайдено." });
        return;
    }

    await renderScreen(ctx, {
        text: createChildCardText(card),
        keyboard: createChildCardKeyboard({
            childId,
            isEmployee: user?.userType === "EMPLOYEE",
            visitStatus: card.visitStatus,
            activeVisitId: card.activeVisitId,
        }),
    });
}