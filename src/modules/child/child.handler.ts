import { Context } from "grammy";
import { createChildKeyboard, createChildCardKeyboard, createChildParentsKeyboard } from "./child.keyboard.js";
import { renderScreen } from "../../shared/telegram/render.js";
import { createChildText, createChildCardText, createChildParentsText } from "./child.views.js";
import { getUserChildren, getChildCardData, getChildParents, isChildOwner } from "./child.service.js";
import { findUserByTelegramId } from "../user/user.repository.js";
import { createAdminHomeText, createTodayStatsText } from "../admin/admin.views.js";
import { createAdminBackKeyboard, createAdminHomeKeyboard } from "../admin/admin.keyboard.js";
import { getTodayStats } from "../visit/visit.service.js";

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


export async function showChildParents(ctx: Context, childId: string) {
    if (!ctx.from) {
        return;
    }

    const [parents, user] = await Promise.all([
        getChildParents(childId),
        findUserByTelegramId(BigInt(ctx.from.id)),
    ]);

    const isOwner = user ? await isChildOwner(childId, user.id) : false;

    await renderScreen(ctx, {
        text: createChildParentsText(parents),
        keyboard: createChildParentsKeyboard(childId, isOwner),
    });
}

export async function showAdminHome(ctx: Context) {
    await renderScreen(ctx, {
        text: createAdminHomeText(),
        keyboard: createAdminHomeKeyboard(),
    });
}

export async function showTodayStats(ctx: Context) {
    const stats = await getTodayStats();

    await renderScreen(ctx, {
        text: createTodayStatsText(stats),
        keyboard: createAdminBackKeyboard(),
    });
}