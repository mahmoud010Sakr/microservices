import os from 'os';
import geoip from 'geoip-lite';
import requestIp from 'request-ip';

const getLocationFromIp = (ip) => {
    try {
        if (!ip || ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') {
            return { location: 'Localhost' };
        }
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }
        
        const geo = geoip.lookup(ip);
        if (!geo) return { ip, location: 'Unknown' };
        
        return {
            ip,
            country: geo.country,
            region: geo.region,
            city: geo.city,
            timezone: geo.timezone,
            location: [geo.city, geo.region, geo.country].filter(Boolean).join(', ')
        };
    } catch (error) {
        console.error('Error getting location from IP:', error);
        return { ip, error: 'Failed to get location' };
    }
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getRequestSize = (req) => {
    const contentLength = req.headers['content-length'];
    return contentLength ? parseInt(contentLength, 10) : 0;
};

const getResponseSize = (res) => {
    const contentLength = res.getHeader('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
};

const getMemoryUsage = () => {
    const used = process.memoryUsage();
    return {
        heapUsed: formatBytes(used.heapUsed),
        heapTotal: formatBytes(used.heapTotal),
        rss: formatBytes(used.rss),
        memoryLoad: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
    };
};

const getUserAgent = (req) => {
    try {
        const ua = req.headers['user-agent'];
        if (!ua) return 'unknown';
        
        const isMobile = /mobile/i.test(ua);
        const browser = 
            /chrome/i.test(ua) ? 'Chrome' :
            /firefox/i.test(ua) ? 'Firefox' :
            /safari/i.test(ua) ? 'Safari' :
            /edge/i.test(ua) ? 'Edge' :
            'Other';
            
        return `${browser}${isMobile ? ' Mobile' : ''}`;
    } catch (error) {
        return 'unknown';
    }
};

export const logPerformance = (req, res, next) => {
    const startTime = process.hrtime();
    const requestStart = new Date();
    const originalEnd = res.end;
    const originalWrite = res.write;
    let responseSize = 0;
    
    // Get client IP
    const clientIp = requestIp.getClientIp(req) || req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const locationInfo = getLocationFromIp(clientIp);

    res.write = function (chunk, ...args) {
        if (chunk) {
            responseSize += chunk.length;
        }
        return originalWrite.apply(res, [chunk, ...args]);
    };

    res.end = function (...args) {
        try {
            const [diffSeconds, diffNanoseconds] = process.hrtime(startTime);
            const durationMs = (diffSeconds * 1000) + (diffNanoseconds / 1e6);
            
            if (args[0]) {
                responseSize += args[0].length;
            }

            const egyptTime = requestStart.toLocaleString('en-US', {
                timeZone: 'Africa/Cairo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const logDetails = {
                timestamp: egyptTime,
                env: process.env.NODE_ENV || 'development',
                method: req.method,
                url: req.originalUrl,
                route: req.route?.path || 'unknown',
                status: res.statusCode,
                duration: `${durationMs.toFixed(2)}ms`,
                requestSize: formatBytes(getRequestSize(req)),
                responseSize: formatBytes(responseSize),
                contentType: res.getHeader('content-type') || 'unknown',
                userAgent: getUserAgent(req),
                ip: clientIp,
                location: locationInfo,
                memory: getMemoryUsage(),
                query: Object.keys(req.query || {}).length > 0 ? req.query : undefined,
                error: res.statusCode >= 400 ? res.statusMessage : undefined,
                headers: process.env.NODE_ENV === 'development' ? {
                    'x-forwarded-for': req.headers['x-forwarded-for'],
                    'cf-connecting-ip': req.headers['cf-connecting-ip'],
                    'x-real-ip': req.headers['x-real-ip']
                } : undefined
            };

            const statusCode = res.statusCode;
            let logLevel = 'log';
            if (statusCode >= 500) logLevel = 'error';
            else if (statusCode >= 400) logLevel = 'warn';
            else if (statusCode >= 300) logLevel = 'info';

            console[logLevel]('Request Performance:', JSON.stringify(logDetails, null, process.env.NODE_ENV === 'development' ? 2 : 0));
        } catch (error) {
            console.error('Error in performance logging:', error);
        }

        originalEnd.apply(res, args);
    };

    next();
};