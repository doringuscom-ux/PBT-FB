const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    excerpt: { type: String, required: true },
    date: { type: String },
    fullStory: { type: String },
    author: { type: String, default: 'Editor Team' },
    comments: [{
        user: { type: String, required: true },
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: String }], // Store IP to ensure unique likes toggle
        reports: [{ type: String }], // Store IP ensure unique reports
        createdAt: { type: Date, default: Date.now }
    }],
    likes: { type: Number, default: 0 },
    slug: { type: String, unique: true, sparse: true },
    relatedMovie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: false },
    relatedCelebrities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Celebrity' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
