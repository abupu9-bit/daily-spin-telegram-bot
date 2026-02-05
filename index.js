const TelegramBot = require("node-telegram-bot-api");
const { loadDB, saveDB } = require("./storage");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN not set");
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function getUser(db, userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      coins: 0,
      referrals: 0,
      referredBy: null,
      joinedAt: Date.now()
    };
  }
  return db.users[userId];
}

// START + REFERRAL
bot.onText(/\/start(.*)/, (msg, match) => {
  const param = match[1]?.trim();
  const userId = String(msg.from.id);

  const db = loadDB();
  const user = getUser(db, userId);

  if (!user.referredBy && param && param.startsWith("ref_")) {
    const referrerId = param.replace("ref_", "");

    if (referrerId !== userId && db.users[referrerId]) {
      user.referredBy = referrerId;
      db.users[referrerId].referrals += 1;
      db.users[referrerId].coins += 100;

      bot.sendMessage(referrerId, "🎉 Referral valid! +100 coin.");
    }
  }

  saveDB(db);

  bot.sendMessage(
    msg.chat.id,
    "🎰 Selamat datang di Daily Spin Bot!\n\n" +
    "🎁 Spin gratis setiap hari\n" +
    "👥 Ajak teman & dapatkan bonus\n\n" +
    "/ref - Link referral\n" +
    "/refboard - Papan referral"
  );
});

// LINK REFERRAL
bot.onText(/\/ref/, (msg) => {
  const link = `https://t.me/${process.env.BOT_USERNAME}?start=ref_${msg.from.id}`;
  bot.sendMessage(
    msg.chat.id,
    `👥 Link referral kamu:\n${link}\n\n🎁 Bonus 100 coin / referral`
  );
});

// REFERRAL LEADERBOARD
bot.onText(/\/refboard/, (msg) => {
  const db = loadDB();

  const top = Object.entries(db.users)
    .sort((a, b) => b[1].referrals - a[1].referrals)
    .slice(0, 10);

  if (top.length === 0) {
    return bot.sendMessage(msg.chat.id, "Belum ada referral 😅");
  }

  let text = "🏆 Referral Leaderboard\n\n";
  top.forEach(([id, data], i) => {
    text += `${i + 1}. User ${id} — ${data.referrals} referral\n`;
  });

  bot.sendMessage(msg.chat.id, text);
});

console.log("🤖 Bot running...");
