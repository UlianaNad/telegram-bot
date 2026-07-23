import { Context } from "grammy";
import { renderScreen } from "../../shared/telegram/render.js";
import { createAdminHomeText, createTodayStatsText, createSearchResultsText } from "./admin.views.js";
import { createAdminHomeKeyboard, createAdminBackKeyboard, createSearchResultsKeyboard } from "./admin.keyboard.js";
import { getTodayStats } from "../visit/visit.service.js";
import { ChildKeyboardItem } from "../child/child.types.js";

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

export async function showAdminSearchResults(ctx: Context, results: ChildKeyboardItem[]) {
    await renderScreen(ctx, {
        text: createSearchResultsText(results),
        keyboard: createSearchResultsKeyboard(results),
    });
}