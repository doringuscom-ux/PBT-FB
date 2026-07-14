"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import CelebDetail from '@/old_pages/CelebDetail';
import CelebList from '@/old_pages/CelebList';
import { useData } from '@/context/DataContext';

export default function LatestCelebsRouter() {
    const params = useParams();
    const rawId = params?.id || params?.param || params?.['*']; 
    const id = Array.isArray(rawId) ? rawId.join('/') : rawId;
    const { celebs } = useData();

    // Check if ID matches a celeb
    const isCeleb = celebs.some(item => item._id === id || item.slug === id);

    // If it's a known celeb, render the detail page.
    // Otherwise, assume it's a category (like bollywood) and render the list.
    if (isCeleb) {
        return <CelebDetail />;
    } else {
        return <CelebList />;
    }
}
