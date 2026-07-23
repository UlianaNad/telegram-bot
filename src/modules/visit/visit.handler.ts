import { Context } from "grammy";
import { renderScreen } from "../../shared/telegram/render.js";
import { getActiveVisits } from "./visit.service.js";
import { createActiveVisitsText } from "./visit.views.js";
import { createActiveVisitsKeyboard } from "./visit.keyboard.js";

export async function showActiveVisits(ctx: Context) {
    const visits = await getActiveVisits();

    await renderScreen(ctx, {
        text: createActiveVisitsText(visits),
        keyboard: createActiveVisitsKeyboard(visits),
    });
}