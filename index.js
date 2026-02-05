const TelegramBot = require('node-telegram-bot-api');

// ⚠️ TOKEN diambil dari ENV (AMAN UNTUK GITHUB)
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Simpan data sementara (nanti bisa ganti DB)
const users = {};

// Helper tanggal hari ini
function today() {
  return new Date().toISOString().split('T')[0];
}

// START
bot.onText(/\/start/, (msg) => {
  const id = msg.chat.id;

  if (!users[id]) {
    users[id] = { lastSpin: null, coins: 0 };
  }

  bot.sendMessage(
    id,
    `🎡 *Daily Spin Bot*

🎁 1x spin gratis setiap hari
📺 Mau spin lagi? → nonton iklan
🔄 Reset tiap hari

Tekan /spin untuk mulai`,
    { parse_mode: 'Markdown' }
  );
});

// SPIN
bot.onText(/\/spin/, (msg) => {
  const id = msg.chat.id;

  if (!users[id]) {
    users[id] = { lastSpin: null, coins: 0 };
  }

  if (users[id].lastSpin === today()) {
    bot.sendMessage(
      id,
      `⛔ Spin gratis sudah dipakai hari ini

📺 Mau spin lagi?
👉 Nonton iklan lalu klik /reward`
    );
    return;
  }

  const reward = Math.floor(Math.random() * 50) + 1;
  users[id].coins += reward;
  users[id].lastSpin = today();

  bot.sendMessage(
    id,
    `🎉 Kamu dapat *${reward} coin*!

💰 Total: ${users[id].coins}
⏰ Spin gratis reset besok`,
    { parse_mode: 'Markdown' }
  );
});

// REWARDED (IKLAN)
bot.onText(/\/reward/, (msg) => {
  const id = msg.chat.id;

  const reward = Math.floor(Math.random() * 30) + 1;
  users[id].coins += reward;

  bot.sendMessage(
    id,
    `📺 Iklan selesai!

🎁 Bonus *${reward} coin*
💰 Total: ${users[id].coins}`
  );
});

// LEADERBOARD
bot.onText(/\/leaderboard/, (msg) => {
  const sorted = Object.entries(users)
    .sort((a, b) => b[1].coins - a[1].coins)
    .slice(0, 5);

  let text = `🏆 *Leaderboard Mingguan*\n\n`;
  sorted.forEach((u, i) => {
    text += `${i + 1}. User ${u[0]} — ${u[1].coins} coin\n`;
  });

  bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

console.log('✅ Daily Spin Bot running...');
