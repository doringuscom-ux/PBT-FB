import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const MovieCalendar = () => {
  const { movies } = useData();
  const scrollRef = useRef(null);

  // Filter for movies with a release date in the future
  const upcomingMovies = movies
    .filter(movie => movie.releaseDate && new Date(movie.releaseDate) > new Date())
    .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));

  if (upcomingMovies.length === 0) return null;

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = 300;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    const slider = scrollRef.current;
    if (!slider || upcomingMovies.length === 0) return;

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
  }, [upcomingMovies]);

  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-600/50"></span>
                <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Upcoming & Beyond</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                Movie <span className="text-red-600">Calendar</span>
            </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-2 mr-4">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-red-600 hover:text-red-600 transition-all"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-red-600 hover:text-red-600 transition-all"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
          <Link to="/latest-movies" className="text-slate-900 text-[10px] lg:text-[11px] font-black uppercase hover:text-red-600 flex items-center gap-2 tracking-widest transition-colors mb-2">
              View Schedule <i className="fas fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden h-[2px] w-full bg-slate-100 rounded-full">
        <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-slide-infinite"></div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {upcomingMovies.map((movie, index) => {
          const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
          return (
            <Link 
              key={movie._id} 
              to={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`}
            className="min-w-[180px] bg-white rounded-lg overflow-hidden shadow-lg hover:-translate-y-1 transition-transform group no-underline text-inherit animate-slide-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="relative h-[250px] overflow-hidden">
                <img 
                src={movie.image} 
                alt={movie.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Date Badge */}
                <div className="absolute top-3 left-3 bg-yellow-400 text-[#0f172a] px-2 py-1 rounded-md flex flex-col items-center justify-center min-w-[35px] shadow-lg backdrop-blur-sm scale-90 font-black">
                    { (movie.isReleaseDateConfirmed && movie.releaseDate) ? (
                        <>
                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-90 leading-none mb-0.5">
                                {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-sm font-black leading-none uppercase">
                                {new Date(movie.releaseDate).getDate()}
                            </span>
                        </>
                    ) : (
                        <span className="text-[10px] font-black uppercase tracking-tighter px-1">TBA</span>
                    )}
                </div>
            </div>

            <div className="p-4 bg-white">
              <h3 className="font-bold mb-1.5 text-lg truncate group-hover:text-[#0f172a] transition-colors">
                {movie.title}
              </h3>
              <div className="text-slate-400 text-xs flex justify-between items-center font-bold uppercase tracking-tighter">
                <span>{movie.genre}</span>
                <span className="text-yellow-500 italic">COMING SOON</span>
              </div>
            </div>
          </Link>
            );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
};

export default MovieCalendar;
