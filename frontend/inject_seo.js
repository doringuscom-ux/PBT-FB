const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app');

const staticRoutes = [
    { dir: '', url: '/', defaultTitle: 'Pbtadka | Latest News, Movies & Celebrity Updates' },
    { dir: 'latest-movies', url: '/latest-movies', defaultTitle: 'Movie List | Pbtadka' },
    { dir: 'celebrities', url: '/celebrities', defaultTitle: 'Celebrities | Pbtadka' },
    { dir: 'latest-news', url: '/latest-news', defaultTitle: 'Latest News | Pbtadka' },
    { dir: 'latest-viral-videos', url: '/latest-viral-videos', defaultTitle: 'Viral Videos | Pbtadka' },
    { dir: 'movie-box-office', url: '/movie-box-office', defaultTitle: 'Box Office | Pbtadka' },
    { dir: 'latest-news/sports', url: '/latest-news/sports', defaultTitle: 'Sports News | Pbtadka' },
    { dir: 'latest-news/today', url: '/latest-news/today', defaultTitle: 'Today News | Pbtadka' },
    { dir: 'latest-movies/upcoming', url: '/latest-movies/upcoming', defaultTitle: 'Upcoming Movies | Pbtadka' },
    { dir: 'contact-us', url: '/contact-us', defaultTitle: 'Contact Us | Pbtadka' }
];

staticRoutes.forEach(route => {
    let filePath = path.join(baseDir, route.dir, 'page.jsx');
    if (!fs.existsSync(filePath)) {
        filePath = path.join(baseDir, route.dir, 'page.js');
    }
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove static metadata
        content = content.replace(/export const metadata = \{[\s\S]*?\};/g, '');
        // Remove any existing generateMetadata
        content = content.replace(/export async function generateMetadata\(\) \{[\s\S]*?^}/gm, '');
        
        // Ensure api is imported
        if (!content.includes("import api from '@/api'")) {
            content = "import api from '@/api';\n" + content;
        }

        const metadataStr = `
export async function generateMetadata() {
    try {
        const res = await api.get(\`/seo/metadata?url=${route.url}\`);
        if (res.data) {
            return {
                title: res.data.title,
                description: res.data.description,
                keywords: res.data.keywords,
                alternates: {
                    canonical: res.data.canonical || \`https://pbtadka.com${route.url}\`
                },
                openGraph: {
                    title: res.data.title,
                    description: res.data.description,
                    url: res.data.canonical || \`https://pbtadka.com${route.url}\`,
                    images: res.data.ogImage ? [{ url: res.data.ogImage }] : [],
                }
            };
        }
    } catch (err) {}

    return {
        title: '${route.defaultTitle}',
        description: 'Latest updates at Pbtadka.',
    };
}
`;

        // Insert metadataStr before the default export
        const exportIndex = content.indexOf('export default function');
        if (exportIndex !== -1) {
            content = content.slice(0, exportIndex) + metadataStr + '\n' + content.slice(exportIndex);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log("Updated " + filePath);
        } else {
            console.log("Could not find export default in " + filePath);
        }
    }
});
