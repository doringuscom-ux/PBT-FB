import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import api from '../api';

const SEOHead = () => {
    const location = useLocation();
    const [metadata, setMetadata] = useState(null);
    const [h1Title, setH1Title] = useState('');
    

    useEffect(() => {
        const fetchMetadata = async () => {
            setMetadata(null); // Reset metadata on each navigation
            setH1Title('');   // Reset H1 title to allow fresh scraping
            try {
                const res = await api.get('/seo/metadata', {
                    params: { url: location.pathname }
                });
                setMetadata(res.data);
            } catch (err) {
                setMetadata(null); // Fallback handled by h1Title logic below
            }
        };

        fetchMetadata();
    }, [location.pathname]);

    // MutationObserver to catch the <h1> from the page content automatically
    useEffect(() => {
        if (metadata?.title) return;

        const findH1 = () => {
            const h1 = document.querySelector('h1');
            if (h1 && h1.innerText) {
                const text = h1.innerText.replace(/'/g, '').trim();
                if (text && text !== h1Title) {
                    setH1Title(text);
                }
            }
        };

        const timeoutId = setTimeout(findH1, 500);
        const observer = new MutationObserver(() => findH1());
        observer.observe(document.body, { childList: true, subtree: true });
        
        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [location.pathname, metadata, h1Title]);

    // Helper to generate a clean title from the URL path if metadata is missing
    const generateFallbackTitle = () => {
        const path = location.pathname.replace(/\/$/, '').split('/').pop();
        if (!path || path === '') return 'Pbtadka | Latest News, Movies & Celebs';
        
        // Convert slug-style-path to Title Case
        const title = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return `${title} | Pbtadka`;
    };

    const displayTitle = metadata?.title || (h1Title ? `${h1Title} | Pbtadka` : generateFallbackTitle());
    const displayDescription = metadata?.description || 'Latest film news, movie reviews, celebrity updates, and more at Pbtadka.';
    
    // Automatic Canonical URL - Force lowercase and remove trailing slash for indexing consistency
    const currentPath = location.pathname.toLowerCase().replace(/\/$/, '') || '';
    const canonicalUrl = metadata?.canonical || `https://pbtadka.com${currentPath}`;

    return (
        <Helmet>
            <title>{displayTitle}</title>
            <meta name="description" content={displayDescription} />
            <meta name="keywords" content={metadata?.keywords || 'film news, movie reviews, bollywood, pollywood, celebrity updates'} />
            
            {/* Robots Tag - Default to index, follow for SEO */}
            <meta name="robots" content={metadata?.robots || 'index, follow'} />
            
            {/* Canonical Tag - CRITICAL for fixing duplicate content issues */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={displayTitle} />
            <meta property="og:description" content={displayDescription} />
            <meta property="og:image" content={metadata?.ogImage || 'https://pbtadka.com/og-image.jpg'} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={displayTitle} />
            <meta name="twitter:description" content={displayDescription} />
            <meta name="twitter:image" content={metadata?.ogImage || 'https://pbtadka.com/og-image.jpg'} />
        </Helmet>
    );
};

export default SEOHead;
