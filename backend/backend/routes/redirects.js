const express = require('express');
const router = express.Router();
const Redirect = require('../models/Redirect');

// Get all active redirects (for frontend global redirector)
router.get('/active', async (req, res) => {
    try {
        const redirects = await Redirect.find({ isActive: true });
        res.json(redirects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Check single redirect for a path
router.get('/check', async (req, res) => {
    try {
        const { path } = req.query;
        if (!path) return res.status(400).json({ msg: 'Path is required' });

        const redirect = await Redirect.findOne({ 
            isActive: true,
            $or: [
                { fromPath: path },
                { fromPath: path + '/' },
                { fromPath: path.endsWith('/') ? path.slice(0, -1) : path }
            ]
        });
        
        res.json(redirect);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all redirects (for admin panel)
router.get('/', async (req, res) => {
    try {
        const redirects = await Redirect.find().sort({ createdAt: -1 });
        res.json(redirects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new redirect
router.post('/', async (req, res) => {
    try {
        const { fromPath, toUrl, isActive } = req.body;

        // Check if redirect already exists for this path
        let redirect = await Redirect.findOne({ fromPath });
        if (redirect) {
            return res.status(400).json({ msg: 'Redirect for this path already exists' });
        }

        redirect = new Redirect({
            fromPath,
            toUrl,
            isActive
        });

        await redirect.save();
        res.json(redirect);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a redirect
router.put('/:id', async (req, res) => {
    try {
        const { fromPath, toUrl, isActive } = req.body;
        let redirect = await Redirect.findById(req.params.id);

        if (!redirect) return res.status(404).json({ msg: 'Redirect not found' });

        redirect.fromPath = fromPath || redirect.fromPath;
        redirect.toUrl = toUrl || redirect.toUrl;
        if (isActive !== undefined) redirect.isActive = isActive;

        await redirect.save();
        res.json(redirect);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a redirect
router.delete('/:id', async (req, res) => {
    try {
        const redirect = await Redirect.findById(req.params.id);
        if (!redirect) return res.status(404).json({ msg: 'Redirect not found' });

        await redirect.deleteOne();
        res.json({ msg: 'Redirect removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
