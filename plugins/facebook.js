import axios from 'axios';

export default {
    command: 'facebook',
    aliases: ['fb', 'fbdl'],
    category: 'download',
    description: 'Download Facebook videos',
    usage: '.fb <facebook link>',
    
    async handler(sock, message, args, context) {
        const chatId = context?.chatId || message.key.remoteJid;
        
        // Get URL from args or message
        let url = '';
        if (args && args.length > 0) {
            url = args.join(' ').trim();
        } else {
            const text = message?.message?.conversation || 
                        message?.message?.extendedTextMessage?.text || '';
            const match = text.match(/(https?:\/\/[^\s]+)/);
            url = match ? match[1] : '';
        }
        
        // Check if URL exists
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: `❌ Please provide a Facebook video link!\n\nUsage: .fb <link>\nExample: .fb https://fb.watch/xxxxx` 
            }, { quoted: message });
        }
        
        // Validate Facebook URL
        if (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('fb.gg')) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Invalid Facebook URL!' 
            }, { quoted: message });
        }
        
        try {
            // Send processing message
            await sock.sendMessage(chatId, { 
                text: '⏳ Downloading video... Please wait' 
            }, { quoted: message });
            
            // Try multiple APIs
            let videoUrl = null;
            let videoTitle = 'Facebook Video';
            
            // API 1: Try ryzendesu
            try {
                const res = await axios.get('https://api.ryzendesu.vip/api/downloader/fbdl', {
                    params: { url: url },
                    timeout: 30000
                });
                
                if (res.data?.data?.hd) {
                    videoUrl = res.data.data.hd;
                    videoTitle = res.data.data.title || 'Facebook Video';
                } else if (res.data?.data?.sd) {
                    videoUrl = res.data.data.sd;
                    videoTitle = res.data.data.title || 'Facebook Video';
                }
            } catch (e) {
                console.log('API 1 failed, trying next...');
            }
            
            // API 2: Try agatz if first failed
            if (!videoUrl) {
                try {
                    const res = await axios.get('https://api.agatz.xyz/api/facebook', {
                        params: { url: url },
                        timeout: 30000
                    });
                    
                    if (res.data?.data && res.data.data.length > 0) {
                        videoUrl = res.data.data[0].url;
                        videoTitle = res.data.data[0].title || 'Facebook Video';
                    }
                } catch (e) {
                    console.log('API 2 failed, trying next...');
                }
            }
            
            // API 3: Try alyachan if still no video
            if (!videoUrl) {
                try {
                    const res = await axios.get('https://api.alyachan.pro/api/fbdownload', {
                        params: { url: url },
                        timeout: 30000
                    });
                    
                    if (res.data?.data?.HD) {
                        videoUrl = res.data.data.HD;
                    } else if (res.data?.data?.SD) {
                        videoUrl = res.data.data.SD;
                    }
                } catch (e) {
                    console.log('API 3 failed...');
                }
            }
            
            // Check if we got a video URL
            if (!videoUrl) {
                throw new Error('Could not download video from any source');
            }
            
            // Send the video
            await sock.sendMessage(chatId, {
                video: { url: videoUrl },
                caption: `✅ ${videoTitle}\n\nDownloaded successfully!`,
                mimetype: 'video/mp4'
            }, { quoted: message });
            
        } catch (error) {
            console.error('Error:', error.message);
            await sock.sendMessage(chatId, { 
                text: `❌ Failed to download!\n\nError: ${error.message}\n\nTry again later or use a different link.` 
            }, { quoted: message });
        }
    }
};