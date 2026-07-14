import Component from '@/admin/ManageCelebs';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Celebs | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
