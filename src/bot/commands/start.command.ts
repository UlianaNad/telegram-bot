import { Bot } from "grammy";
import { BotContext } from "../../shared/types/context.js";
import { showHome } from "../../modules/home/home.handler.js";
import { showAdminHome } from "../../modules/admin/admin.handler.js";
import { findUserByTelegramId } from "../../modules/user/user.repository.js";

export function registerStartCommand(bot: Bot<BotContext>) {
    bot.command("start", async (ctx) => {
         if (!ctx.from) {
            return;
        }

        const existingUser = await findUserByTelegramId(BigInt(ctx.from.id));

        if (!existingUser) {
            await ctx.conversation.enter("registerUserConversation");
            return;
        }

        if (existingUser.userType === "EMPLOYEE") {
            await showAdminHome(ctx);
            return;
        }

        await showHome(ctx);
    });
}