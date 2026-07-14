const mongoose = require('mongoose');

const SEOSchema = new mongoose.Schema({
    url: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true
    },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: { type: String, trim: true },
    canonical: { type: String, trim: true },
    robots: { 
        type: String, 
        default: 'index, follow',
        enum: ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow']
    },
    isAuto: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SEO', SEOSchema);
