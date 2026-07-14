const express = require('express');
const router = express.Router();
const News = require('../models/News');
const Movie = require('../models/Movie');
const Celebrity = require('../models/Celebrity');
const Video = require('../models/Video');

const BASE_URL = process.env.FRONTEND_URL || 'https://pbtadka.com';

router.get('/', async (req, res) => {
  try {
    const [news, movies, celebs, videos] = await Promise.all([
      News.find({}, 'slug updatedAt'),
      Movie.find({}, 'slug updatedAt releaseDate'),
      Celebrity.find({}, 'slug updatedAt industry'),
      Video.find({}, 'slug updatedAt')
    ]);

    const staticPages = [
      '',
      '/latest-news',
      '/latest-movies',
      '/celebrities',
      '/latest-viral-videos',
      '/movie-box-office',
      '/contact-us',
      '/latest-news/today',
      '/latest-movies/upcoming',
      '/latest-news/sports'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      const url = `${BASE_URL}${page}`.toLowerCase().replace(/\/$/, '');
      xml += `
  <url>
    <loc>${url === '' ? BASE_URL : url}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Add News
    news.forEach(item => {
      if (item.slug) {
        const url = `${BASE_URL}/latest-news/${item.slug}`.toLowerCase().replace(/\/$/, '');
        xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${item.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    // Add Movies
    movies.forEach(item => {
      if (item.slug) {
        const isReleased = item.releaseDate && new Date(item.releaseDate) <= new Date();
        const pathPrefix = isReleased ? '/latest-movies' : '/latest-movies/upcoming';
        const url = `${BASE_URL}${pathPrefix}/${item.slug}`.toLowerCase().replace(/\/$/, '');
        xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${item.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    // Add Celebs
    celebs.forEach(item => {
      if (item.slug) {
        const url = `${BASE_URL}/celebrities/${item.slug}`.toLowerCase().replace(/\/$/, '');
        xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${item.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    });

    // Add Celebrity Industry Pages
    const industries = [...new Set(celebs.map(c => c.industry).filter(Boolean))];
    industries.forEach(ind => {
      const slugifiedInd = ind.toLowerCase().trim().replace(/\s+/g, '-');
      const url = `${BASE_URL}/celebrities/${slugifiedInd}`.replace(/\/$/, '');
      xml += `
  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add Videos
    videos.forEach(item => {
      if (item.slug) {
        const url = `${BASE_URL}/latest-viral-videos/${item.slug}`.toLowerCase().replace(/\/$/, '');
        xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${item.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error("Sitemap Error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

module.exports = router;