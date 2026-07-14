const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'whatsappPopupEnabled'
    value: { type: mongoose.Schema.Types.Mixed, required: true } // e.g., true/false
});

module.exports = mongoose.model('Setting', SettingSchema);
