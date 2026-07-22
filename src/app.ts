import {bot} from "./bot/bot.js";
import { registerBot } from "./bot/register.js";
import { GrammyError, HttpError } from "grammy";

registerBot(bot);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }

  // Даємо користувачу зрозумілу відповідь замість тиші.
  // Обидва виклики обгорнуті в try/catch: якщо мережа з Telegram
  // теж відвалилась (HttpError), ці виклики самі впадуть — і це нормально,
  // тут вже нічого більше зробити не можна.
  void (async () => {
    try {
      if ("callbackQuery" in ctx.update) {
        await ctx.answerCallbackQuery({
          text: "Сталася помилка, спробуйте пізніше.",
          show_alert: true,
        });
      } else {
        await ctx.reply("Сталася помилка, спробуйте пізніше.");
      }
    } catch (notifyError) {
      console.error("Не вдалося повідомити користувача про помилку:", notifyError);
    }
  })();
});

await bot.start();

console.log("Bot is running...");