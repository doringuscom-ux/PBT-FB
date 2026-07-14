const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); // 5 minutes default

const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Skip cache for admins to always see the latest data
        if (req.session && req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin')) {
            return next();
        }

        // Cache key based on URL and User ID (to account for personalized data like 'isLiked', 'myRating')
        const userId = req.session && req.session.user ? req.session.user.id : 'guest';
        const key = `__express__${req.originalUrl || req.url}_${userId}`;

        const cachedBody = cache.get(key);
        if (cachedBody) {
            res.set('X-Cache', 'HIT');
            res.setHeader('Content-Type', 'application/json');
            return res.send(cachedBody);
        } else {
            res.set('X-Cache', 'MISS');
            res.originalSend = res.send;
            res.originalJson = res.json;
            
            res.json = (body) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache.set(key, body, duration);
                }
                res.originalJson(body);
            };

            res.send = (body) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache.set(key, body, duration);
                }
                res.originalSend(body);
            };
            next();
        }
    };
};

// Utility to clear cache when data is added/updated/deleted
const clearCache = () => {
    cache.flushAll();
};

module.exports = { cacheMiddleware, clearCache, cache };
