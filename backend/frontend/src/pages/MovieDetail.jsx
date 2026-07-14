import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import MovieDetailLayout from './MovieDetailLayout';

const MovieDetail = () => {
    const params = useParams();
    const id = params['*'];
    const { movies, news, addMovieComment, likeMovieComment, updateMovieComment, deleteMovieComment } = useData();
    
    // Find movie by ID or Slug
    const movie = movies.find(item => item._id === id || item.slug === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const sidebarNews = [...news].sort(() => 0.5 - Math.random()).slice(0, 6);

    if (!movie) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 bg-gray-50">
            <i className="fas fa-film text-gray-200 text-6xl mb-4"></i>
            <h2 className="text-xl font-black uppercase text-slate-400">Movie not found</h2>
            <p className="text-gray-300 text-xs font-bold uppercase tracking-widest mt-2 italic">The requested content may have been moved or deleted.</p>
        </div>
    );

    return (
        <MovieDetailLayout 
            movie={movie} 
            sidebarNews={sidebarNews} 
        />
    );
};

export default MovieDetail;
