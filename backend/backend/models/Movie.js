const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    coverImage: { type: String },
    rating: { type: Number, default: 0 },
    genre: { type: String },
    year: { type: Number, default: () => new Date().getFullYear() },
    overview: { type: String },
    director: { type: String },
    runtime: { type: String },
    certification: { type: String },
    performance: {
        budget: { type: Number },
        day1: { type: Number },
        weekend: { type: Number },
        week1: { type: Number },
        indiaNet: { type: Number },
        indiaGross: { type: Number },
        overseas: { type: Number },
        worldwide: { type: Number },
        verdict: { type: String },
        screens: { type: Number },
        status: { type: String }
    },
    industry: { type: String, default: 'Pollywood' },
    fullStory: { type: String },
    trailerUrl: { type: String },
    trailerVideo: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    releaseDate: { type: Date },
    isReleaseDateConfirmed: { type: Boolean, default: true },
    estimatedRelease: { type: String },
    likes: { type: Number, default: 0 },
    cast: [{
        name: { type: String, required: true },
        role: { type: String, required: true },
        image: { type: String },
        celebrity: { type: mongoose.Schema.Types.ObjectId, ref: 'Celebrity' }
    }],
    comments: [{
        user: { type: String, required: true },
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: String }],
        reports: [{ type: String }],
        createdAt: { type: Date, default: Date.now }
    }],
    slug: { type: String, unique: true, sparse: true },
    userRatings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
        isAnonymous: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    photos: [{ type: String }],
    youtubeLinks: [{
        title: { type: String },
        url: { type: String }
    }],
    watchNowUrl: { type: String },
    isWatchNowRedirect: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);
