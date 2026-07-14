const mongoose = require('mongoose');

const CelebritySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    fullBio: { type: String },
    milestones: [
        { year: { type: String }, text: { type: String } }
    ],
    stats: {
        fanBase: { type: String, default: '0' },
        movieCount: { type: String, default: '0' },
        nominations: { type: String, default: '0' }
    },
    industry: { type: String, default: 'Pollywood' },
    category: { type: String, default: 'Actor' },
    comments: [{
        user: { type: String, required: true },
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: String }],
        reports: [{ type: String }],
        createdAt: { type: Date, default: Date.now }
    }],
    birthDate: { type: String },
    birthPlace: { type: String },
    photos: [{ type: String }],
    videos: [{ type: String }],
    slug: { type: String, unique: true, sparse: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bonusFollowers: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Celebrity', CelebritySchema);
