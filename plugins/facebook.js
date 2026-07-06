import axios from 'axios';
import * as cheerio from 'cheerio';

// Axios default configuration
const axiosInstance = axios.create({
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
             'Accept': 'application/json, text/plain, */*'
    }
});

export default {
    command: 'facebook',
    aliases: ['fb', 'fbdl'],
    category: 'download',
    description: 'Download Facebook videos',
    usage: '.fb <facebook video link>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args.join(' ') ||
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text;
        try {
            if (!url) {
                return await sock.sendMessage(chatId, { text: '📘 *Facebook Downloader*\n\nUsage:\n.fb <facebook video link>' }, { quoted: message });
            }
            if (!/facebook\.com|fb\.watch/i.test(url)) {
                return await sock.sendMessage(chatId, { text: '❌ Invalid Facebook link.\nPlease send a valid Facebook video URL.' }, { quoted: message });
            }
            await sock.sendMessage(chatId, {
                react: { text: '🔄', key: message.key }
            });
// Multiple working API endpoints (2024-2025)
const API_SOURCES = [
    {
        name: 'Primary API',
        url: 'https://api.ryzendesu.vip/api/downloader/fbdl',
        extractData: (data) => ({
            hd: data?.data?.hd,
            sd: data?.data?.sd,
            thumbnail: data?.data?.thumbnail
        }),
        headers: {}
    },
    {
        name: 'Backup API 1',
        url: 'https://api.agatz.xyz/api/facebook',
        extractData: (data) => ({
            hd: data?.data?.[0]?.url || data?.data?.hd,
            sd: data?.data?.[1]?.url || data?.data?.sd,
            thumbnail: data?.data?.thumbnail
        }),
        headers: {}
    },
    {
        name: 'Backup API 2',
        url: 'https://api.alyachan.pro/api/fbdownload',
        extractData: (data) => ({
            hd: data?.data?.HD || data?.data?.videoUrl,
            sd: data?.data?.SD || data?.data?.videoUrl,
            thumbnail: data?.data?.thumbnail
        }),
        headers: { 'apikey': 'alyachan' }
    },
    {
        name: 'Backup API 3',
        url: 'https://api.lolhuman.xyz/api/facebook',
        extractData: (data) => ({
            hd: data?.result?.[0] || data?.result?.hd,
            sd: data?.result?.[1] || data?.result?.sd,
            thumbnail: data?.result?.thumbnail
        }),
        headers: { 'apikey': 'GataDios' }
    },
    {
        name: 'Backup API 4',
        url: 'https://api.miftah.biz.id/api/download/facebook',
        extractData: (data) => ({
            hd: data?.data?.video?.hd || data?.data?.video,
            sd: data?.data?.video?.sd || data?.data?.video,
            thumbnail: data?.data?.thumbnail
        }),
        headers: {}
    }
];

// Direct scraping method (no API dependency)
async function scrapeFacebookVideo(fbUrl) {
    try {
        // Method 1: Try to get video from page meta tags
        const response = await axiosInstance.get(fbUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.facebook.com/',
                'Cookie': 'locale=en_US;'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Try to find video URL from meta tags
        let videoUrl = $('meta[property="og:video"]').attr('content') ||
                      $('meta[property="og:video:url"]').attr('content') ||
                      $('meta[property="og:video:secure_url"]').attr('content');

        // Try to find from script tags
        if (!videoUrl) {
            const scripts = $('script').map((i, el) => $(el).html()).get();
            for (const script of scripts) {
                if (!script) continue;
                
                // Look for SD/HD video URLs in scripts
                const hdMatch = script.match(/"browser_native_hd_url":"([^"]+)"/);
                const sdMatch = script.match(/"browser_native_sd_url":"([^"]+)"/);
                const playableMatch = script.match(/"playable_url":"([^"]+)"/);
                const qualityMatch = script.match(/"playable_url_quality_hd":"([^"]+)"/);
                
                if (hdMatch || sdMatch || playableMatch || qualityMatch) {
                    return {
                        hd: hdMatch?.[1] || qualityMatch?.[1] || null,
                        sd: sdMatch?.[1] || playableMatch?.[1] || null,
                        thumbnail: $('meta[property="og:image"]').attr('content') || null
                    };
                }
            }
        }

        if (videoUrl) {
            return {
                hd: videoUrl,
                sd: videoUrl,
                thumbnail: $('meta[property="og:image"]').attr('content') || null
            };
        }

        return null;
    } catch (error) {
        console.error('Scraping failed:', error.message);
        return null;
    }
}

