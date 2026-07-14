import Component from '@/admin/Dashboard';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Dashboard | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
