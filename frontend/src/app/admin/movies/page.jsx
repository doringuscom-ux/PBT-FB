import Component from '@/admin/ManageMovies';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Manage Movies | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}
