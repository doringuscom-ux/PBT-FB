"use client";
import Link from 'next/link';
import React, { useRef } from 'react';
import { useData } from '../context/DataContext';

const MovieCalendar = () => {
  const { movies } = useData();
  const scrollRef = useRef(null);

  // Filter for movies with a release date in the future
  const upcomingMovies = movies
    .filter(movie => movie.releaseDate && new Date(movie.releaseDate) > new Date())
    .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
    .slice(0, 12);

  if (upcomingMovies.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="my-4 px-4 lg:px-20 xl:px-32 2xl:px-48">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-xl md:text-2xl">Upcoming Releases</h3>
        </div>
        <Link href="/latest-movies" className="text-[13px] font-normal text-red-500 hover:text-red-600 flex items-center gap-1">
          View Schedule <i className="fas fa-angle-right text-[11px]"></i>
        </Link>
      </div>

      {/* Slider Container */}
      <div className="relative group/slider">
        {/* Left Button */}
        <button
          onClick={(e) => { e.preventDefault(); scroll('left'); }}
          className="absolute left-0 top-[40%] -translate-y-1/2 -ml-3 lg:-ml-5 z-10 w-10 h-10 rounded-full bg-black/60 shadow-md flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-opacity backdrop-blur-sm"
        >
          <i className="fas fa-chevron-left text-sm"></i>
        </button>

        {/* Scroll Area */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 lg:gap-6 snap-x snap-mandatory hide-scrollbar pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>

          {upcomingMovies.map((movie, index) => {
            const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
            return (
              <Link
                key={movie._id}
                href={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`}
                className="group no-underline flex flex-col snap-start shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-19px)] animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image Container */}
                <div className="w-full aspect-[4/5] sm:aspect-[4/5] md:aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden bg-slate-100 relative mb-3">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <CountdownTimer targetDate={movie.releaseDate} />
                  
                  {/* Date Badge */}
                  <div className="absolute top-2 left-2 bg-[#f84464] text-white px-2 py-1 rounded-lg flex flex-col items-center justify-center min-w-[42px] shadow-lg backdrop-blur-sm font-black border border-white/20">
                      { (movie.isReleaseDateConfirmed && movie.releaseDate) ? (
                          <>
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-90 leading-none mb-0.5">
                                  {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-[16px] font-black leading-none uppercase">
                                  {new Date(movie.releaseDate).getDate()}
                              </span>
                          </>
                      ) : (
                          <span className="text-[11px] font-black uppercase tracking-widest px-1">TBA</span>
                      )}
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-semibold text-[#333333] text-[14px] md:text-[16px] leading-snug truncate group-hover:text-red-600 transition-colors">
                  {movie.title}
                </h4>

                {/* Genre / Subtitle */}
                <p className="text-[#666666] text-[12px] md:text-[14px] truncate mt-1 capitalize">
                  {movie.genre || 'Action/Drama'}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Right Button */}
        <button
          onClick={(e) => { e.preventDefault(); scroll('right'); }}
          className="absolute right-0 top-[40%] -translate-y-1/2 -mr-3 lg:-mr-5 z-10 w-10 h-10 rounded-full bg-black/60 shadow-md flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-opacity backdrop-blur-sm"
        >
          <i className="fas fa-chevron-right text-sm"></i>
        </button>
      </div>
    </div>
  );
};

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) return 'RELEASED';
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTime());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#000000e6] px-3 py-2 flex items-center text-white text-[11px] md:text-[13px]">
      <i className="fas fa-stopwatch text-[#f84464] text-[11px] md:text-[12px] mr-2 animate-pulse"></i>
      <span className="font-medium tracking-wide uppercase">
        Releasing in {timeLeft}
      </span>
    </div>
  );
};

export default MovieCalendar;
