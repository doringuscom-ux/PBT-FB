const session = require('express-session');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const { startHeartbeat } = require('./utils/heartbeat');
require('dotenv').config();

// Global error handlers to prevent background library errors from crashing the server
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Unhandled Rejection] Reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[Uncaught Exception] Error:', error);
});

const MongoStore = require('connect-mongo');
const Redirect = require('./models/Redirect');
const app = express();

// Connect Database in background (stateless / serverless compatible)
connectDB();

// 301 Redirect Middleware (Checks DB for custom redirects)
app.use(async (req, res, next) => {
    try {
        // Skip API and Static files
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.includes('.')) {
            return next();
        }

        const path = req.path.toLowerCase().replace(/\/$/, '') || '/';
        
        // 1. Handle Automatic Space-to-Hyphen Redirects (e.g., %20 to -)
        if (req.path.includes('%20') || req.path.includes(' ')) {
            const cleanPath = req.path.toLowerCase().replace(/%20|\s+/g, '-').replace(/\/$/, '');
            console.log(`[301 Auto-Slug] ${req.path} -> ${cleanPath}`);
            return res.redirect(301, cleanPath);
        }

        // 2. Handle '/industry/' removal from Movies/Upcoming URLs
        if (req.path.includes('/industry/')) {
            const cleanPath = req.path.replace('/industry/', '/').replace(/\/$/, '');
            console.log(`[301 Path-Cleanup] ${req.path} -> ${cleanPath}`);
            return res.redirect(301, cleanPath);
        }

        // 3. Database Redirects
        const redirect = await Redirect.findOne({ 
            fromPath: { $in: [path, path + '/'] },
            isActive: true 
        });

        if (redirect) {
            console.log(`[301 Redirect] ${req.path} -> ${redirect.toUrl}`);
            return res.redirect(301, redirect.toUrl);
        }
        next();
    } catch (err) {
        next();
    }
});

// Init Middleware
app.set('trust proxy', 1); // Trust first proxy (Render, Heroku, etc.)

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Allow requests from any origin
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Session Middleware
let store;
if (process.env.MONGO_URI) {
    store = (typeof MongoStore.create === 'function')
        ? MongoStore.create({ mongoUrl: process.env.MONGO_URI, ttl: 14 * 24 * 60 * 60 })
        : MongoStore.default && typeof MongoStore.default.create === 'function'
            ? MongoStore.default.create({ mongoUrl: process.env.MONGO_URI, ttl: 14 * 24 * 60 * 60 })
            : new MongoStore({ mongoUrl: process.env.MONGO_URI, ttl: 14 * 24 * 60 * 60 });
} else {
    console.warn('[Session] MONGO_URI not found. Using default memory store (sessions will not persist).');
}

const sessionConfig = {
    name: 'pbtadka.sid', // Custom name to avoid generic sid
    secret: process.env.SESSION_SECRET || 'punjabi-film-news-secret-123',
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for secure cookies behind proxies
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site cookies in prod
        maxAge: 24 * 60 * 60 * 1000
    }
};

if (store) {
    sessionConfig.store = store;
}

app.use(session(sessionConfig));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('PBTadka Backend API is running successfully.'));
app.use('/sitemap.xml', require('./routes/sitemap'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/news', require('./routes/news'));
app.use('/api/celebrities', require('./routes/celebrities'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/users', require('./routes/users'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/redirects', require('./routes/redirects'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/promotions', require('./routes/promotions'));

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));
    startHeartbeat();
} else {
    console.log('Server initialized in Vercel serverless mode.');
}

module.exports = app;
