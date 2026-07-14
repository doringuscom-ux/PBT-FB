const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// GET all settings
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.find();
        
        // Structure it as a single object: { whatsappPopupEnabled: true, ... }
        let settingsData = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        res.json(settingsData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT (upsert) a setting
router.put('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const updatedSetting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true }
        );

        res.json(updatedSetting);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
