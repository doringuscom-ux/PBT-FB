import ManageInquiries from '@/admin/ManageInquiries';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: 'WhatsApp Leads | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <ManageInquiries mode="whatsapp" />
        </AdminLayout>
    );
}
