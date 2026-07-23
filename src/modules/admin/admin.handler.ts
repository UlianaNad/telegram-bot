import { Context } from "grammy";
import { renderScreen } from "../../shared/telegram/render.js";
import { createAdminHomeText } from "./admin.views.js";
import { createAdminHomeKeyboard } from "./admin.keyboard.js";

export async function showAdminHome(ctx: Context) {
    await renderScreen(ctx, {
        text: createAdminHomeText(),
        keyboard: createAdminHomeKeyboard(),
    });
}