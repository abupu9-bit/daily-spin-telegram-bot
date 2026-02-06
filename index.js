import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log("🤖 Daily Spin Bot running");

// ================= STORAGE =================
const users = {};

function getUser(id) {
  if (!users[id]) {
    users[id] = {
      coins: 0,
      lastSpin: null,
      refBy: null,
      refs: 0
    };
  }
  return users[id];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ================= /start =================
bot.onText(/\/start(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const user = getUser(userId);

  const refId = match[1]?.trim();
  if (refId && !user.refBy && refId !== String(userId)) {
    user.refBy = refId;
    getUser(refId).refs += 1;
    getUser(refId).coins += 20;
  }

  bot.sendMessage(chatId, "🎰 *Daily Spin*\nSpin gratis setiap hari!", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎰 SPIN", callback_data: "spin" }],
        [{ text: "👥 Referral", callback_data: "ref" }],
        [{ text: "💰 Balance", callback_data: "balance" }]
      ]
    }
  });
});

// ================= CALLBACK =================
bot.on("callback_query", (q) => {
  const chatId = q.message.chat.id;
  const userId = q.from.id;
  const user = getUser(userId);

  if (q.data === "spin") {
    if (user.lastSpin === today()) {
      bot.answerCallbackQuery(q.id, {
        text: "⏳ Sudah spin hari ini!"
      });
      return;
    }

    const reward = Math.floor(Math.random() * 50) + 10;
    user.coins += reward;
    user.lastSpin = today();

    bot.editMessageText(
      `🎉 Kamu dapat *${reward} koin*\n💰 Total: *${user.coins}*`,
      {
        chat_id: chatId,
        message_id: q.message.message_id,
        parse_mode: "Markdown"
      }
    );
  }

  if (q.data === "balance") {
    bot.answerCallbackQuery(q.id, {
      text: `💰 Koin kamu: ${user.coins}`,
      show_alert: true
    });
  }

  if (q.data === "ref") {
    bot.sendMessage(
      chatId,
      `👥 *Referral System*\n\n` +
        `Ajak teman pakai link ini:\n` +
        `https://t.me/${process.env.BOT_USERNAME}?start=${userId}\n\n` +
        `👤 Referral: *${user.refs}*\n` +
        `🪙 Bonus: 20 koin / referral`,
      { parse_mode: "Markdown" }
    );
  }
});

// ================= /ref =================
bot.onText(/\/ref/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const user = getUser(userId);

  bot.sendMessage(
    chatId,
    `👥 *Referral Link*\n\n` +
      `https://t.me/${process.env.BOT_USERNAME}?start=${userId}\n\n` +
      `Total referral: *${user.refs}*`,
    { parse_mode: "Markdown" }
  );
});
