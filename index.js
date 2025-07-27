// 🔷 DEXBOT XMD - MULTI DEVICE PAIRING
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const P = require('pino');
const axios = require('axios');

// 🧠 TOKEN TELEGRAM OU
const bot = new Telegraf('VOTRE_TOKEN_TELEGRAM_ICI');

// 🔐 AUTHPATH POU BAILEYS
const { state, saveCreds } = await useMultiFileAuthState('./session');

// 🌐 Lanse WhatsApp
async function startWhatsapp() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    browser: ['DEXBOT XMD', 'Chrome', '1.0']
  });

  sock.ev.on('creds.update', saveCreds);

  // 📥 Reponn a .menu sou WhatsApp
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
    const from = m.key.remoteJid;

    if (text === '.menu') {
      await sock.sendMessage(from, {
        image: { url: 'https://telegra.ph/file/93c63a213f75f53608ddc.jpg' },
        caption:
`╭──〔 *📱 DEXBOT XMD - MENU* 〕──⬣
│
│✨ *MENU PRINCIPAL*
│• .menu
│• .ping
│• .owner
│
│👥 *MENU GROUPES*
│• .hidetag
│• .tagall
│• .promote
│• .demote
│• .kick
│• .antilink
│• .antistickers
│
│🤖 *MENU IA*
│• .chatgpt Bonjour le monde
│• .play Bonjour
│
│🔎 *MENU RECHERCHE*
│• .yt nom_video
│• .image mot_clé
│
╰─────────────⬣`
      });
    }
  });
}

// 🚀 Telegram Menu Stylé
bot.start((ctx) => {
  ctx.reply(
    `🔹 *DEXBOT V1*\n\n` +
    `/connect 509XXXXXX\n` +
    `/delconnect 509XXXXXX\n\n` +
    `🔸 *PREM-MENU*\n` +
    `/DexCrash 509XXXXXX\n` +
    `/DexKill 509XXXXXX`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('menu', (ctx) => {
  ctx.reply(
    `╭──〔 *🤖 MENU TELEGRAM - DEXBOT* 〕───⬣
│
│/connect 509XXXXXX
│/delconnect 509XXXXXX
│
│🔸 *PREM-MENU*:
│/DexCrash 509XXXXXX
│/DexKill 509XXXXXX
╰─────────────⬣`, { parse_mode: 'Markdown' }
  );
});

// 🟢 Lanse Tou
startWhatsapp().catch(console.error);
bot.launch().then(() => console.log('🤖 BOT TELEGRAM AK WHATSAPP LIVE!'))
