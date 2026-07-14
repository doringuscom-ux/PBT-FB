import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import { useData } from '../context/DataContext';

const VideosList = () => {
    const { videos } = useData();
    const [filter, setFilter] = useState('ALL');

    const categories = ['ALL', ...new Set(videos.filter(v => v.industry).map(v => v.industry.trim().toUpperCase()))];
    const filteredVideos = filter === 'ALL' ? videos : videos.filter(v => v.industry?.trim().toUpperCase() === filter);

    return (
        <div className="bg-[#050505] min-h-screen w-full overflow-x-hidden">
            {/* Hero Section - same pattern as MovieList */}
            <div className="relative h-auto py-3 md:py-5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Video Background"
                        className="w-full h-full object-cover blur-sm brightness-[0.2] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-5xl animate-slide-up">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-[5px] tracking-tighter leading-none uppercase drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 md:gap-8">
                        <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-r from-transparent to-yellow-500"></div>
                        <span>CINEMA <span className="text-yellow-400 text-shadow-premium">VIDEOS</span></span>
                        <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-l from-transparent to-yellow-500"></div>
                    </h1>
                    <div className="relative inline-block w-full max-w-2xl">
                        <p className="text-white/90 text-xs md:text-sm font-bold mx-auto leading-relaxed italic tracking-[0.05em] px-4 md:px-8 py-3 border-y border-white/10 uppercase drop-shadow-md">
                            Watch exclusive trailers, teasers & first looks from the cinematic universe
                        </p>
                    </div>
                </div>
            </div>

            <div className="page-container -mt-4 relative z-20 pb-24">
                {/* Filter Bar */}
                <div className="p-4 md:p-[18px] mb-4 border-b border-white/10">
                    <FilterBar
                        options={categories}
                        activeFilter={filter}
                        onFilterChange={setFilter}
                        label="Industry"
                    />
                </div>

                {/* Video Grid */}
                {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-10">
                        {filteredVideos.map((video) => (
                            <Link
                                key={video._id}
                                to={`/latest-viral-videos/${video.slug || video._id}`}
                                className="group flex flex-col no-underline text-inherit transition-all duration-700 hover:-translate-y-3"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video rounded-[1.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.4)] group-hover:shadow-[0_20px_60px_rgba(250,204,21,0.2)] transition-all duration-500 border border-white/10 group-hover:border-yellow-500/30 mb-4">
                                    <img
                                        src={video.image}
                                        alt={video.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 shadow-2xl transform transition-all duration-500 group-hover:scale-125 group-hover:rotate-6">
                                            <i className="fas fa-play text-base ml-0.5"></i>
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3 z-10 transition-transform duration-500 group-hover:scale-110">
                                        <span className="bg-yellow-400/90 backdrop-blur-md text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-full shadow-xl border border-white/20 uppercase tracking-widest">
                                            {video.category}
                                        </span>
                                    </div>

                                    {/* Duration Badge */}
                                    {video.time && (
                                        <div className="absolute top-3 right-3 z-10 transition-transform duration-500 group-hover:scale-110">
                                            <span className="bg-black/60 backdrop-blur-xl text-white text-[8px] font-black px-2 py-1 rounded-full border border-white/10 uppercase tracking-[0.15em] shadow-2xl">
                                                {video.time}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="pt-1 flex flex-col items-start px-1 overflow-visible">
                                    <h3 className="text-sm font-black text-white uppercase mb-1.5 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-1 italic tracking-tight pr-2">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                                            {video.industry || 'Cinema'}
                                        </span>
                                        {video.views && (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-tighter italic">
                                                    <i className="fas fa-eye mr-1 text-[8px]"></i>{video.views} views
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel py-32 rounded-[3rem] text-center border-2 border-dashed border-white/5">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20 text-4xl">
                            <i className="fas fa-video"></i>
                        </div>
                        <h2 className="text-2xl font-black text-white/40 italic uppercase tracking-widest mb-2">No Videos Found</h2>
                        <p className="text-white/30 text-sm font-medium">Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideosList;
