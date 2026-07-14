const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true }, // Thumbnail path or URL
    videoUrl: { type: String, required: true }, // YouTube URL or local file path
    videoType: { 
        type: String, 
        required: true, 
        enum: ['youtube', 'upload'],
        default: 'youtube'
    },
    views: { type: String, default: '0' },
    time: { type: String, default: '0:00' },
    description: { type: String },
    publishedAt: { type: String },
    industry: { type: String, default: 'Pollywood' },
    category: { type: String, default: 'Trailer' },
    likes: { type: Number, default: 0 },
    comments: [{
        user: { type: String, required: true },
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: String }],
        reports: [{ type: String }],
        createdAt: { type: Date, default: Date.now }
    }],
    slug: { type: String, unique: true, sparse: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);
