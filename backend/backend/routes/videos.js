const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Subscriber = require('../models/Subscriber');
const { sendPostNotification } = require('../utils/emailService');
const { upload: cloudinaryUpload, uploadFromUrl } = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Celebrity = require('../models/Celebrity');

// Helper to enrich with isLiked status for comments
const enrich = (items, sessionUser) => {
    const userId = sessionUser ? sessionUser.id : null;
    return items.map(item => {
        const itemObj = item.toObject();
        if (itemObj.comments) {
            itemObj.comments = itemObj.comments.map(comment => ({
                ...comment,
                isLiked: userId && comment.likedBy ? comment.likedBy.includes(userId) : false
            }));
        }
        return itemObj;
    });
};

/* Local storage fallback removed for Cloudinary */

// GET all videos
router.get('/', async (req, res) => {
    try {
        const isAdmin = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin');
        let query = Video.find();
        
        if (isAdmin) {
            query = query.populate('createdBy', 'username employeeId fullName');
        }
        
        const videos = await query.sort({ createdAt: -1 });
        res.json(enrich(videos, req.session.user));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new video (Handles both YouTube and Uploads)
router.post('/', cloudinaryUpload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
    try {
        const videoData = { ...req.body };
        
        if (req.files && req.files['video']) {
            videoData.videoUrl = req.files['video'][0].path;
            videoData.videoType = 'upload';
        }

        if (req.files && req.files['thumbnail']) {
            videoData.image = req.files['thumbnail'][0].path;
        } else if (videoData.image) {
            // Auto-upload remote link to Cloudinary
            videoData.image = await uploadFromUrl(videoData.image);
        }

        if (req.session.user) {
            videoData.createdBy = req.session.user.id;
        }

        if (videoData.slug) {
            videoData.slug = videoData.slug.trim().toLowerCase();
        }

        const video = new Video(videoData);
        const newVideo = await video.save();

        // Background: Send email notification to all subscribers
        try {
            const subscribers = await Subscriber.find({ isActive: true });
            if (subscribers.length > 0) {
                sendPostNotification(newVideo, subscribers);
            }
        } catch (emailErr) {
            console.error("Failed to send video notification:", emailErr);
        }

        res.status(201).json(newVideo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE video
router.put('/:id', cloudinaryUpload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        if (req.files && req.files['video']) {
            updateData.videoUrl = req.files['video'][0].path;
            updateData.videoType = 'upload'; 
        }
        if (req.files && req.files['thumbnail']) {
            updateData.image = req.files['thumbnail'][0].path;
        } else if (updateData.image || req.body.image) { 
            // Auto-upload remote link to Cloudinary
            const imgToUpload = updateData.image || req.body.image;
            updateData.image = await uploadFromUrl(imgToUpload);
        }

        if (req.session.user) {
            updateData.createdBy = req.session.user.id;
        }

        // Heal corrupted data (remove invalid string entries if passed)
        if (updateData.comments && !Array.isArray(updateData.comments)) {
            delete updateData.comments;
        }

        if (updateData.slug) {
            updateData.slug = updateData.slug.trim().toLowerCase();
        }

        const updatedVideo = await Video.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' })
            .populate('createdBy', 'username employeeId fullName');

        if (!updatedVideo) return res.status(404).json({ message: 'Video not found' });
        res.json(enrich([updatedVideo], req.session.user)[0]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE video
router.delete('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        // Delete files if they are local uploads
        if (video.videoType === 'upload' && video.videoUrl.startsWith('/uploads/')) {
            const videoPath = path.join(__dirname, '..', video.videoUrl);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }
        if (video.image.startsWith('/uploads/')) {
            const thumbPath = path.join(__dirname, '..', video.image);
            if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
        }

        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: 'Video deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Comment Routes
router.post('/:id/comments', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        
        const { user, content } = req.body;
        if (!user || !content) return res.status(400).json({ message: 'User and Content are required' });

        // Heal corrupted data (remove invalid string entries)
        if (video.comments) {
            video.comments = video.comments.filter(c => c && typeof c === 'object' && c.user);
        }

        video.comments.push({ user, content });
        const updatedVideo = await video.save();
        res.status(201).json(enrich([updatedVideo], req.session.user)[0]);

    } catch (err) { res.status(400).json({ message: err.message }); }
});


router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        
        const comment = video.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        const isAuthor = req.session.user && req.session.user.username === comment.user;
        const isAdmin = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin');
        
        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        video.comments = video.comments.filter(c => c._id.toString() !== req.params.commentId);
        await video.save();
        res.json(enrich([video], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/comments/:commentId/like', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        
        const comment = video.comments.id(req.params.commentId);
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
        await video.save();
        res.json(enrich([video], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/comments/:commentId', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        
        const comment = video.comments.id(req.params.commentId);
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
        
        await video.save();
        res.json(enrich([video], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
