import Component from '@/admin/ManageSports';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Sports | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
