import Component from '@/admin/ManageComments';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Comments | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
