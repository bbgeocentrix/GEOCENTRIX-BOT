import 'dotenv/config';
const _prefixes = process.env.PREFIXES ? process.env.PREFIXES.split(',') : ['/'];
const config = {
    // Bot Identity
    botName: process.env.BOT_NAME || '🌎GEOCENTRIX-BOT🌎',
    botOwner: process.env.BOT_OWNER || 'BIG BOSS',
    ownerNumber: process.env.OWNER_NUMBER || '94783586382',
    author: process.env.AUTHOR || '🌎GEOCENTRIX🌎',
    packname: process.env.PACKNAME || '🌎GEOCENTRIX🌎',
    description: process.env.DESCRIPTION || 'High performance multi-device WhatsApp bot',
    version: '6.0.0',
    // Bot Config
    prefixes: _prefixes,
    prefix: _prefixes[0],
    commandMode: process.env.COMMAND_MODE || 'private',
    timeZone: process.env.TIMEZONE || 'Asia/Karachi',
    // Links
    channelLink: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VafUaD2DeON884lZ620e',
    updateZipUrl: process.env.UPDATE_URL || 'https://github.com/bbgeocentrix/MEGA-MD/archive/refs/heads/main.zip',
    ytChannel: process.env.YT_CHANNEL || 'BIG BOSS',
    // Session
    sessionId: process.env.SESSION_ID || 'MEGA-MD_661fc40e66c95828c322e604c5ff1728',
    pairingNumber: process.env.PAIRING_NUMBER || '94783586382',
    // Performance
    port: Number(process.env.PORT) || 5000,
    maxStoreMessages: Number(process.env.MAX_STORE_MESSAGES) || 50,
    tempCleanupInterval: Number(process.env.CLEANUP_INTERVAL) || 5 * 60 * 60 * 1000,
    storeWriteInterval: Number(process.env.STORE_WRITE_INTERVAL) || 10000,
    // API Keys
    giphyApiKey: process.env.GIPHY_API_KEY || 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
    removeBgKey: process.env.REMOVEBG_KEY || '',
    // Warn system
    warnCount: 3,
    // External APIs
    APIs: {
        xteam: 'https://api.xteam.xyz',
        dzx: 'https://api.dhamzxploit.my.id',
        lol: 'https://api.lolhuman.xyz',
        violetics: 'https://violetics.pw',
        neoxr: 'https://api.neoxr.my.id',
        zenzapis: 'https://zenzapis.xyz',
        akuari: 'https://api.akuari.my.id',
        akuari2: 'https://apimu.my.id',
        nrtm: 'https://fg-nrtm.ddns.net',
        fgmods: 'https://api-fgmods.ddns.net'
    },
    APIKeys: {
        'https://api.xteam.xyz': 'd90a9e986e18778b',
        'https://api.lolhuman.xyz': '85faf717d0545d14074659ad',
        'https://api.neoxr.my.id': process.env.NEOXR_KEY || 'yourkey',
        'https://violetics.pw': 'beta',
        'https://zenzapis.xyz': process.env.ZENZAPIS_KEY || 'yourkey',
        'https://api-fgmods.ddns.net': 'fg-dylux'
    }
};
export default config;
