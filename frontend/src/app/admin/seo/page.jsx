import Component from '@/admin/SEOManager';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'S E O Manager | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
