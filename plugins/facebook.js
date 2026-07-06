import axios from 'axios';

// Axios default configuration
const axiosInstance = axios.create({
    timeout: 999999,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }
});

// Multiple working API endpoints (Updated 2025)
const API_SOURCES = [
    {
        name: 'Primary API',
        url: 'https://api.ryzendesu.vip/api/downloader/fbdl',
        params: (url) => ({ url: url }),
        extractData: (data) => ({
            hd: data?.data?.hd,
            sd: data?.data?.sd,
            title: data?.data?.title,
            thumbnail: data?.data?.thumbnail
        })
    },
    {
        name: 'Backup API 1',
        url: 'https://api.agatz.xyz/api/facebook',
        params: (url) => ({ url: url }),
        extractData: (data) => ({
            hd: data?.data?.[0]?.url || data?.data?.hd,
            sd: data?.data?.[1]?.url || data?.data?.sd,
            title: data?.data?.title,
            thumbnail: data?.data?.thumbnail
        })
    },
    {
        name: 'Backup API 2',
        url: 'https://api.alyachan.pro/api/fbdownload',
        params: (url) => ({ url: url }),
        extractData: (data) => ({
            hd: data?.data?.HD || data?.data?.videoUrl,
            sd: data?.data?.SD || data?.data?.videoUrl,
            title: data?.data?.title,
            thumbnail: data?.data?.thumbnail
        })
    },
    {
        name: 'Backup API 3',
        url: 'https://api.lolhuman.xyz/api/facebook',
        params: (url) => ({ url: url }),
        extractData: (data) => ({
            hd: data?.result?.[0] || data?.result?.hd,
            sd: data?.result?.[1] || data?.result?.sd,
            title: data?.result?.title,
            thumbnail: data?.result?.thumbnail
        })
    },
    {
        name: 'Backup API 4',
        url: 'https://api.miftah.biz.id/api/download/facebook',
        params: (url) => ({ url: url }),
        extractData: (data) => ({
            hd: data?.data?.video?.hd || data?.data?.video,
            sd: data?.data?.video?.sd || data?.data?.video,
            title: data?.data?.title,
            thumbnail: data?.data?.thumbnail
        })
    },
    {
        name: 'Backup API 5',
        url: 'https://api.neoxr.eu/api/fb',
        params: (url) => ({ url: url }),
        extractData: (data) => ({
            hd: data?.data?.HD || data?.data?.url,
            sd: data?.data?.SD || data?.data?.url,
            title: data?.data?.title,
            thumbnail: data?.data?.thumbnail
        })
    }
];

// Download function with multiple fallbacks
async function downloadFacebookVideo(url) {
    const errors = [];

    // Try all API sources
    for (const api of API_SOURCES) {
        try {
            console.log(`Trying ${api.name}...`);
            
            const response = await axiosInstance.get(api.url, {
                params: api.params(url),
                timeout: 999999
            });

            if (response.data && response.status === 200) {
                const videoData = api.extractData(response.data);
                
                // Validate the extracted data
                if (videoData.hd || videoData.sd) {
                    console.log(`✅ Success with ${api.name}`);
                    return {
                        success: true,
                        url: videoData.hd || videoData.sd,
                        sd: videoData.sd,
                        hd: videoData.hd,
                        title: videoData.title || 'Facebook Video',
                        thumbnail: videoData.thumbnail,
                        source: api.name
                    };
                }
            }
        } catch (error) {
            console.error(`❌ ${api.name} failed:`, error.message);
            errors.push(`${api.name}: ${error.message}`);
            continue;
        }
    }

    // If all APIs fail
    throw new Error(`All download methods failed. Please try again later.`);
}

