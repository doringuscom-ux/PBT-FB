import Component from '@/admin/ManageNews';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage News | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
