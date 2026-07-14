const mongoose = require('mongoose');

const redirectSchema = new mongoose.Schema({
    fromPath: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    toUrl: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Redirect', redirectSchema);
