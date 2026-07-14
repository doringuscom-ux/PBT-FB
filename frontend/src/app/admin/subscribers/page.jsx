import Component from '@/admin/ManageSubscribers';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Subscribers | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
