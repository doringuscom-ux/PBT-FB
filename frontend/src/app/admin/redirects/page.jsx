import Component from '@/admin/ManageRedirects';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Redirects | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
