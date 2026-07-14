"use client";
import Link from 'next/link';
import { useRef } from 'react';
import { useData } from '../context/DataContext';

export default function CompactMoviesSlider() {
  const { movies } = useData();

  if (!movies || movies.length === 0) return null;

  // Filter for movies that are already released (past confirmed dates or explicit released status)
  const releasedMovies = movies.filter(m => {
    const today = new Date();
    const isConfirmedPast = m.isReleaseDateConfirmed && m.releaseDate && new Date(m.releaseDate) <= today;
    const isExplicitlyReleased = m.performance?.status === 'Released' || m.performance?.status === 'Blockbuster' || m.performance?.status === 'Hit';
    return isConfirmedPast || isExplicitlyReleased;
  });

  if (releasedMovies.length === 0) return null;

  // Take 12 items so we have enough to scroll through
  const displayMovies = releasedMovies.slice(0, 12);

  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-0 mb-4 px-4 lg:px-20 xl:px-32 2xl:px-48">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-xl md:text-2xl">Trending Movies</h3>
        </div>
        <Link href="/latest-movies" className="text-[13px] font-normal text-red-500 hover:text-red-600 flex items-center gap-1">
          See All <i className="fas fa-angle-right text-[11px]"></i>
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

          {displayMovies.map((movie) => {
            const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
            return (
              <Link
                key={movie._id}
                href={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`}
                className="group no-underline flex flex-col snap-start shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-19px)]"
              >
                {/* Image Container */}
                <div className="w-full aspect-[4/5] sm:aspect-[4/5] md:aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden bg-slate-100 relative mb-3">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Bottom Overlay - Rating/Votes */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#000000e6] px-3 py-2 flex items-center gap-2 text-white text-[11px] md:text-[13px]">
                    <i className="fas fa-star text-[#f84464] text-[11px] md:text-[12px]"></i>
                    <span className="font-medium tracking-wide">
                      {movie.rating ? Number(movie.rating).toFixed(1) : (movie.averageRating ? movie.averageRating.toFixed(1) : (Math.random() * (9.8 - 7.5) + 7.5).toFixed(1))}/10
                      <span className="ml-2 font-normal text-gray-200">{movie.views ? Math.floor(movie.views / 1000) + 'K+' : Math.floor(Math.random() * 50 + 10) + 'K+'} Votes</span>
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-semibold text-[#333333] text-[14px] md:text-[16px] leading-snug truncate group-hover:text-red-600 transition-colors">
                  {movie.title}
                </h4>

                {/* Genre / Subtitle */}
                <p className="text-[#666666] text-[12px] md:text-[14px] truncate mt-1 capitalize">
                  {movie.genres ? (Array.isArray(movie.genres) ? movie.genres.join('/') : movie.genres) : 'Action/Drama/Thriller'}
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
}
