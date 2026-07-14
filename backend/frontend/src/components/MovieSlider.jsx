import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const MovieSlider = () => {
  const { movies } = useData();
  const sliderRef = useRef(null);

  // Filter for movies that are already released (past confirmed dates or explicit released status)
  const releasedMovies = movies.filter(m => {
    const today = new Date();
    const isConfirmedPast = m.isReleaseDateConfirmed && m.releaseDate && new Date(m.releaseDate) <= today;
    const isExplicitlyReleased = m.performance?.status === 'Released' || m.performance?.status === 'Blockbuster' || m.performance?.status === 'Hit';
    return isConfirmedPast || isExplicitlyReleased;
  });

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || releasedMovies.length === 0) return (
      <div className="mb-12 w-full h-[350px] skeleton rounded-3xl opacity-30"></div>
    );

    let intervalId = null;
    const scrollStep = 1;
    const scrollSpeed = 30;

    const startScrolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!slider) return;
        slider.scrollLeft += scrollStep;
        
        if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 1) {
          slider.scrollLeft = 0;
        }
      }, scrollSpeed);
    };

    startScrolling();

    const handleMouseEnter = () => {
        if (intervalId) clearInterval(intervalId);
    };
    const handleMouseLeave = () => startScrolling();

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('touchstart', handleMouseEnter, { passive: true });
    slider.addEventListener('touchend', handleMouseLeave, { passive: true });

    return () => {
      if (intervalId) clearInterval(intervalId);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('touchstart', handleMouseEnter);
      slider.removeEventListener('touchend', handleMouseLeave);
    };
  }, [releasedMovies]);

  return (
    <div className="mb-12">
      <div className="mb-10">
        <div className="flex items-center justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Premium Selection</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              Latest <span className="text-red-600">Movies</span>
            </h2>
          </div>
          <Link to="/latest-movies" className="text-slate-900 font-black no-underline text-[10px] lg:text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-2 mb-2">
            View All <i className="fas fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </div>
      
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto gap-5 pb-5 movies-slider"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>
          {`
            .movies-slider::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {releasedMovies.map((movie) => {
          const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
          return (
            <Link to={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`} key={movie._id} className="min-w-[180px] bg-white rounded-lg overflow-hidden shadow-lg hover:-translate-y-1 transition-transform group no-underline text-inherit">
            <img 
              src={movie.image} 
              alt={movie.title} 
              className="w-full h-[250px] object-cover transition-transform group-hover:scale-105"
            />
            <div className="p-4">
              <div className="font-bold mb-1.5 text-lg truncate group-hover:text-primary-red transition-colors">{movie.title}</div>
              <div className="text-text-gray text-xs flex justify-between">
                <span>{movie.year}</span>
                <span className="text-accent-gold font-bold">⭐ {movie.rating}</span>
              </div>
            </div>
          </Link>
            );
        })}
      </div>
    </div>
  );
};

export default MovieSlider;
