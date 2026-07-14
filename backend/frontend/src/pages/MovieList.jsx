import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FilterBar from '../components/FilterBar';
import MovieCard from '../components/MovieCard';

const MovieList = () => {
  const { movies } = useData();
  const params = useParams();
  const param = params.param || params['*'];

  const industries = ['ALL', ...new Set(movies.filter(m => m.industry).map(m => m.industry.trim()))];
  
  // Find the original industry name from the slugified param
  const activeIndustry = industries.find(ind => 
    ind.toLowerCase().trim().replace(/\s+/g, '-') === param?.toLowerCase()
  ) || 'ALL';

  const releasedMovies = movies.filter(m => {
    const today = new Date();
    
    // 1. Confirmed date is today or in the past
    const isConfirmedPast = m.isReleaseDateConfirmed && m.releaseDate && new Date(m.releaseDate) <= today;
    // 2. Explicitly marked as Released (manual override)
    const isExplicitlyReleased = m.performance?.status === 'Released' || m.performance?.status === 'Blockbuster' || m.performance?.status === 'Hit';
    
    return isConfirmedPast || isExplicitlyReleased;
  });

  const filteredMovies = releasedMovies.filter(m => {
    return activeIndustry === 'ALL' || m.industry?.trim() === activeIndustry;
  });

  return (
    <div className="bg-[#050505] min-h-screen w-full overflow-x-hidden">
        {/* Dynamic Hero Section */}
        <div className="relative h-auto py-3 md:py-5 flex items-center justify-center overflow-hidden">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                    alt="Cinema Background" 
                    className="w-full h-full object-cover blur-sm brightness-[0.2] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]"></div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-5xl animate-slide-up">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-[5px] tracking-tighter leading-none uppercase drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 md:gap-8">
                    <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-r from-transparent to-yellow-500"></div>
                    <span>GLOBAL <span className="text-yellow-400 text-shadow-premium">CINEMA</span></span>
                    <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-l from-transparent to-yellow-500"></div>
                </h1>
                
                <div className="relative inline-block w-full max-w-2xl">
                    <p className="text-white/90 text-xs md:text-sm font-bold mx-auto leading-relaxed italic tracking-[0.05em] px-4 md:px-8 py-3 border-y border-white/10 uppercase drop-shadow-md">
                        Explore an elite collection of blockbusters and timeless classics from every corner of the world
                    </p>
                </div>
            </div>
        </div>

        <div className="page-container -mt-4 relative z-20 pb-24">
            {/* Filter Controls - Removed glass-panel bg/rounded */}
            <div className="p-4 md:p-[18px] mb-4 border-b border-white/10">
                <FilterBar 
                    options={industries} 
                    activeFilter={activeIndustry} 
                    linkGenerator={(opt) => opt === 'ALL' ? '/latest-movies' : `/latest-movies/${opt.toLowerCase().trim().replace(/\s+/g, '-')}`}
                    label="Industry" 
                />
            </div>
            
            {/* Movie Grid */}
            {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
                    {filteredMovies.map((movie) => (
                        <MovieCard key={movie._id} movie={movie} />
                    ))}
                </div>
            ) : (
                <div className="glass-panel py-32 rounded-[3rem] text-center border-2 border-dashed border-white/5">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20 text-4xl">
                        <i className="fas fa-film"></i>
                    </div>
                    <h2 className="text-2xl font-black text-white/40 italic uppercase tracking-widest mb-2">No Movies Found</h2>
                    <p className="text-white/30 text-sm font-medium">Try adjusting your filters.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default MovieList;
