import Component from '@/admin/ManageUpcoming';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Upcoming | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
