const { Telegraf } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN not found");
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "🎰 Daily Spin Bot\n\nKlik tombol di bawah untuk spin:",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎁 Spin Sekarang",
              web_app: {
                url: "https://abupu9-bit.github.io/dailyspin-miniapp/"
              }
            }
          ]
        ]
      }
    }
  );
});

bot.launch();
console.log("✅ Bot is running");
