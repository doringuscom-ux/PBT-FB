const express = require('express');
const router = express.Router();
const SEO = require('../models/SEO');
const News = require('../models/News');
const Movie = require('../models/Movie');
const Celebrity = require('../models/Celebrity');
const Video = require('../models/Video');
const { uploadFromUrl } = require('../config/cloudinary');

// Get all SEO records
router.get('/', async (req, res) => {
    try {
        const seoEntries = await SEO.find().sort({ updatedAt: -1 });
        res.json(seoEntries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get SEO stats
router.get('/stats', async (req, res) => {
    try {
        const [news, movies, celebs, videos, seoCount] = await Promise.all([
            News.countDocuments(),
            Movie.countDocuments(),
            Celebrity.countDocuments(),
            Video.countDocuments(),
            SEO.countDocuments()
        ]);

        const staticPagesCount = 9; // Home, News, Movies, Celebs, Videos, Upcoming, Sports, Contact, Box Office
        const systemPages = news + movies + celebs + videos + staticPagesCount;
        
        // Final Total includes system pages + any extra custom URLs added manually
        const totalPages = Math.max(systemPages, seoCount);

        res.json({
            totalPages,
            seoCompleted: seoCount,
            seoMissing: Math.max(0, systemPages - seoCount)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get SEO for a specific URL
router.get('/metadata', async (req, res) => {
    try {
        let { url } = req.query;
        if (!url) return res.status(400).json({ message: 'URL is required' });

        // Normalize URL: lowercase and strip trailing slash (except for root '/')
        url = url.toLowerCase();
        if (url.length > 1 && url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        const entry = await SEO.findOne({ url });
        if (!entry) return res.status(404).json({ message: 'SEO not found' });
        
        res.json(entry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or Update SEO record
router.post('/', async (req, res) => {
    try {
        const { url, title, description, keywords, canonical, robots, isAuto } = req.body;
        if (!url) return res.status(400).json({ message: 'URL is required' });

        // Block Admin pages from SEO
        if (url.toLowerCase().startsWith('/admin')) {
            return res.status(400).json({ message: 'Cannot create SEO entries for Admin pages.' });
        }

        const updatedSEO = await SEO.findOneAndUpdate(
            { url: url.toLowerCase() },
            { title, description, keywords, canonical, robots, isAuto },
            { new: true, upsert: true }
        );

        res.json(updatedSEO);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Auto-generate SEO records for all content
router.post('/auto-generate', async (req, res) => {
    try {
        const [news, movies, celebs, videos] = await Promise.all([
            News.find({}, 'title slug excerpt fullStory'),
            Movie.find({}, 'title slug description'),
            Celebrity.find({}, 'name slug bio'),
            Video.find({}, 'title slug description')
        ]);

        let createdCount = 0;

        // 1. Migration: Automatically update old URL patterns to new ones
        const oldPatterns = [
            { old: '/news/', new: '/latest-news/' },
            { old: '/movie/', new: '/latest-movies/' },
            { old: '/celeb/', new: '/celebrities/' },
            { url: '/videos', new: '/latest-viral-videos' }, // Exact match fix
            { old: '/video/', new: '/latest-viral-videos/' }
        ];

        for (const pattern of oldPatterns) {
            const regex = pattern.old ? new RegExp('^' + pattern.old.replace(/\//g, '\\/'), 'i') : null;
            
            if (regex) {
                // Bulk update all records starting with the old pattern
                const entriesToUpdate = await SEO.find({ url: { $regex: regex } });
                for (const entry of entriesToUpdate) {
                    const newUrl = entry.url.replace(regex, pattern.new);
                    // Check if new URL already exists before updating
                    const exists = await SEO.findOne({ url: newUrl });
                    if (!exists) {
                        entry.url = newUrl;
                        await entry.save();
                        createdCount++;
                    } else {
                        // If new one exists, just delete the old duplicate
                        await SEO.deleteOne({ _id: entry._id });
                    }
                }
            } else if (pattern.url) {
                // Exact match update
                const entry = await SEO.findOne({ url: pattern.url });
                if (entry) {
                    const exists = await SEO.findOne({ url: pattern.new });
                    if (!exists) {
                        entry.url = pattern.new;
                        await entry.save();
                        createdCount++;
                    } else {
                        await SEO.deleteOne({ _id: entry._id });
                    }
                }
            }
        }

        const staticPages = [
            { url: '/', title: 'Pbtadka | Latest News, Movies & Celebrity Updates', description: 'Your premier destination for cinema news, reviews, trailers, and celebrity interviews.' },
            { url: '/latest-news', title: 'Latest News & Headlines | Pbtadka', description: 'Stay updated with the latest breaking news from the film industry.' },
            { url: '/latest-movies', title: 'Movies Vault | Reviews & Releases | Pbtadka', description: 'Explore our complete database of movies, reviews, and release dates.' },
            { url: '/celebrities', title: 'Celebrities Profiles & Interviews | Pbtadka', description: 'Detailed profiles and exclusive interviews with your favorite stars.' },
            { url: '/latest-viral-videos', title: 'Latest Movie Trailers & Videos | Pbtadka', description: 'Watch the latest trailers, teasers, and exclusive video content.' },
            { url: '/latest-movies/upcoming', title: 'Upcoming Movies & Releases | Pbtadka', description: 'Plan your cinema visits with our list of upcoming movie releases.' },
            { url: '/latest-news/sports', title: 'Sports News & Updates | Pbtadka', description: 'Latest updates and actions from the world of sports.' },
            { url: '/latest-news/today', title: 'Today\'s Breaking News | Pbtadka', description: 'Freshly posted news from the last 24 hours.' },
            { url: '/contact-us', title: 'Contact Us | Pbtadka', description: 'Get in touch with the Pbtadka team for inquiries and feedback.' },
            { url: '/movie-box-office', title: 'Box Office Collections & Reports | Pbtadka', description: 'Track the latest box office performance of movies.' }
        ];

        // Process Static Pages
        for (const page of staticPages) {
            const exists = await SEO.findOne({ url: page.url });
            if (!exists) {
                await SEO.create({ ...page, isAuto: true });
                createdCount++;
            }
        }

        // Process News
        for (const item of news) {
            const url = `/latest-news/${item.slug || item._id}`.toLowerCase().replace(/\/$/, '');
            const exists = await SEO.findOne({ url });
            if (!exists) {
                await SEO.create({
                    url,
                    title: `${item.title} | News | Pbtadka`,
                    description: (item.excerpt || item.fullStory || '').substring(0, 160).trim() || `Latest news about ${item.title} on Pbtadka.`,
                    robots: 'index, follow',
                    isAuto: true
                });
                createdCount++;
            }
        }

        // Process Movies
        for (const item of movies) {
            const url = `/latest-movies/${item.slug || item._id}`.toLowerCase();
            const exists = await SEO.findOne({ url });
            if (!exists) {
                await SEO.create({
                    url,
                    title: `${item.title} | Movie Details & Reviews | Pbtadka`,
                    description: (item.description || '').substring(0, 160).trim(),
                    isAuto: true
                });
                createdCount++;
            }
        }

        // Process Celebs
        for (const item of celebs) {
            const url = `/celebrities/${item.slug || item._id}`.toLowerCase();
            const exists = await SEO.findOne({ url });
            if (!exists) {
                await SEO.create({
                    url,
                    title: `${item.name} | Celebrity Profile | Pbtadka`,
                    description: (item.bio || '').substring(0, 160).trim(),
                    isAuto: true
                });
                createdCount++;
            }
        }

        // Process Celebrity Industry Pages
        const industries = [...new Set(celebs.map(c => c.industry).filter(Boolean))];
        for (const ind of industries) {
            const slugifiedInd = ind.toLowerCase().trim().replace(/\s+/g, '-');
            const url = `/celebrities/${slugifiedInd}`;
            const exists = await SEO.findOne({ url });
            if (!exists) {
                await SEO.create({
                    url,
                    title: `${ind} Film Industry | News & Celebs | Pbtadka`,
                    description: `Latest news and updates from the ${ind} film industry.`,
                    isAuto: true
                });
                createdCount++;
            }
        }

        // Process Videos
        for (const item of videos) {
            const url = `/latest-viral-videos/${item.slug || item._id}`.toLowerCase();
            const exists = await SEO.findOne({ url });
            if (!exists) {
                await SEO.create({
                    url,
                    title: `${item.title} | Watch Trailer & Videos | Pbtadka`,
                    description: (item.description || '').substring(0, 160).trim(),
                    isAuto: true
                });
                createdCount++;
            }
        }

        // 7. Cleanup: Delete SEO records for system pages that no longer exist
        // First, build a Set of all valid system URLs we just processed/verified
        const validSystemUrls = new Set([
            ...staticPages.map(p => p.url),
            ...news.map(item => `/latest-news/${item.slug || item._id}`.toLowerCase()),
            ...movies.map(item => `/latest-movies/${item.slug || item._id}`.toLowerCase()),
            ...celebs.map(item => `/celebrities/${item.slug || item._id}`.toLowerCase()),
            ...videos.map(item => `/latest-viral-videos/${item.slug || item._id}`.toLowerCase())
        ]);

        // Find all SEO entries that start with our system prefixes but aren't in the valid set
        const systemPrefixes = ['/latest-news/', '/latest-movies/', '/celebrities/', '/latest-viral-videos/'];
        const allSeoEntries = await SEO.find({});
        let deletedCount = 0;

        for (const entry of allSeoEntries) {
            const isSystemPage = systemPrefixes.some(p => entry.url.startsWith(p)) || 
                                 staticPages.some(p => p.url === entry.url);
            
            if (isSystemPage && !validSystemUrls.has(entry.url)) {
                await SEO.deleteOne({ _id: entry._id });
                deletedCount++;
            }
        }

        res.json({ 
            success: true, 
            message: `Successfully updated SEO. Migrated old URLs, added ${createdCount} new records, and cleaned up ${deletedCount} invalid entries.`,
            createdCount,
            deletedCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Bulk Image Sync (Google Links -> Cloudinary)
router.post('/sync-images', async (req, res) => {
    try {
        const [news, movies, celebs, videos] = await Promise.all([
            News.find({ image: { $not: /cloudinary\.com/ } }),
            Movie.find({ image: { $not: /cloudinary\.com/ } }),
            Celebrity.find({ image: { $not: /cloudinary\.com/ } }),
            Video.find({ image: { $not: /cloudinary\.com/ } })
        ]);

        let syncedCount = 0;

        // Sync News
        for (const item of news) {
            if (item.image && item.image.startsWith('http')) {
                const newUrl = await uploadFromUrl(item.image);
                if (newUrl !== item.image) {
                    await News.findByIdAndUpdate(item._id, { image: newUrl });
                    syncedCount++;
                }
            }
        }

        // Sync Movies
        for (const item of movies) {
            if (item.image && item.image.startsWith('http')) {
                const newUrl = await uploadFromUrl(item.image);
                if (newUrl !== item.image) {
                    await Movie.findByIdAndUpdate(item._id, { image: newUrl });
                    syncedCount++;
                }
            }
        }

        // Sync Celebrities
        for (const item of celebs) {
            if (item.image && item.image.startsWith('http')) {
                const newUrl = await uploadFromUrl(item.image);
                if (newUrl !== item.image) {
                    await Celebrity.findByIdAndUpdate(item._id, { image: newUrl });
                    syncedCount++;
                }
            }
        }

        // Sync Videos
        for (const item of videos) {
            if (item.image && item.image.startsWith('http')) {
                const newUrl = await uploadFromUrl(item.image);
                if (newUrl !== item.image) {
                    await Video.findByIdAndUpdate(item._id, { image: newUrl });
                    syncedCount++;
                }
            }
        }

        res.json({ success: true, message: `Successfully synchronized ${syncedCount} images to Cloudinary.`, syncedCount });
    } catch (err) {
        console.error("Bulk Sync Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Auto-generate SEO records ONLY for Celebrities with specific template
router.post('/auto-generate-celebs', async (req, res) => {
    try {
        const celebs = await Celebrity.find({}, 'name slug');
        let updatedCount = 0;

        for (const item of celebs) {
            const url = `/celebrities/${item.slug || item._id}`.toLowerCase();
            const title = `${item.name} Latest News & Video Today | ${item.name} Aaj ki News | ${item.name} Profile`;
            const description = `Get the ${item.name} latest news, ${item.name} videos, biography, career updates, Profile, ${item.name} today’s trending stories & ${item.name} News in Hindi & English.`;

            await SEO.findOneAndUpdate(
                { url },
                { 
                    title, 
                    description, 
                    isAuto: true,
                    robots: 'index, follow'
                },
                { upsert: true, new: true }
            );
            updatedCount++;
        }

        res.json({ 
            success: true, 
            message: `Successfully updated SEO for ${updatedCount} celebrities.`,
            count: updatedCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
