const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { appendToSheet } = require('../utils/googleSheetService');
const { sendAdminNotification } = require('../utils/emailService');

// Helper to check admin
const isAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

// @route   POST /api/inquiries
// @desc    Submit a new inquiry (Public)
router.post('/', async (req, res) => {
    const { name, email, phone, type, message } = req.body;

    if (!name || (!email && !phone)) {
        return res.status(400).json({ message: 'Please provide name and at least one contact method (email or phone)' });
    }

    try {
        const inquiryData = { name, email, phone, type, message };
        const inquiry = new Inquiry(inquiryData);
        await inquiry.save();

        // Sync to Google Sheets (Background)
        // WhatsApp submissions go to the "Old" sheet, others go to the "Ads" sheet
        const sheetId = type === 'WhatsApp' ? process.env.GOOGLE_SHEET_ID_WHATSAPP : process.env.GOOGLE_SHEET_ID_ADS;
        appendToSheet(inquiry, sheetId);

        // Notify Admin via Email
        sendAdminNotification('Inquiry/Exclusive Content', {
            Name: name,
            Email: email || 'N/A',
            Phone: phone || 'N/A',
            Type: type,
            Message: message
        });

        res.status(201).json({ success: true, message: 'Inquiry submitted successfully!' });
    } catch (err) {
        console.error('Inquiry Submission Error:', err);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});

// @route   GET /api/inquiries
// @desc    Get all inquiries (Admin only)
router.get('/', isAdmin, async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/inquiries/:id
// @desc    Delete an inquiry (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

        await Inquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Inquiry removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/inquiries/:id
// @desc    Update an inquiry status (Admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
        res.json(inquiry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
