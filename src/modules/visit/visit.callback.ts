import { Bot } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { CALLBACKS } from "../../shared/telegram/callbacks.js";
import { findUserByTelegramId, findUserById } from "../user/user.repository.js";
import { findChildById } from "../child/child.repository.js";
import { findAdmins } from "../admin/admin.repository.js";
import { getSettings } from "../settings/settings.repository.js";
import { requestVisit, confirmVisit, rejectVisitRequest, finishVisit } from "./visit.service.js";
import {
    createVisitRequestTextForAdmin,
    createVisitActiveTextForAdmin,
    createVisitRejectedTextForAdmin,
    createVisitConfirmedTextForParent,
    createVisitRejectedTextForParent,
    createVisitFinishedText,
} from "./visit.views.js";
import { createVisitRequestKeyboard, createVisitActiveKeyboard } from "./visit.keybord.js"
import { showChildCard } from "../child/child.handler.js";

export function registerVisitCallbacks(bot: Bot<BotContext>) {
    bot.callbackQuery(/^visit:start:/, async (ctx) => {
        const childId = ctx.callbackQuery.data.split(":")[2];
        if (!childId || !ctx.from) {
            await ctx.answerCallbackQuery({ text: "Помилка запиту." });
            return;
        }

        const user = await findUserByTelegramId(BigInt(ctx.from.id));
        if (!user) {
            await ctx.answerCallbackQuery({ text: "Користувача не знайдено." });
            return;
        }

        const child = await findChildById(childId);
        if (!child) {
            await ctx.answerCallbackQuery({ text: "Дитину не знайдено." });
            return;
        }

        const result = await requestVisit(childId, user.id);

        if (!result.ok) {
            await ctx.answerCallbackQuery({ text: "Запит на візит вже надіслано.", show_alert: true });
            return;
        }

        await ctx.answerCallbackQuery({ text: "Запит надіслано адміністратору." });

        const admins = await findAdmins();
        const requestText = createVisitRequestTextForAdmin(child);
        const keyboard = createVisitRequestKeyboard(result.visit.id);

        await Promise.all(
            admins.map((admin) =>
                ctx.api
                    .sendMessage(Number(admin.telegramId), requestText, {
                        parse_mode: "HTML",
                        reply_markup: keyboard,
                    })
                    .catch((err) => {
                        console.error(`Не вдалося сповістити адміна ${admin.id}:`, err);
                    })
            )
        );

        await showChildCard(ctx, childId);
    });

    bot.callbackQuery(/^visit:confirm:/, async (ctx) => {
        const visitId = ctx.callbackQuery.data.split(":")[2];
        if (!visitId) {
            await ctx.answerCallbackQuery({ text: "Помилка запиту." });
            return;
        }

        const visit = await confirmVisit(visitId);
        const child = await findChildById(visit.childId);

        await ctx.answerCallbackQuery({ text: "Візит підтверджено." });

        if (child) {
            await ctx.editMessageText(createVisitActiveTextForAdmin(child), {
                parse_mode: "HTML",
                reply_markup: createVisitActiveKeyboard(visit.id),
            });
        }

        if (child && visit.openedById) {
            const parent = await findUserById(visit.openedById);
            if (parent) {
                await ctx.api
                    .sendMessage(Number(parent.telegramId), createVisitConfirmedTextForParent(child), {
                        parse_mode: "HTML",
                    })
                    .catch((err) => console.error("Не вдалося сповістити батьків:", err));
            }
        }
    });

    bot.callbackQuery(/^visit:reject:/, async (ctx) => {
        const visitId = ctx.callbackQuery.data.split(":")[2];
        if (!visitId) {
            await ctx.answerCallbackQuery({ text: "Помилка запиту." });
            return;
        }

        const visit = await rejectVisitRequest(visitId);
        const child = await findChildById(visit.childId);

        await ctx.answerCallbackQuery({ text: "Запит відхилено." });

        if (child) {
            await ctx.editMessageText(createVisitRejectedTextForAdmin(child), { parse_mode: "HTML" });
        }

        if (child && visit.openedById) {
            const parent = await findUserById(visit.openedById);
            if (parent) {
                await ctx.api
                    .sendMessage(Number(parent.telegramId), createVisitRejectedTextForParent(child), {
                        parse_mode: "HTML",
                    })
                    .catch((err) => console.error("Не вдалося сповістити батьків:", err));
            }
        }
    });

    bot.callbackQuery(/^visit:finish:/, async (ctx) => {
        const visitId = ctx.callbackQuery.data.split(":")[2];
        if (!visitId || !ctx.from) {
            await ctx.answerCallbackQuery({ text: "Помилка запиту." });
            return;
        }

        const admin = await findUserByTelegramId(BigInt(ctx.from.id));
        if (!admin) {
            await ctx.answerCallbackQuery({ text: "Користувача не знайдено." });
            return;
        }

        const result = await finishVisit(visitId, admin.id);
        if (!result || !result.child) {
            await ctx.answerCallbackQuery({ text: "Візит не знайдено." });
            return;
        }

        await ctx.answerCallbackQuery({ text: "Візит завершено." });

        const settings = await getSettings();
        const summaryText = createVisitFinishedText({
            childFirstName: result.child.firstName,
            durationMinutes: result.durationMinutes,
            priceCents: result.priceCents,
            isFreeVisit: result.isFreeVisit,
            currency: settings.currency,
            freeVisitEvery: settings.freeVisitEvery,
            loyaltyVisits: result.child.loyaltyVisits,
            freeVisitBalance: result.child.freeVisitBalance,
        });

        await ctx.editMessageText(summaryText, { parse_mode: "HTML" });

        if (result.visit.openedById) {
            const parent = await findUserById(result.visit.openedById);
            if (parent) {
                await ctx.api
                    .sendMessage(Number(parent.telegramId), summaryText, { parse_mode: "HTML" })
                    .catch((err) => console.error("Не вдалося показати підсумок батькам:", err));
            }
        }
    });
}