import ManageInquiries from '@/admin/ManageInquiries';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'Promotion Leads | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <ManageInquiries mode="promotions" />
        </AdminLayout>
    );
}
