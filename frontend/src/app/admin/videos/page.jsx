import Component from '@/admin/ManageVideos';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Videos | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
