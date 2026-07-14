const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app', 'admin');
fs.mkdirSync(baseDir, { recursive: true });

const routes = [
    { path: 'login', component: 'AdminLogin', noLayout: true },
    { path: 'dashboard', component: 'Dashboard' },
    { path: 'celebrities', component: 'ManageCelebs' },
    { path: 'comments', component: 'ManageComments' },
    { path: 'inquiries', component: 'ManageInquiries' },
    { path: 'movies', component: 'ManageMovies' },
    { path: 'news', component: 'ManageNews' },
    { path: 'redirects', component: 'ManageRedirects' },
    { path: 'sports', component: 'ManageSports' },
    { path: 'subscribers', component: 'ManageSubscribers' },
    { path: 'upcoming', component: 'ManageUpcoming' },
    { path: 'users', component: 'ManageUsers' },
    { path: 'videos', component: 'ManageVideos' },
    { path: 'seo', component: 'SEOManager' }
];

routes.forEach(route => {
    const dirPath = path.join(baseDir, route.path);
    fs.mkdirSync(dirPath, { recursive: true });

    let content = '';

    if (route.noLayout) {
        content = `import Component from '@/admin/${route.component}';

export const metadata = {
    title: '${route.component.replace(/([A-Z])/g, ' $1').trim()} | Pbtadka Admin',
};

export default function Page() {
    return <Component />;
}`;
    } else {
        content = `import Component from '@/admin/${route.component}';
import AdminLayout from '@/layouts/AdminLayout';

export const metadata = {
    title: '${route.component.replace(/([A-Z])/g, ' $1').trim()} | Pbtadka Admin',
};

export default function Page() {
    return (
        <AdminLayout>
            <Component />
        </AdminLayout>
    );
}`;
    }

    fs.writeFileSync(path.join(dirPath, 'page.jsx'), content, 'utf8');
    console.log('Created:', route.path);
});

// Also create a redirect from /admin to /admin/dashboard
fs.writeFileSync(path.join(baseDir, 'page.jsx'), `import { redirect } from 'next/navigation';

export default function AdminIndex() {
    redirect('/admin/dashboard');
}
`, 'utf8');