// Validate Facebook URL
function validateFacebookUrl(url) {
    const patterns = [
        /^https?:\/\/(www\.)?facebook\.com\/.+/,
        /^https?:\/\/(fb\.watch|fb\.gg)\/.+/,
        /^https?:\/\/(m\.facebook\.com)\/.+/,
        /^https?:\/\/(web\.facebook\.com)\/.+/,
        /^https?:\/\/(mbasic\.facebook\.com)\/.+/,
        /^https?:\/\/facebook\.com\/reel\/.+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
}

// Extract Facebook URL from message
function extractFacebookUrl(args, message) {
    // First check args
    if (args && args.length > 0) {
        const joinedArgs = args.join(' ').trim();
        if (joinedArgs) return joinedArgs;
    }
    
    // Then check message text for URL
    const text = message?.message?.conversation || 
                 message?.message?.extendedTextMessage?.text || '';
    
    // Extract URL from text using regex
    const urlMatch = text.match(/(https?:\/\/(?:www\.)?(?:facebook\.com|fb\.watch|fb\.gg|m\.facebook\.com)\/\S+)/i);
    if (urlMatch) return urlMatch[0];
    
    // Check for Facebook video ID in text
    const fbIdMatch = text.match(/facebook\.com\/.*\/videos\/(\d+)/);
    if (fbIdMatch) return `https://www.facebook.com/watch/?v=${fbIdMatch[1]}`;
    
    return '';
}

// Main export with proper structure
export default {
    command: 'facebook',
    aliases: ['fb', 'fbdl', 'fbdownloader', 'fbd'],
    category: 'download',
    description: 'Download Facebook videos with multiple API fallbacks',
    usage: '.fb <facebook video link>\n\nExample:\n.fb https://fb.watch/xxxxx\n.fb https://facebook.com/user/video/123',
    
    async handler(sock, message, args, context) {
        const chatId = context?.chatId || message.key.remoteJid;
        const url = extractFacebookUrl(args, message);
        
        try {
            // Validation checks
            if (!url) {
                return await sock.sendMessage(chatId, {
                    text: `📘 *Facebook Video Downloader*\n\n` +
                          `⚡ *Usage:*\n` +
                          `.fb <facebook link>\n\n` +
                          `📝 *Example:*\n` +
                          `.fb https://fb.watch/xxxxx\n` +
                          `.fb https://facebook.com/user/video/123\n\n` +
                          `🔗 *Supported URLs:*\n` +
                          `• facebook.com\n` +
                          `• fb.watch\n` +
                          `• fb.gg\n` +
                          `• m.facebook.com`
                }, { quoted: message });
            }

            if (!validateFacebookUrl(url)) {
                return await sock.sendMessage(chatId, {
                    text: `❌ *Invalid Facebook URL!*\n\n` +
                          `Please send a valid Facebook video link.\n\n` +
                          `✅ *Valid formats:*\n` +
                          `• https://facebook.com/user/videos/123\n` +
                          `• https://fb.watch/xxxxx\n` +
                          `• https://m.facebook.com/user/videos/123`
                }, { quoted: message });
            }

            // Send processing reaction
            await sock.sendMessage(chatId, {
                react: { text: '⏳', key: message.key }
            });

            // Send processing message
            const processingMsg = await sock.sendMessage(chatId, {
                text: `⏳ *Processing Your Request...*\n\n` +
                      `🔗 *URL:* ${url}\n` +
                      `🔄 *Status:* Trying multiple sources...\n` +
                      `⏱ *Timeout:* 30 seconds\n\n` +
                      `Please wait...`
            }, { quoted: message });

            // Download video using multiple methods
            const videoData = await downloadFacebookVideo(url);

            if (!videoData || !videoData.success || !videoData.url) {
                throw new Error('No downloadable video found from any source');
            }

            // Update reaction to uploading
            await sock.sendMessage(chatId, {
                react: { text: '⬆️', key: message.key }
            });

            // Delete processing message
            if (processingMsg?.key) {
                try {
                    await sock.sendMessage(chatId, {
                        delete: processingMsg.key
                    });
                } catch (e) {
                    // Ignore delete errors
                }
            }

            // Prepare caption
            const caption = `✅ *Download Complete!*\n\n` +
                          `📘 *Facebook Video*\n` +
                          `🎬 *Title:* ${videoData.title}\n` +
                          `📊 *Quality:* ${videoData.hd ? 'HD Available' : 'SD'}\n` +
                          `🔧 *Source:* ${videoData.source}\n` +
                          `🔗 *URL:* ${url}\n\n` +
                          `> *Powered by Your Bot*`;

            // Send the video
            await sock.sendMessage(chatId, {
                video: { url: videoData.url },
                mimetype: 'video/mp4',
                caption: caption,
                gifPlayback: false,
                fileName: `${videoData.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`
            }, { quoted: message });

            // Success reaction
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            });

        } catch (error) {
            console.error('Facebook downloader error:', error);
            
            // Error reaction
            await sock.sendMessage(chatId, {
                react: { text: '❌', key: message.key }
            });

            // Detailed error message
            const errorMessage = `❌ *Download Failed!*\n\n` +
                               `🔍 *Error:* ${error.message}\n\n` +
                               `💡 *Troubleshooting Tips:*\n` +
                               `1️⃣ Make sure the video is public\n` +
                               `2️⃣ Check if the link is still active\n` +
                               `3️⃣ Try again in 2-3 minutes\n` +
                               `4️⃣ The video might be private/deleted\n` +
                               `5️⃣ Try a different Facebook video\n\n` +
                               `🔄 *Command:* .fb <new link>`;

            await sock.sendMessage(chatId, {
                text: errorMessage
            }, { quoted: message });
        }
    }
};