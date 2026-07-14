const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// @route   GET /api/announcements
// @desc    Get all active announcements
// @access  Public
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/announcements
// @desc    Add an announcement
// @access  Private (Admin/Sub-admin)
router.post('/', async (req, res) => {
    try {
        // Use session-based auth like other routes
        const user = req.session.user;
        if (!user || (user.role !== 'admin' && user.role !== 'sub-admin')) {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        const { text, link } = req.body;
        const newAnn = new Announcement({ text, link });
        const ann = await newAnn.save();
        res.json(ann);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Admin/Sub-admin)
router.delete('/:id', async (req, res) => {
    try {
        // Use session-based auth like other routes
        const user = req.session.user;
        if (!user || (user.role !== 'admin' && user.role !== 'sub-admin')) {
            return res.status(403).json({ msg: 'Authorization denied' });
        }

        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Announcement removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
