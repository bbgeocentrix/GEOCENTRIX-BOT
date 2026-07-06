import axios from 'axios';
import * as cheerio from 'cheerio';

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

// Working API endpoints with proper error handling
const API_SOURCES = [
    {
        name: 'API 1',
        url: 'fdown.net',
        params: (url) => ({ url: url }),
        extractData: (data) => ({
            hd: data?.data?.hd,
            sd: data?.data?.sd,
            title: data?.data?.title || 'Facebook Video',
            thumbnail: data?.data?.thumbnail
        })
    },
    {
        name: 'API 2',
        url: 'snapsave.app',
        params: (url) => ({ url: url }),
        extractData: (data) => ({
            hd: data?.hd_url || data?.url,
            sd: data?.sd_url || data?.url,
            title: data?.title || 'Facebook Video',
            thumbnail: data?.thumbnail
        })
    }
];

// Direct download method using fdown.net
async function downloadWithFdown(url) {
    try {
        const response = await axiosInstance.post('https://fdown.net/download.php', 
            `URLz=${encodeURIComponent(url)}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Origin': 'https://fdown.net',
                    'Referer': 'https://fdown.net/'
                }
            }
        );

        const $ = cheerio.load(response.data);
        const hdLink = $('#hdlink').attr('href');
        const sdLink = $('#sdlink').attr('href');
        const title = $('#videoTitle').text().trim();

        if (hdLink || sdLink) {
            return {
                success: true,
                url: hdLink || sdLink,
                sd: sdLink,
                hd: hdLink,
                title: title || 'Facebook Video',
                source: 'fdown.net'
            };
        }
    } catch (error) {
        console.error('fdown.net error:', error.message);
    }
    return null;
}

// Direct download method using snapsave.app
async function downloadWithSnapsave(url) {
    try {
        const response = await axiosInstance.get('https://snapsave.app/action.php', {
            params: { url: url },
            headers: {
                'Referer': 'https://snapsave.app/'
            }
        });

        if (response.data && response.data.url) {
            return {
                success: true,
                url: response.data.url,
                title: response.data.title || 'Facebook Video',
                thumbnail: response.data.thumbnail,
                source: 'snapsave.app'
            };
        }
    } catch (error) {
        console.error('snapsave error:', error.message);
    }
    return null;
}

// Download function with multiple fallbacks
async function downloadFacebookVideo(url) {
    // Try direct methods first
    console.log('Trying direct download methods...');
    
    // Try fdown.net
    const fdownResult = await downloadWithFdown(url);
    if (fdownResult?.success && fdownResult.url) {
        return fdownResult;
    }

    // Try snapsave
    const snapsaveResult = await downloadWithSnapsave(url);
    if (snapsaveResult?.success && snapsaveResult.url) {
        return snapsaveResult;
    }

    // Try API endpoints
    for (const api of API_SOURCES) {
        try {
            console.log(`Trying ${api.name}...`);
            
            const response = await axiosInstance.get(api.url, {
                params: api.params(url),
                timeout: 999999
            });

            if (response.data && response.status === 200) {
                const videoData = api.extractData(response.data);
                
                if (videoData.hd || videoData.sd) {
                    console.log(`✅ Success with ${api.name}`);
                    return {
                        success: true,
                        url: videoData.hd || videoData.sd,
                        sd: videoData.sd,
                        hd: videoData.hd,
                        title: videoData.title,
                        thumbnail: videoData.thumbnail,
                        source: api.name
                    };
                }
            }
        } catch (error) {
            console.error(`❌ ${api.name} failed:`, error.message);
            continue;
        }
    }

    throw new Error('Unable to download video. The link might be private or expired.');
}

// Validate Facebook URL
function validateFacebookUrl(url) {
    const patterns = [
        /^https?:\/\/(www\.)?facebook\.com\/.+/,
        /^https?:\/\/(fb\.watch|fb\.gg)\/.+/,
        /^https?:\/\/(m\.facebook\.com)\/.+/,
        /^https?:\/\/(web\.facebook\.com)\/.+/,
        /^https?:\/\/(mbasic\.facebook\.com)\/.+/,
        /^https?:\/\/facebook\.com\/reel\/.+/,
        /^https?:\/\/(www\.)?facebook\.com\/share\/.+/,
        /^https?:\/\/www\.facebook\.com\/reel\/.+/
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
                          `📝 *Examples:*\n` +
                          `• .fb https://fb.watch/xxxxx\n` +
                          `• .fb https://facebook.com/user/video/123\n` +
                          `• .fb https://www.facebook.com/reel/xxxxx\n\n` +
                          `🔗 *Supported URLs:*\n` +
                          `• facebook.com/videos\n` +
                          `• fb.watch\n` +
                          `• facebook.com/reel\n` +
                          `• facebook.com/share`
                }, { quoted: message });
            }

            if (!validateFacebookUrl(url)) {
                return await sock.sendMessage(chatId, {
                    text: `❌ *Invalid Facebook URL!*\n\n` +
                          `Please send a valid Facebook video link.\n\n` +
                          `✅ *Valid formats:*\n` +
                          `• https://facebook.com/user/videos/123\n` +
                          `• https://fb.watch/xxxxx\n` +
                          `• https://www.facebook.com/reel/xxxxx\n` +
                          `• https://facebook.com/share/r/xxxxx`
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
                      `🔄 *Status:* Fetching video information...\n` +
                      `⏱ *Please wait...*`
            }, { quoted: message });

            // Download video
            const videoData = await downloadFacebookVideo(url);

            if (!videoData || !videoData.url) {
                throw new Error('No downloadable video found');
            }

            // Update reaction
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
                          `🔧 *Source:* ${videoData.source}\n\n` +
                          `> Powered by Your Bot`;

            // Send video
            await sock.sendMessage(chatId, {
                video: { url: videoData.url },
                mimetype: 'video/mp4',
                caption: caption,
                gifPlayback: false
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

            // Error message
            const errorMessage = `❌ *Download Failed!*\n\n` +
                               `🔍 *Error:* ${error.message}\n\n` +
                               `💡 *Possible Reasons:*\n` +
                               `1️⃣ The video might be private\n` +
                               `2️⃣ The link has expired\n` +
                               `3️⃣ The video was deleted\n` +
                               `4️⃣ Region restrictions apply\n\n` +
                               `🔄 Try with a different video or try again later.\n` +
                               `📝 Command: .fb <new link>`;

            await sock.sendMessage(chatId, {
                text: errorMessage
            }, { quoted: message });
        }
    }
};