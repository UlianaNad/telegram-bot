import {Context} from "grammy";
import {createHomeKeyboard} from "./home.keyboard.js";
import {createHomeText} from "./home.views.js";
import {renderScreen} from "../../shared/telegram/render.js";

export async function showHome(ctx: Context) {
    await renderScreen(ctx, {
        text: createHomeText(),
        keyboard: createHomeKeyboard(),
    });
}