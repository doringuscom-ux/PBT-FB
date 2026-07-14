import api from '@/api';
import Component from '@/old_pages/UpcomingList';
import MainLayout from '@/layouts/MainLayout';




export async function generateMetadata() {
    try {
        const res = await api.get(`/seo/metadata?url=/latest-movies/upcoming`);
        if (res.data) {
            return {
                title: res.data.title,
                description: res.data.description,
                keywords: res.data.keywords,
                alternates: {
                    canonical: res.data.canonical || `https://pbtadka.com/latest-movies/upcoming`
                },
                openGraph: {
                    title: res.data.title,
                    description: res.data.description,
                    url: res.data.canonical || `https://pbtadka.com/latest-movies/upcoming`,
                    images: res.data.ogImage ? [{ url: res.data.ogImage }] : [],
                }
            };
        }
    } catch (err) {}

    return {
        title: 'Upcoming Movies | Pbtadka',
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
