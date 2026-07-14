const express = require('express');
const router = express.Router();
const Celebrity = require('../models/Celebrity');
const { upload, uploadFromUrl } = require('../config/cloudinary');

// Helper to enrich with isLiked status for comments
const enrich = (items, sessionUser) => {
    const userId = sessionUser ? sessionUser.id : null;
    return items.map(item => {
        const itemObj = item.toObject();
        itemObj.isFollowing = userId && itemObj.followers ? itemObj.followers.some(id => id.toString() === userId) : false;
        if (itemObj.comments) {
            itemObj.comments = itemObj.comments.map(comment => ({
                ...comment,
                isLiked: userId && comment.likedBy ? comment.likedBy.includes(userId) : false
            }));
        }
        return itemObj;
    });
};

router.get('/', async (req, res) => {
    try {
        const isAdmin = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin');
        let query = Celebrity.find();
        
        if (isAdmin) {
            query = query.populate('createdBy', 'username employeeId fullName');
        }
        
        const celebrities = await query.sort({ createdAt: -1 });
        res.json(enrich(celebrities, req.session.user));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', upload.single('image'), async (req, res) => {
    const celebData = { ...req.body };
    if (req.file) {
        celebData.image = req.file.path;
    } else if (celebData.image) {
        celebData.image = await uploadFromUrl(celebData.image);
    }
    if (req.session.user) {
        celebData.createdBy = req.session.user.id;
    }

    // Parse JSON strings from FormData
    if (typeof celebData.milestones === 'string') {
        try { celebData.milestones = JSON.parse(celebData.milestones); } catch (e) { console.error("Milestones parse error:", e); }
    }
    if (typeof celebData.stats === 'string') {
        try { celebData.stats = JSON.parse(celebData.stats); } catch (e) { console.error("Stats parse error:", e); }
    }
    if (typeof celebData.photos === 'string') {
        try { celebData.photos = JSON.parse(celebData.photos); } catch (e) { console.error("Photos parse error:", e); }
    }
    if (typeof celebData.videos === 'string') {
        try { celebData.videos = JSON.parse(celebData.videos); } catch (e) { console.error("Videos parse error:", e); }
    }

    const celeb = new Celebrity(celebData);
    try {
        const newCeleb = await celeb.save();
        res.status(201).json(newCeleb);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.path;
        } else if (updateData.image) {
            updateData.image = await uploadFromUrl(updateData.image);
        }
        if (req.session.user) {
            updateData.createdBy = req.session.user.id;
        }

        // Parse JSON strings from FormData
        if (typeof updateData.milestones === 'string') {
            try { updateData.milestones = JSON.parse(updateData.milestones); } catch (e) { console.error("Milestones parse error:", e); }
        }
        if (typeof updateData.stats === 'string') {
            try { updateData.stats = JSON.parse(updateData.stats); } catch (e) { console.error("Stats parse error:", e); }
        }
        if (typeof updateData.photos === 'string') {
            try { updateData.photos = JSON.parse(updateData.photos); } catch (e) { console.error("Photos parse error:", e); }
        }
        if (typeof updateData.videos === 'string') {
            try { updateData.videos = JSON.parse(updateData.videos); } catch (e) { console.error("Videos parse error:", e); }
        }
        if (typeof updateData.followers === 'string') {
            try { updateData.followers = JSON.parse(updateData.followers); } catch (e) { console.error("Followers parse error:", e); }
        }

        // Heal corrupted data (remove invalid string entries if passed)
        if (updateData.comments && !Array.isArray(updateData.comments)) {
            delete updateData.comments;
        }
        if (updateData.followers && !Array.isArray(updateData.followers)) {
            delete updateData.followers;
        }

        // Ensure slug is clean
        if (updateData.slug) {
            updateData.slug = updateData.slug.trim().toLowerCase();
        }

        const updatedCeleb = await Celebrity.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' })
            .populate('createdBy', 'username employeeId fullName');

        if (!updatedCeleb) return res.status(404).json({ message: 'Celebrity not found' });
        res.json(enrich([updatedCeleb], req.session.user)[0]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a celebrity
router.delete('/:id', async (req, res) => {
    try {
        const celeb = await Celebrity.findByIdAndDelete(req.params.id);
        if (!celeb) return res.status(404).json({ message: 'Celebrity not found' });
        res.json({ message: 'Celebrity deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Comment Routes
router.post('/:id/comments', async (req, res) => {
    try {
        const celeb = await Celebrity.findById(req.params.id);
        if (!celeb) return res.status(404).json({ message: 'Celebrity not found' });
        
        const { user, content } = req.body;
        if (!user || !content) return res.status(400).json({ message: 'User and Content are required' });

        // Heal corrupted data (remove invalid string entries)
        if (celeb.comments) {
            celeb.comments = celeb.comments.filter(c => c && typeof c === 'object' && c.user);
        }

        celeb.comments.push({ user, content });
        const updatedCeleb = await celeb.save();
        res.status(201).json(enrich([updatedCeleb], req.session.user)[0]);

    } catch (err) { res.status(400).json({ message: err.message }); }
});


router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const celeb = await Celebrity.findById(req.params.id);
        if (!celeb) return res.status(404).json({ message: 'Celebrity not found' });
        
        const comment = celeb.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const isAuthor = req.session.user && req.session.user.username === comment.user;
        const isAdmin = req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'sub-admin');
        
        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        celeb.comments = celeb.comments.filter(c => c._id.toString() !== req.params.commentId);
        await celeb.save();
        res.json(enrich([celeb], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/comments/:commentId/like', async (req, res) => {
    try {
        const celeb = await Celebrity.findById(req.params.id);
        if (!celeb) return res.status(404).json({ message: 'Celebrity not found' });

        const comment = celeb.comments.id(req.params.commentId);
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
        await celeb.save();
        res.json(enrich([celeb], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/comments/:commentId', async (req, res) => {
    try {
        const celeb = await Celebrity.findById(req.params.id);
        if (!celeb) return res.status(404).json({ message: 'Celebrity not found' });
        
        const comment = celeb.comments.id(req.params.commentId);
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
        
        await celeb.save();
        res.json(enrich([celeb], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
 
// Follow/Unfollow Celebrity
router.post('/:id/follow', async (req, res) => {
    try {
        const celeb = await Celebrity.findById(req.params.id);
        if (!celeb) return res.status(404).json({ message: 'Celebrity not found' });
 
        if (!req.session.user) return res.status(401).json({ message: 'Login required' });
        const userId = req.session.user.id;
        
        if (!celeb.followers) celeb.followers = [];
        
        const index = celeb.followers.indexOf(userId);
        if (index > -1) {
            celeb.followers.splice(index, 1);
        } else {
            celeb.followers.push(userId);
        }
        
        await celeb.save();
        res.json(enrich([celeb], req.session.user)[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
 
module.exports = router;
