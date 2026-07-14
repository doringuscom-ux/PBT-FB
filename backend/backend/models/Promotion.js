const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // URL of the uploaded image
        required: true
    },
    mobileImage: {
        type: String, // URL of the mobile-specific banner
        default: ''
    },
    tabletImage: {
        type: String, // URL of the tablet-specific banner
        default: ''
    },
    link: {
        type: String, // Target URL when user clicks the banner
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
