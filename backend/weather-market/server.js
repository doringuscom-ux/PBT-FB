const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { startWidgetService, fetchWeatherForCoords } = require('./utils/widgetService');
const { startHeartbeat } = require('./utils/heartbeat');
const Widget = require('./models/Widget');

// Global error handlers to prevent background library errors from crashing the server
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Unhandled Rejection] Reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[Uncaught Exception] Error:', error);
});

// Prevent background connection errors from crashing the process
mongoose.connection.on('error', err => {
    console.error('[Mongoose] Background connection error:', err.message);
});

const app = express();
app.use(cors());
app.use(express.json());

// Cache middleware for Vercel Edge Caching (stale-while-revalidate)
app.use((req, res, next) => {
    if (req.method === 'GET' && req.path === '/api/widgets') {
        // Cache for 2 minutes, serve stale data for up to 10 minutes while fetching fresh data in background
        res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    }
    next();
});

// Connect Database in background
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            console.error('[Database] MONGO_URI is not set in environment variables.');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
    }
};

connectDB();

// API Endpoint for widgets
app.get('/api/widgets', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const widgets = await Widget.find();

        let widgetData = widgets.reduce((acc, widget) => {
            acc[widget.type] = widget.data;
            return acc;
        }, {});

        if (lat && lon) {
            const liveWeather = await fetchWeatherForCoords(lat, lon);
            if (liveWeather) {
                widgetData.weather = liveWeather;
            }
        }
        res.json(widgetData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Vercel Cron Endpoint for updating weather and market data
app.get('/api/cron/update-widgets', async (req, res) => {
    try {
        const { updateWeather, updateMarket } = require('./utils/widgetService');
        await Promise.all([
            updateWeather(),
            updateMarket()
        ]);
        res.json({ message: 'Widgets updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('PBTadka Weather & Market API is running successfully.'));

const PORT = process.env.PORT || 5001;

// Only start listeners and background cron updates if NOT running on Vercel
if (!process.env.VERCEL) {
    startWidgetService();
    startHeartbeat();
    app.listen(PORT, () => {
        console.log(`Weather & Market Service started on port ${PORT}`);
    });
} else {
    console.log('Weather & Market Service initialized in Vercel serverless mode.');
}

module.exports = app;
