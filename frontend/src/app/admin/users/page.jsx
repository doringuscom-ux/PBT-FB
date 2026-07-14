import Component from '@/admin/ManageUsers';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Users | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
