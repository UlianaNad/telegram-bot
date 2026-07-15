import {Context } from "grammy";
import {createChildKeyboard} from "./child.keyboard.js";
import {renderScreen} from "../../shared/telegram/render.js";
import {createChildText} from "./child.views.js";

export async function showChildren(ctx: Context) {
    await renderScreen(ctx, {
        text: createChildText(),
        keyboard: createChildKeyboard(),
    });
}