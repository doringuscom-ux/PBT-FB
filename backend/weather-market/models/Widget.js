const mongoose = require('mongoose');

const WidgetSchema = new mongoose.Schema({
    type: { type: String, required: true, unique: true }, // 'weather', 'market', etc.
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Widget', WidgetSchema);
