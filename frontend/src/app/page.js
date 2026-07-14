import HomeClient from '@/components/HomeClient';
import api from '@/api';

export async function generateMetadata() {
    try {
        const res = await api.get(`/seo/metadata?url=/`);
        if (res.data) {
            return {
                title: res.data.title,
                description: res.data.description,
                keywords: res.data.keywords,
                alternates: {
                    canonical: res.data.canonical || `https://pbtadka.com/`
                },
                openGraph: {
                    title: res.data.title,
                    description: res.data.description,
                    url: res.data.canonical || `https://pbtadka.com/`,
                    images: res.data.ogImage ? [{ url: res.data.ogImage }] : [],
                }
            };
        }
    } catch (err) {}

    return {
        title: 'Pbtadka | Latest News, Movies & Celebrity Updates',
        description: 'Latest updates at Pbtadka.',
    };
}

export default function Home() {
    return <HomeClient />;
}
