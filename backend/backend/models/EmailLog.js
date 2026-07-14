const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
    postTitle: { type: String, required: true },
    postType: { type: String, enum: ['News', 'Movie', 'Video'], required: true },
    recipientEmail: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    error: { type: String },
    sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('EmailLog', EmailLogSchema);
