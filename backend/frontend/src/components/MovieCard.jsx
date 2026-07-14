import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie, isUpcoming = false }) => {
  const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
  
  return (
    <div className="group relative flex flex-col bg-transparent transition-all duration-700 hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-8 overflow-visible">
      
      {/* Visual Container */}
      <Link 
        to={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`} 
        className="relative aspect-[2/3] rounded-[1.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)] group-hover:shadow-[0_20px_60px_rgba(230,57,70,0.25)] transition-all duration-500 border border-white/10 group-hover:border-primary-red/30"
      >
        <img 
          src={movie.image} 
          alt={movie.title} 
          loading="lazy"
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Industry Badge (Top Left) */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 transition-transform duration-500 group-hover:scale-110">
          <span className="bg-primary-red/90 backdrop-blur-md text-white text-[8px] sm:text-[9px] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-xl border border-white/20 uppercase tracking-widest font-black">
            {movie.industry}
          </span>
        </div>

        {/* Dynamic Badge (Top Right) */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 transition-transform duration-500 group-hover:scale-110">
          {isUpcoming && !isReleased ? (
            <span className="bg-black/60 backdrop-blur-xl text-white text-[7px] sm:text-[8px] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10 uppercase tracking-[0.2em] shadow-2xl font-black">
              UPCOMING
            </span>
          ) : (
             <span className="bg-yellow-400/90 backdrop-blur-sm text-slate-900 text-[9px] sm:text-[10px] font-black px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg shadow-xl flex items-center gap-1.5 border border-white/30 transform rotate-3">
               <i className="fas fa-star text-[7px] sm:text-[8px]"></i> {movie.rating || 'N/A'}
             </span>
          )}
        </div>

         <div className="absolute bottom-0 inset-x-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out flex flex-col gap-2">
            <div className="flex gap-2">
               <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded border border-white/20 uppercase">
                 {movie.genre}
               </span>
            </div>
            <p className="text-white/80 text-[10px] font-medium italic line-clamp-2 leading-relaxed">
              {movie.overview}
            </p>
         </div>

         {/* Decorative Shine - Moved inside overflow-hidden container */}
         <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-45 pointer-events-none group-hover:animate-shine duration-1000 ease-in-out opacity-0 group-hover:opacity-100"></div>
      </Link>

      {/* Content Area */}
      <div className="pt-4 flex flex-col items-start px-1 overflow-visible">
        <h3 className="text-base font-black text-white uppercase mb-1.5 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-1 italic pr-2">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
             {movie.year || 'TBA'}
           </span>
           <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
           <span className="text-[10px] font-black text-yellow-400 uppercase tracking-tighter italic">
             {isReleased ? (
                // If past release date, show performance status, but default to 'Released' if it's still 'Upcoming'
                (movie.performance?.status && movie.performance.status !== 'Upcoming') ? movie.performance.status : 'Released'
             ) : (
                // If future release date, show date or estimated release
                (movie.isReleaseDateConfirmed && movie.releaseDate) ? (
                    new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                ) : (
                    movie.estimatedRelease || 'Upcoming'
                )
             )}
           </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
