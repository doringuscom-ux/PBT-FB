import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FilterBar from '../components/FilterBar';
import MovieCard from '../components/MovieCard';

const UpcomingList = () => {
  const { movies } = useData();
  const params = useParams();
  const param = params.param || params['*'];

  const industries = ['ALL', ...new Set(movies.filter(m => m.industry).map(m => m.industry.trim()))];
  
  // Find the original industry name from the slugified param
  const activeIndustry = industries.find(ind => 
    ind.toLowerCase().trim().replace(/\s+/g, '-') === param?.toLowerCase()
  ) || 'ALL';

  const upcomingMovies = movies.filter(m => {
    const today = new Date();
    const isReleased = m.releaseDate && new Date(m.releaseDate) <= today;
    
    // If already released by date, it's not upcoming anymore
    if (isReleased) return false;

    // Show if release date is in the future OR if it's explicitly marked as unconfirmed (TBA)
    const isFuture = m.releaseDate && new Date(m.releaseDate) > today;
    const isTBA = m.isReleaseDateConfirmed === false;
    
    return isFuture || isTBA;
  }).sort((a, b) => {
    // Confirmed dates first (earliest to latest), then TBA
    if (a.isReleaseDateConfirmed && !b.isReleaseDateConfirmed) return -1;
    if (!a.isReleaseDateConfirmed && b.isReleaseDateConfirmed) return 1;
    if (a.releaseDate && b.releaseDate) return new Date(a.releaseDate) - new Date(b.releaseDate);
    return 0;
  });

  const filteredMovies = activeIndustry === 'ALL' 
    ? upcomingMovies 
    : upcomingMovies.filter(m => m.industry?.trim() === activeIndustry);

  return (
    <div className="bg-[#050505] min-h-screen">
        {/* Dynamic Hero Section */}
        <div className="relative h-auto py-3 md:py-5 flex items-center justify-center overflow-hidden">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                    alt="Upcoming Cinema" 
                    className="w-full h-full object-cover blur-sm brightness-[0.2] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]"></div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-5xl animate-slide-up">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-[5px] tracking-tighter leading-none uppercase drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 md:gap-8">
                    <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-r from-transparent to-yellow-500"></div>
                    <span>UPCOMING <span className="text-yellow-400 text-shadow-premium">RELEASES</span></span>
                    <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-l from-transparent to-yellow-500"></div>
                </h1>
                
                <div className="relative inline-block w-full max-w-2xl">
                    <p className="text-white/90 text-xs md:text-sm font-bold mx-auto leading-relaxed italic tracking-[0.05em] px-4 md:px-8 py-3 border-y border-white/10 uppercase drop-shadow-md">
                        Get ready for the most awaited cinematic experiences hitting the global screens soon
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
                    linkGenerator={(opt) => opt === 'ALL' ? '/latest-movies/upcoming' : `/latest-movies/upcoming/${opt.toLowerCase().trim().replace(/\s+/g, '-')}`}
                    label="Industry" 
                />
            </div>
            
            {/* Movie Grid */}

            {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
                    {filteredMovies.map((movie) => (
                        <MovieCard key={movie._id} movie={movie} isUpcoming={true} />
                    ))}
                </div>
            ) : (
                <div className="glass-panel py-32 rounded-[3rem] text-center border-2 border-dashed border-white/5">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20 text-4xl">
                        <i className="fas fa-calendar-alt"></i>
                    </div>
                    <h2 className="text-2xl font-black text-white/40 italic uppercase tracking-widest mb-2">No Upcoming Movies</h2>
                    <p className="text-white/30 text-sm font-medium">Keep an eye out for future announcements!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default UpcomingList;
