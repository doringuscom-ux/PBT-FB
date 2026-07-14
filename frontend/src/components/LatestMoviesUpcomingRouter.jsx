"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import MovieDetail from '@/old_pages/MovieDetail';
import UpcomingList from '@/old_pages/UpcomingList';
import { useData } from '@/context/DataContext';

export default function LatestMoviesUpcomingRouter() {
    const params = useParams();
    const rawId = params?.id || params?.param || params?.['*']; 
    const id = Array.isArray(rawId) ? rawId.join('/') : rawId;
    const { movies } = useData();

    // Check if ID matches a movie
    const isMovie = movies.some(item => item._id === id || item.slug === id);

    // If it's a known movie, render the detail page.
    // Otherwise, assume it's a category (like south-indian, bollywood) and render the list.
    if (isMovie) {
        return <MovieDetail />;
    } else {
        return <UpcomingList />;
    }
}
