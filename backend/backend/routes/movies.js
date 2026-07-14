const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Subscriber = require('../models/Subscriber');
const { sendPostNotification } = require('../utils/emailService');
const { upload, uploadFromUrl } = require('../config/cloudinary');

// Helper to enrich with isLiked status for comments
const enrich = (items, sessionUser) => {
    const userId = sessionUser ? sessionUser.id : null;
    return items.map(item => {
        const itemObj = item.toObject();
        if (userId && itemObj.userRatings) {
            const userRating = itemObj.userRatings.find(r => r.user?.toString() === userId);
            itemObj.myRating = userRating ? userRating.rating : null;
            itemObj.myReview = userRating ? userRating.review : null;
        } else {
            itemObj.myRating = null;
            itemObj.myReview = null;
        }

        if (itemObj.comments) {
            itemObj.comments = itemObj.comments.map(comment => ({
                ...comment,
                isLiked: userId && comment.likedBy ? comment.likedBy.includes(userId) : false
            }));
        }
        return itemObj;
    });
};

// Get all movies
router.get('/', async (req, res) => {
    try {
        const isAdmin = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin');
        let query = Movie.find();
        
        if (isAdmin) {
            query = query.populate('createdBy', 'username employeeId fullName');
        }
        
        const movies = await query.populate('cast.celebrity').populate('trailerVideo').populate('userRatings.user', 'username fullName').sort({ createdAt: -1 });
        res.json(enrich(movies, req.session.user));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a movie
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'trailer', maxCount: 1 }]), async (req, res) => {
    const movieData = { ...req.body };
    if (req.files && req.files['image']) {
        movieData.image = req.files['image'][0].path;
    } else if (movieData.image) {
        movieData.image = await uploadFromUrl(movieData.image);
    }
    if (req.files && req.files['trailer']) {
        movieData.trailerUrl = req.files['trailer'][0].path;
    }
    if (req.session.user) {
        movieData.createdBy = req.session.user.id;
    }

    // Parse JSON strings from FormData
    if (typeof movieData.performance === 'string') {
        try { movieData.performance = JSON.parse(movieData.performance); } catch (e) { console.error("Performance parse error:", e); }
    }
    if (typeof movieData.cast === 'string') {
        try { movieData.cast = JSON.parse(movieData.cast); } catch (e) { console.error("Cast parse error:", e); }
    }
    if (typeof movieData.photos === 'string') {
        try { movieData.photos = JSON.parse(movieData.photos); } catch (e) { console.error("Photos parse error:", e); }
    }
    if (typeof movieData.youtubeLinks === 'string') {
        try { movieData.youtubeLinks = JSON.parse(movieData.youtubeLinks); } catch (e) { console.error("YoutubeLinks parse error:", e); }
    }

    // Sanitize all stringified nulls/undefineds from FormData
    Object.keys(movieData).forEach(key => {
        if (movieData[key] === 'null' || movieData[key] === 'undefined' || movieData[key] === '') {
            movieData[key] = null;
        }
    });

    try {
        const movie = new Movie(movieData);
        await movie.save();
        const newMessage = await Movie.findById(movie._id)
            .populate('createdBy', 'username employeeId fullName')
            .populate('cast.celebrity')
            .populate('trailerVideo');

        // Background: Send email notification to all subscribers
        try {
            const subscribers = await Subscriber.find({ isActive: true });
            if (subscribers.length > 0) {
                sendPostNotification(newMessage, subscribers);
            }
        } catch (emailErr) {
            console.error("Failed to send movie notification:", emailErr);
        }

        res.status(201).json(enrich([newMessage], req.session.user)[0]);
    } catch (err) {
        console.error("[Movies Route] Error creating movie:", err);
        res.status(400).json({ message: err.message });
    }
});

