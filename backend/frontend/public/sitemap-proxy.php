<?php
/**
 * Robust PHP Proxy for Dynamic Sitemap
 * Uses cURL to fetch the sitemap from the backend and serves it from the frontend domain.
 * Optimized for Hostinger/Shared Hosting environments.
 */

// Set header to XML
header('Content-Type: application/xml; charset=utf-8');

// The live backend sitemap URL
$backendSitemapUrl = 'https://pbt-liart.vercel.app/sitemap.xml';

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $backendSitemapUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Sitemap Proxy)');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Bypass SSL verification if backend has cert issues or host has outdated CA bundle

// Execute and fetch
$sitemap = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// In PHP 8.0+, curl handles are automatically closed when they go out of scope.
// curl_close() is deprecated in PHP 8.5.
if ($sitemap === false || $httpCode !== 200) {
    // If fetch fails, return a minimal sitemap or log error
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    echo '  <url>';
    echo '    <loc>https://pbtadka.com/</loc>';
    echo '    <changefreq>daily</changefreq>';
    echo '    <priority>1.0</priority>';
    echo '  </url>';
    echo '</urlset>';
} else {
    echo $sitemap;
}
?>