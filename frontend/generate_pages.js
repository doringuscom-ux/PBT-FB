const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app');

const routes = [
    { path: 'latest-news', component: 'NewsList' },
    { path: 'latest-news/today', component: 'TodayNews' },
    { path: 'latest-news/sports', component: 'SportsList' },
    { path: 'latest-news/[id]', component: 'NewsDetail', isDynamic: true },
    { path: 'latest-movies', component: 'MovieList' },
    { path: 'latest-movies/upcoming', component: 'UpcomingList' },
    { path: 'latest-movies/upcoming/[id]', component: 'MovieDetail', isDynamic: true },
    { path: 'latest-movies/[id]', component: 'MovieDetail', isDynamic: true },
    { path: 'actor/[id]', component: 'ActorDetail', isDynamic: true },
    { path: 'celebrities', component: 'CelebList' },
    { path: 'latest-viral-videos', component: 'VideosList' },
    { path: 'latest-viral-videos/[id]', component: 'VideoDetail', isDynamic: true },
    { path: 'search', component: 'SearchPage' },
    { path: 'contact-us', component: 'ContactUs' },
    { path: 'movie-box-office', component: 'BoxOffice' },
    { path: 'submit-content', component: 'SubmitContent' }
];

routes.forEach(route => {
    const dirPath = path.join(baseDir, route.path);
    fs.mkdirSync(dirPath, { recursive: true });

    let content = '';

    if (route.isDynamic) {
        // Calculate the base URL path for the SEO API request
        const basePath = route.path.replace('/[id]', '');
        
        content = `import Component from '@/old_pages/${route.component}';
import MainLayout from '@/layouts/MainLayout';
import * as api from '@/api';

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    try {
        const res = await api.get(\`/seo/metadata?url=/\${'${basePath}'}/\${id}\`);
        if (res.data) {
            return {
                title: res.data.title,
                description: res.data.description,
                keywords: res.data.keywords,
                alternates: {
                    canonical: res.data.canonical || \`https://pbtadka.com/\${'${basePath}'}/\${id}\`
                },
                openGraph: {
                    title: res.data.title,
                    description: res.data.description,
                    url: res.data.canonical || \`https://pbtadka.com/\${'${basePath}'}/\${id}\`,
                    images: res.data.ogImage ? [{ url: res.data.ogImage }] : [],
                }
            };
        }
    } catch (err) {}

    const formattedTitle = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return {
        title: \`\${formattedTitle} | Pbtadka\`,
        description: 'Latest updates at Pbtadka.',
    };
}

export default async function Page() {
    return (
        <MainLayout>
            <Component />
        </MainLayout>
    );
}`;
    } else {
        content = `import Component from '@/old_pages/${route.component}';
import MainLayout from '@/layouts/MainLayout';

export const metadata = {
    title: '${route.component.replace(/([A-Z])/g, ' $1').trim()} | Pbtadka',
};

export default function Page() {
    return (
        <MainLayout>
            <Component />
        </MainLayout>
    );
}`;
    }

    fs.writeFileSync(path.join(dirPath, 'page.jsx'), content, 'utf8');
    console.log('Created:', route.path);
});
