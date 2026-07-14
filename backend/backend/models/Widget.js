const mongoose = require('mongoose');

const WidgetSchema = new mongoose.Schema({
    type: { type: String, required: true, unique: true }, // 'weather', 'market', 'cricket'
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Widget', WidgetSchema);
