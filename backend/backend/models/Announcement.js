const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    text: { type: String, required: true },
    link: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