// Update a movie
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'trailer', maxCount: 1 }]), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.files && req.files['image']) {
            updateData.image = req.files['image'][0].path;
        } else if (updateData.image) {
            updateData.image = await uploadFromUrl(updateData.image);
        }
        if (req.files && req.files['trailer']) {
            updateData.trailerUrl = req.files['trailer'][0].path;
        }
        if (req.session.user) {
            updateData.createdBy = req.session.user.id;
        }

        // Parse JSON strings from FormData
        if (typeof updateData.performance === 'string') {
            try { updateData.performance = JSON.parse(updateData.performance); } catch (e) { console.error("Performance parse error:", e); }
        }
        if (typeof updateData.cast === 'string') {
            try { updateData.cast = JSON.parse(updateData.cast); } catch (e) { console.error("Cast parse error:", e); }
        }
        if (typeof updateData.photos === 'string') {
            try { updateData.photos = JSON.parse(updateData.photos); } catch (e) { console.error("Photos parse error:", e); }
        }
        if (typeof updateData.youtubeLinks === 'string') {
            try { updateData.youtubeLinks = JSON.parse(updateData.youtubeLinks); } catch (e) { console.error("YoutubeLinks parse error:", e); }
        }

        // Sanitize all stringified nulls/undefineds from FormData
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === 'null' || updateData[key] === 'undefined' || updateData[key] === '') {
                updateData[key] = null;
            }
        });

        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' })
            .populate('createdBy', 'username employeeId fullName')
            .populate('cast.celebrity')
            .populate('trailerVideo');

        if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' });
        res.json(enrich([updatedMovie], req.session.user)[0]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a movie
router.delete('/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        res.json({ message: 'Movie deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Comment Routes
router.post('/:id/comments', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        
        const { user, content } = req.body;
        if (!user || !content) return res.status(400).json({ message: 'User and Content are required' });

        // Heal corrupted data (remove invalid string entries)
        if (movie.comments) {
            movie.comments = movie.comments.filter(c => c && typeof c === 'object' && c.user);
        }

        movie.comments.push({ user, content });
        const updatedMovie = await movie.save();
        res.status(201).json(enrich([updatedMovie], req.session.user)[0]);

    } catch (err) { res.status(400).json({ message: err.message }); }
});


router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        
        const comment = movie.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        const isAuthor = req.session.user && req.session.user.username === comment.user;
        const isAdmin = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin');
        
        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        movie.comments = movie.comments.filter(c => c._id.toString() !== req.params.commentId);
        await movie.save();
        res.json(enrich([movie], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/comments/:commentId/like', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        
        const comment = movie.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (!req.session.user) return res.status(401).json({ message: 'Login required' });
        const userId = req.session.user.id;
        
        if (!comment.likedBy) comment.likedBy = [];
        if (comment.likedBy.includes(userId)) {
            comment.likedBy = comment.likedBy.filter(id => id !== userId);
            comment.likes = Math.max(0, (comment.likes || 1) - 1);
        } else {
            comment.likedBy.push(userId);
            comment.likes = (comment.likes || 0) + 1;
        }
        await movie.save();
        res.json(enrich([movie], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/comments/:commentId', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        
        const comment = movie.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const isAuthor = req.session.user && req.session.user.username === comment.user;
        const isAdmin = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin');
        
        // If updating content, only author can do it
        if (req.body.content !== undefined && !isAuthor) {
             return res.status(403).json({ message: 'Only the author can edit comment content' });
        }
        
        // If updating likes (admin override), only admin can do it
        if (req.body.likes !== undefined && !isAdmin) {
             return res.status(403).json({ message: 'Only admins can override likes' });
        }

        if (req.body.likes !== undefined) comment.likes = req.body.likes;
        if (req.body.content !== undefined) comment.content = req.body.content;
        
        await movie.save();
        res.json(enrich([movie], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
 
// Rate a movie
router.post('/:id/rate', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
 
        const { rating, review } = req.body;
        const user = req.session.user;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating. Must be between 1 and 5.' });
        }

        if (user) {
            // Logged in: Updatable unique rating
            const existingRatingIndex = movie.userRatings.findIndex(r => r.user?.toString() === user.id);
            if (existingRatingIndex > -1) {
                movie.userRatings[existingRatingIndex].rating = rating;
                movie.userRatings[existingRatingIndex].review = review; // Save review only for users
                movie.userRatings[existingRatingIndex].createdAt = Date.now();
            } else {
                movie.userRatings.push({ user: user.id, rating, review });
            }
        } else {
            // Anonymous: Cumulative ratings
            movie.userRatings.push({ rating, isAnonymous: true });
            // Note: Review ignored for anonymous per requirement
        }

        // Recalculate average
        movie.totalRatings = movie.userRatings.length;
        const sum = movie.userRatings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        movie.averageRating = sum / movie.totalRatings;

        await movie.save();
        res.json(enrich([movie], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete a user's movie rating/review
router.delete('/:id/rate', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const existingRatingIndex = movie.userRatings.findIndex(r => r.user?.toString() === user.id);
        if (existingRatingIndex > -1) {
            movie.userRatings.splice(existingRatingIndex, 1);
            
            // Recalculate average
            movie.totalRatings = movie.userRatings.length;
            const sum = movie.userRatings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
            movie.averageRating = movie.totalRatings > 0 ? sum / movie.totalRatings : 0;
            
            await movie.save();
            res.json(enrich([movie], req.session.user)[0]);
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});
 
module.exports = router;
