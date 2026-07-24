import { Context } from "grammy";
import { renderScreen } from "../../shared/telegram/render.js";
import { getActiveVisits, getChildVisitHistory } from "./visit.service.js";
import { createActiveVisitsText, createChildHistoryText } from "./visit.views.js";
import { createActiveVisitsKeyboard, createChildHistoryKeyboard } from "./visit.keyboard.js";
import { getSettings } from "../settings/settings.repository.js";

export async function showActiveVisits(ctx: Context) {
    const visits = await getActiveVisits();

    await renderScreen(ctx, {
        text: createActiveVisitsText(visits),
        keyboard: createActiveVisitsKeyboard(visits),
    });
}

export async function showChildHistory(ctx: Context, childId: string) {
    const [visits, settings] = await Promise.all([
        getChildVisitHistory(childId),
        getSettings(),
    ]);

    await renderScreen(ctx, {
        text: createChildHistoryText(visits, settings.currency),
        keyboard: createChildHistoryKeyboard(childId),
    });
}