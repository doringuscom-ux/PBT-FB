import Component from '@/old_pages/SearchPage';
import MainLayout from '@/layouts/MainLayout';

export const metadata = {
    title: 'Search Page | Pbtadka',
};

export default function Page() {
    return (
        <MainLayout>
            <Component />
        </MainLayout>
    );
}
