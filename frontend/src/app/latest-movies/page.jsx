import Component from '@/old_pages/MovieList';
import MainLayout from '@/layouts/MainLayout';

import api from '@/api';




export async function generateMetadata() {
    try {
        const res = await api.get(`/seo/metadata?url=/latest-movies`);
        if (res.data) {
            return {
                title: res.data.title,
                description: res.data.description,
                keywords: res.data.keywords,
                alternates: {
                    canonical: res.data.canonical || `https://pbtadka.com/latest-movies`
                },
                openGraph: {
                    title: res.data.title,
                    description: res.data.description,
                    url: res.data.canonical || `https://pbtadka.com/latest-movies`,
                    images: res.data.ogImage ? [{ url: res.data.ogImage }] : [],
                }
            };
        }
    } catch (err) {}

    return {
        title: 'Movie List | Pbtadka',
        description: 'Latest updates at Pbtadka.',
    };
}

export default function Page() {
    return (
        <MainLayout>
            <Component />
        </MainLayout>
    );
}