// Main download function with multiple fallbacks
async function downloadFacebookVideo(url) {
    const errors = [];

    // Try all API sources first
    for (const api of API_SOURCES) {
        try {
            console.log(`Trying ${api.name}...`);
            
            const response = await axiosInstance.get(api.url, {
                params: { url: url },
                headers: { ...api.headers },
                timeout: 30000
            });

            if (response.data && response.status === 200) {
                const videoData = api.extractData(response.data);
                
                // Validate the extracted data
                if (videoData.hd || videoData.sd) {
                    console.log(`✅ Success with ${api.name}`);
                    return {
                        url: videoData.hd || videoData.sd,
                        sd: videoData.sd,
                        hd: videoData.hd,
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

    // If all APIs fail, try direct scraping
    console.log('All APIs failed. Trying direct scraping...');
    const scrapedData = await scrapeFacebookVideo(url);
    
    if (scrapedData && (scrapedData.hd || scrapedData.sd)) {
        console.log('✅ Direct scraping successful');
        return {
            url: scrapedData.hd || scrapedData.sd,
            sd: scrapedData.sd,
            hd: scrapedData.hd,
            thumbnail: scrapedData.thumbnail,
            source: 'Direct Scraping'
        };
    }

    throw new Error(`All methods failed. Errors: ${errors.join(', ')}`);
}

// Validate Facebook URL
function validateFacebookUrl(url) {
    const patterns = [
        /^https?:\/\/(www\.)?facebook\.com\/.+/,
        /^https?:\/\/(fb\.watch|fb\.gg)\/.+/,
        /^https?:\/\/(m\.facebook\.com)\/.+/,
        /^https?:\/\/(web\.facebook\.com)\/.+/,
        /^https?:\/\/(mbasic\.facebook\.com)\/.+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
}

// Extract Facebook URL from message
function extractFacebookUrl(args, message) {
    // First check args
    if (args && args.length > 0) {
        return args.join(' ').trim();
    }
    
    // Then check message text
    const text = message?.message?.conversation || 
                 message?.message?.extendedTextMessage?.text || '';
    
    // Extract URL from text using regex
    const urlMatch = text.match(/(https?:\/\/(?:www\.)?(?:facebook\.com|fb\.watch|fb\.gg|m\.facebook\.com)\/\S+)/i);
    return urlMatch ? urlMatch[0] : '';
}

// Main export
export default {
    command: 'facebook',
    aliases: ['fb', 'fbdl', 'fbdownloader', 'fbd'],
    category: 'download',
    description: 'Download Facebook videos with multiple fallback methods',
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
                          `• m.facebook.com`
                }, { quoted: message });
            }

            if (!validateFacebookUrl(url)) {
                return await sock.sendMessage(chatId, {
                    text: `❌ *Invalid Facebook URL!*\n\n` +
                          `Please send a valid Facebook video link.\n\n` +
                          `✅ *Valid formats:*\n` +
                          `• https://facebook.com/...\n` +
                          `• https://fb.watch/...\n` +
                          `• https://m.facebook.com/...`
                }, { quoted: message });
            }

            // Send processing reaction
            await sock.sendMessage(chatId, {
                react: { text: '⏳', key: message.key }
            });

            // Send processing message
            const processingMsg = await sock.sendMessage(chatId, {
                text: `⏳ *Processing...*\n\n` +
                      `🔗 ${url}\n\n` +
                      `🔄 Trying multiple sources...\n` +
                      `⏱ This may take up to 30 seconds`
            }, { quoted: message });

            // Download video using multiple methods
            const videoData = await downloadFacebookVideo(url);

            if (!videoData || !videoData.url) {
                throw new Error('No downloadable video found from any source');
            }

            // Update reaction
            await sock.sendMessage(chatId, {
                react: { text: '⬆️', key: message.key }
            });

            // Delete processing message
            if (processingMsg?.key) {
                await sock.sendMessage(chatId, {
                    delete: processingMsg.key
                });
            }

            // Send the video
            const caption = `✅ *Download Complete!*\n\n` +
                          `📘 *Source:* ${videoData.source}\n` +
                          `📊 *Quality:* ${videoData.hd ? 'HD Available' : 'SD'}\n` +
                          `🔗 *URL:* ${url}\n\n` +
                          `> *Powered by YourBot*`;

            await sock.sendMessage(chatId, {
                video: { url: videoData.url },
                mimetype: 'video/mp4',
                caption: caption,
                gifPlayback: false,
                fileName: 'facebook_video.mp4'
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
                               `💡 *Tips to fix:*\n` +
                               `• Make sure the video is public\n` +
                               `• Check if the link is valid\n` +
                               `• Try again in a few minutes\n` +
                               `• The video might be private/deleted\n\n` +
                               `🔄 *Try another video or method*`;

            await sock.sendMessage(chatId, {
                text: errorMessage
            }, { quoted: message });
        }
    }
};