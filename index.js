// 📦 Importation des modules
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Telegraf, Markup } = require('telegraf');
const P = require('pino');
const fs = require('fs-extra');
const axios = require('axios');

// 🔑 Token Telegram (rempli dans Codespaces ENV ou fichier config.js)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || require('./config').TELEGRAM_TOKEN;
const bot = new Telegraf(TELEGRAM_TOKEN);

// 🧠 AUTH WhatsApp
const WA_SESS = './auth_info_multi';

// ⏳ Connexion WhatsApp via CODE DE JUMELAGE
async function startWA() {
  const { state, saveCreds } = await useMultiFileAuthState(WA_SESS);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    printQRInTerminal: false,
    browser: ['DEXBOT XMD', 'Chrome', '10.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, pairingCode } = update;

    if (connection === 'open') {
      console.log('✅ WhatsApp connecté avec succès !');
    }

    if (connection === 'close') {
      console.log('❌ Déconnecté. Tentative de reconnexion...');
      startWA();
    }

    if (pairingCode) {
      console.log(`📲 Code de jumelage : ${pairingCode}`);
      await bot.telegram.sendMessage(OWNER_TELEGRAM_ID, `📲 *Code de jumelage WhatsApp :*\n\`\`\`${pairingCode}\`\`\``, {
        parse_mode: "Markdown"
      });
    }
  });

  // Commande .menu sur WhatsApp
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (text === '.menu') {
      const menuFr = `╔══🔰 *MENU DEXBOT XMD* 🔰══
║
║ 📌 *Commandes Principales:*
║ ⤷ .menu
║ ⤷ .help
║ ⤷ .gpt
║ ⤷ .play
║
║ 👮 *Commandes Groupe:*
║ ⤷ .tagall
║ ⤷ .hidetag
║ ⤷ .kick
║ ⤷ .promote
║ ⤷ .demote
║
║ 🎵 *Média:*
║ ⤷ .yt
║ ⤷ .mp3
║ ⤷ .image
║
╚═════════════════╝`;

      await sock.sendMessage(from, { text: menuFr });
    }
  });
}

// 🔹 Menu stylé Telegram
bot.start((ctx) => {
  ctx.reply(`🔹 *DEXBOT V1*

🤖 Bienvenue sur le bot officiel DEXBOT XMD !

🧩 Commandes disponibles :

📌 /connect - Lancer jumelage WhatsApp
❌ /delconnect - Supprimer la session WhatsApp
🔥 /DexCrash 509xxxxx
💀 /DexKill 509xxxxx
`, { parse_mode: "Markdown" });
});

// 🔸 Lancer jumelage WhatsApp via /connect
const OWNER_TELEGRAM_ID = 8115416221; // Remplace par ton ID
bot.command('connect', async (ctx) => {
  if (ctx.from.id !== OWNER_TELEGRAM_ID) return ctx.reply('🚫 Accès refusé.');
  ctx.reply('⏳ Connexion à WhatsApp en cours...');
  startWA();
});

// 🔸 Supprimer auth WhatsApp
bot.command('delconnect', async (ctx) => {
  if (ctx.from.id !== OWNER_TELEGRAM_ID) return ctx.reply('🚫 Accès refusé.');
  try {
    await fs.remove(WA_SESS);
    ctx.reply('✅ Session WhatsApp supprimée.');
  } catch {
    ctx.reply('❌ Impossible de supprimer la session.');
  }
});

// 🚀 Lancer le bot Telegram
bot.launch().then(() => {
  console.log('✅ Bot Telegram lancé !');
})
