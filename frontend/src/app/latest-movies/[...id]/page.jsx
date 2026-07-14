import LatestMoviesRouter from '@/components/LatestMoviesRouter';
import MainLayout from '@/layouts/MainLayout';
import api from '@/api';

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const rawId = resolvedParams.id; const id = Array.isArray(rawId) ? rawId.join('/') : rawId;
    
    try {
        const res = await api.get(`/seo/metadata?url=/${'latest-movies'}/${id}`);
        if (res.data) {
            return {
                title: res.data.title,
                description: res.data.description,
                keywords: res.data.keywords,
                alternates: {
                    canonical: res.data.canonical || `https://pbtadka.com/${'latest-movies'}/${id}`
                },
                openGraph: {
                    title: res.data.title,
                    description: res.data.description,
                    url: res.data.canonical || `https://pbtadka.com/${'latest-movies'}/${id}`,
                    images: res.data.ogImage ? [{ url: res.data.ogImage }] : [],
                }
            };
        }
    } catch (err) {}

    const formattedTitle = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return {
        title: `${formattedTitle} | Pbtadka`,
        description: 'Latest updates at Pbtadka.',
    };
}

export default async function Page() {
    return (
        <MainLayout>
            <LatestMoviesRouter />
        </MainLayout>
    );
}