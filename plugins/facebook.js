import axios from 'axios';

const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
const API_KEY = 'xbps-install-Syu';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const downloadWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios.get(DL_API, {
                params: {
                    apiKey: API_KEY,
                    url
                },
                timeout: 120000
            });

            if (data?.data?.downloadUrl) {
                return data.data;
            }

            throw new Error('No download URL');
        } catch (err) {
            if (i === retries - 1) throw err;

            console.log(`Retry ${i + 1}...`);
            await wait(1000);
        }
    }
};

export default {
    command: 'fb',
    aliases: ['facebook', 'fbvideo', 'facebookdl'],
    category: 'download',
    description: 'Download Facebook videos',
    usage: '.fb <facebook video url>',

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args[0];

        if (!url) {
            return sock.sendMessage(chatId, {
                text: '📹 *Send a Facebook video link.*\n\nExample:\n.fb https://www.facebook.com/share/v/xxxxxxxx/'
            }, { quoted: message });
        }

        const fbRegex =
            /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|m\.facebook\.com)\//i;

        if (!fbRegex.test(url)) {
            return sock.sendMessage(chatId, {
                text: '❌ Invalid Facebook video link!'
            }, { quoted: message });
        }

        try {

            await sock.sendMessage(chatId, {
                text: '⏳ Downloading Facebook video...'
            }, { quoted: message });

            const video = await downloadWithRetry(url);

            await sock.sendMessage(chatId, {
                video: {
                    url: video.downloadUrl
                },
                mimetype: 'video/mp4',
                fileName: `${video.title || 'facebook-video'}.mp4`,
                caption: `🎬 *${video.title || 'Facebook Video'}*\n\n> *_Downloaded by GEOCENTRIX-BOT_*`
            }, { quoted: message });

        } catch (err) {

            console.error(err);

            await sock.sendMessage(chatId, {
                text: `❌ Download failed!\nReason: ${err.message}`
            }, { quoted: message });

        }
    }
};