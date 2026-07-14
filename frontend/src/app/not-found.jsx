import React from 'react';
import NotFoundComponent from '@/components/NotFound';
import MainLayout from '@/layouts/MainLayout';

export const metadata = {
    title: '404 - Page Not Found | Pbtadka',
    description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
    return (
        <MainLayout>
            <NotFoundComponent />
        </MainLayout>
    );
}
