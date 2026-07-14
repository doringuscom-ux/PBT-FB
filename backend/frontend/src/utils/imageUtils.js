export const optimizeImage = (url, width = 500) => {
    if (!url) return '';
    
    // Check if it's a Cloudinary URL
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        // Prevent double optimization if already parameterized
        if (url.includes('q_auto') || url.includes('f_auto') || url.includes('w_')) {
            return url;
        }
        
        // Add auto format, auto quality, and width limit
        const params = `c_limit,w_${width},f_auto,q_auto`;
        return url.replace('/upload/', `/upload/${params}/`);
    }
    
    return url;
};
