import logger from './logger.js'; 
const getEgyptTime = () => {
    const now = new Date();
    const egyptTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Cairo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(now);
    const [month, day, year, hour, minute, second] = egyptTime.split(/[/, :]/);
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};
const detectInjection = (value, helpers) => {
    if (typeof value !== "string") return value;
    const suspiciousPatterns = [
        /\$ne/i, /\$eq/i, /\$gt/i, /\$lt/i, /\$regex/i,
        /--/, /;/, /DROP/i, /UNION/i, /SELECT/i, /INSERT/i, /UPDATE/i, /DELETE/i 
    ];
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(value));
    if (isSuspicious) {
        const logMessage = {
            timestamp: getEgyptTime(), 
            type: 'SECURITY_ALERT',
            potentialInjection: value,
            message: 'Possible injection attempt detected'
        };
        if (logger && typeof logger.warn === 'function') {
            loggerdetectInjection.warn(logMessage);
        } else {
            console.log('[SECURITY_ALERT]', JSON.stringify(logMessage));
        }
        return helpers.error("string.injection", { value });
    }
    return value;
};

export default detectInjection;