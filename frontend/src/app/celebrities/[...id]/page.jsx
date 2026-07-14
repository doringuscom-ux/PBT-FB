import LatestCelebsRouter from '@/components/LatestCelebsRouter';
import api from '@/api';

export async function generateMetadata({ params }) {
    // Next.js 15 requires awaiting params
    const resolvedParams = await params;
    const rawId = resolvedParams.id; const id = Array.isArray(rawId) ? rawId.join('/') : rawId;
    
    try {
        const res = await api.get(`/seo/metadata?url=/celebrities/${id}`);
        if (res.data) {
            return {
                title: res.data.title,
                description: res.data.description,
                keywords: res.data.keywords || 'film news, movie reviews, bollywood, pollywood, celebrity updates',
                alternates: {
                    canonical: res.data.canonical || `https://pbtadka.com/celebrities/${id}`
                },
                openGraph: {
                    title: res.data.title,
                    description: res.data.description,
                    url: res.data.canonical || `https://pbtadka.com/celebrities/${id}`,
                    images: res.data.ogImage ? [{ url: res.data.ogImage }] : [],
                }
            };
        }
    } catch (err) {
        // Fallback
    }

    // Fallback title formatting
    const formattedTitle = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return {
        title: `${formattedTitle} | Pbtadka`,
        description: 'Latest film news, movie reviews, celebrity updates, and more at Pbtadka.',
    };
}

import MainLayout from '@/layouts/MainLayout';

export default async function Page() {
    return (
        <MainLayout>
            <LatestCelebsRouter />
        </MainLayout>
    );
}
