const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const EmailLog = require('../models/EmailLog');
const { sendAdminNotification } = require('../utils/emailService');

// Helper to check admin
const isAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

// @route   POST /api/subscribers/subscribe
// @desc    Subscribe to the newsletter (Public)
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide an email address' });

    try {
        let subscriber = await Subscriber.findOne({ email });
        if (subscriber) {
            if (subscriber.isActive) return res.status(400).json({ message: 'You are already subscribed!' });
            subscriber.isActive = true;
            await subscriber.save();
            return res.json({ message: 'Welcome back! You have been re-subscribed.' });
        }
        subscriber = new Subscriber({ email });
        await subscriber.save();

        // Notify Admin via Email
        sendAdminNotification('Newsletter Subscription', {
            Email: email,
            Action: 'New Signup',
            Status: 'Active'
        });

        res.status(201).json({ message: 'Perfect! You are now subscribed to our newsletter.' });
    } catch (err) {
        console.error('Subscription Error:', err);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});

// @route   GET /api/subscribers
// @desc    Get all active subscribers (Admin only)
router.get('/', isAdmin, async (req, res) => {
    try {
        const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(subscribers);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/subscribers/stats
// @desc    Get subscriber stats (Admin only)
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const total = await Subscriber.countDocuments({ isActive: true });
        const recentLogs = await EmailLog.find().sort({ createdAt: -1 }).limit(10);
        const successCount = await EmailLog.countDocuments({ status: 'success' });
        const failCount = await EmailLog.countDocuments({ status: 'failed' });
        
        res.json({ total, recentLogs, successCount, failCount });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/subscribers/logs
// @desc    Get all email logs (Admin only)
router.get('/logs', isAdmin, async (req, res) => {
    try {
        const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(200);
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   DELETE /api/subscribers/:id
// @desc    Delete a subscriber (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subscriber removed from database' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
