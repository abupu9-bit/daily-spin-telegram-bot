import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

// ========================
// ENV CHECK
// ========================
if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN belum diset di environment variable");
}

// ========================
// INIT BOT
// ========================
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

console.log("🤖 Bot Telegram berjalan...");

// ========================
// SIMPLE MEMORY STORAGE
// (untuk demo, bisa diganti DB)
// ========================
const users = {};

// ========================
// UTIL
// ========================
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getUser(id) {
  if (!users[id]) {
    users[id] = {
      coins: 0,
      lastSpin: null
    };
  }
  return users[id];
}

// ========================
// COMMAND: /start
// ========================
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `🎉 *Welcome Daily Spin Bot!*\n\n` +
    `🎁 Spin gratis 1x per hari\n` +
    `🪙 Kumpulkan koin\n\n` +
    `Klik /spin untuk mulai!`,
    { parse_mode: "Markdown" }
  );
});

// ========================
// COMMAND: /spin
// ========================
bot.onText(/\/spin/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const user = getUser(userId);

  const today = getTodayKey();

  if (user.lastSpin === today) {
    bot.sendMessage(
      chatId,
      "⏳ Kamu sudah spin hari ini.\nCoba lagi besok ya!"
    );
    return;
  }

  // random reward
  const reward = Math.floor(Math.random() * 50) + 10;

  user.coins += reward;
  user.lastSpin = today;

  bot.sendMessage(
    chatId,
    `🎉 *Spin Berhasil!*\n` +
    `🪙 Kamu dapat *${reward} koin*\n\n` +
    `Total koin: *${user.coins}*`,
    { parse_mode: "Markdown" }
  );
});

// ========================
// COMMAND: /balance
// ========================
bot.onText(/\/balance/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const user = getUser(userId);

  bot.sendMessage(
    chatId,
    `💰 Total koin kamu: *${user.coins}*`,
    { parse_mode: "Markdown" }
  );
});

// ========================
// ERROR HANDLER
// ========================
bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});
