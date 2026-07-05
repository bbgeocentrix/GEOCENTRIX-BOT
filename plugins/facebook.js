import fbDownloader from '@xaviabot/fb-downloader';

export default {
    command: 'fb',
    aliases: ['facebook', 'fbvideo', 'fbdl'],
    category: 'download',
    description: 'Download Facebook videos & reels',
    usage: '.fb <facebook url>',

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args.join(' ').trim();

        if (!url) {
            return sock.sendMessage(chatId, {
                text: '📹 Send a Facebook video or Reel link.'
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, {
                text: '⏳ Downloading Facebook video...'
            }, { quoted: message });

            const result = await fbDownloader(url);

            const video =
                result.hd ||
                result.sd ||
                result.url;

            if (!video) {
                throw new Error('No downloadable video found.');
            }

            await sock.sendMessage(chatId, {
                video: { url: video },
                mimetype: 'video/mp4',
                fileName: 'facebook.mp4',
                caption: `🎬 ${result.title || 'Facebook Video'}`
            }, { quoted: message });

        } catch (err) {
            console.error(err);

            await sock.sendMessage(chatId, {
                text: `❌ Download failed!\n${err.message}`
            }, { quoted: message });
        }
    }
};