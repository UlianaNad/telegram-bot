import {Context } from "grammy";
import {createChildKeyboard} from "./child.keyboard.js";
import {renderScreen} from "../../shared/telegram/render.js";
import {createChildText} from "./child.views.js";
import { getUserChildren } from "./child.service.js";
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

    console.log(children);

    await renderScreen(ctx, {
        text: createChildText(),
        keyboard: createChildKeyboard(children),
    });
}