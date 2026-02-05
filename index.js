require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { loadDB, saveDB } = require("./storage");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

function getUser(db, userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      coins: 0,
      referrals: 0,
      referredBy: null
    };
  }
  return db.users[userId];
}

// START + REFERRAL
const now = Date.now();

if (!user.referredBy && param && param.startsWith("ref_")) {
  const referrerId = param.replace("ref_", "");

  // Cegah self-referral
  if (referrerId === userId) return;

  // Simpan waktu join user
  if (!user.joinedAt) user.joinedAt = now;

  // User harus akun lama (min 1 hari)
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (now - user.joinedAt < ONE_DAY) {
    bot.sendMessage(
      msg.chat.id,
      "⛔ Referral aktif setelah akun kamu berusia 1 hari."
    );
    return;
  }

  if (db.users[referrerId]) {
    user.referredBy = referrerId;
    db.users[referrerId].referrals += 1;
    db.users[referrerId].coins += 100;

    bot.sendMessage(
      referrerId,
      "🎉 Referral valid! +100 coin."
    );
  }
}


  saveDB(db);

  bot.sendMessage(
    msg.chat.id,
    "🎰 Selamat datang di Daily Spin Bot!\n\n" +
    "🎁 Spin gratis setiap hari\n" +
    "👥 Ajak teman & dapatkan bonus\n\n" +
    "Perintah:\n" +
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
