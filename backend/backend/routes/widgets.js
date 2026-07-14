const express = require('express');
const router = express.Router();
const Widget = require('../models/Widget');

const { fetchWeatherForCoords } = require('../utils/widgetService');

// GET all widgets (Universal Endpoint)
router.get('/', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const widgets = await Widget.find();
        
        // Structure it as a single object
        let widgetData = widgets.reduce((acc, widget) => {
            acc[widget.type] = widget.data;
            return acc;
        }, {});

        // If coordinates provided, override weather with live data for that location
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

module.exports = router;
