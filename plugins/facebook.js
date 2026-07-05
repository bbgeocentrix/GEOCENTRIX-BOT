import getFBInfo from '@renpwn/fb-downloader';
import from 'btch-downloader';

export default {
    command: 'fb',
    aliases: ['facebook', 'fbdl', 'reel'],
    category: 'download',

    async handler(sock, message, args, context) {

        const chatId = context.chatId || message.key.remoteJid;
        const url = args.join(' ').trim();

        if (!url) {
            return sock.sendMessage(chatId, {
                text: 'Example:\n.fb https://facebook.com/...'
            }, { quoted: message });
        }

        try {

            await sock.sendMessage(chatId, {
                text: '⏳ Downloading...'
            }, { quoted: message });

            const res = await getFBInfo(url);

            const video = res.hd || res.sd;

            if (!video)
                throw new Error('Video not found');

            await sock.sendMessage(chatId, {
                video: { url: video },
                mimetype: 'video/mp4',
                fileName: `${res.title || 'facebook'}.mp4`,
                caption: `🎬 ${res.title || 'Facebook Video'}`
            }, { quoted: message });

        } catch (e) {

            await sock.sendMessage(chatId, {
                text: `❌ ${e.message}`
            }, { quoted: message });

        }

    }
};