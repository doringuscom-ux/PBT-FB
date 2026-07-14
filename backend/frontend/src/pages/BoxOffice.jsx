import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FilterBar from '../components/FilterBar';

const BoxOffice = () => {
    const { movies } = useData();
    const [filter, setFilter] = useState('ALL');

    // Only released movies
    const releasedMovies = useMemo(() => movies.filter(m => {
        if (!m.releaseDate) return false;
        return new Date(m.releaseDate) <= new Date();
    }), [movies]);

    const industries = ['ALL', ...new Set(releasedMovies.filter(m => m.industry).map(m => m.industry.trim().toUpperCase()))];

    const filteredMovies = useMemo(() => {
        let list = filter === 'ALL' ? releasedMovies : releasedMovies.filter(m => m.industry?.trim().toUpperCase() === filter);

        // Default Sort by Rating
        list = [...list].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

        return list;
    }, [releasedMovies, filter]);

    const topMovies = filteredMovies.slice(0, 5);
    const restMovies = filteredMovies.slice(5);

    const getRankColor = (rank) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-slate-300';
        if (rank === 3) return 'text-amber-600';
        if (rank === 4 || rank === 5) return 'text-white/60';
        return 'text-white/30';
    };

    const getRankBg = (rank) => {
        if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-amber-500';
        if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-400';
        if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700';
        if (rank === 4 || rank === 5) return 'bg-white/20';
        return 'bg-white/10';
    };

    const getPerformanceColor = (status) => {
        if (!status) return 'text-gray-400';
        const s = status.toLowerCase();
        if (s.includes('hit') || s.includes('blockbuster') || s.includes('super')) return 'text-green-400';
        if (s.includes('flop') || s.includes('disaster')) return 'text-red-400';
        if (s.includes('average')) return 'text-yellow-400';
        return 'text-blue-400';
    };

    return (
        <div className="bg-[#050505] min-h-screen w-full overflow-x-hidden">
            {/* Hero */}
            <div className="relative h-auto py-3 md:py-5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Box Office Background"
                        className="w-full h-full object-cover blur-sm brightness-[0.2] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-5xl animate-slide-up">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-[5px] tracking-tighter leading-none uppercase drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 md:gap-8">
                        <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-r from-transparent to-yellow-500"></div>
                        <span>BOX <span className="text-yellow-400 text-shadow-premium">OFFICE</span></span>
                        <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-l from-transparent to-yellow-500"></div>
                    </h1>
                    <div className="relative inline-block">
                        <p className="text-white/80 text-[10px] md:text-[12px] font-bold mx-auto leading-relaxed italic whitespace-nowrap tracking-[0.1em] px-8 py-2 border-y border-white/10 uppercase">
                            Top rated & highest performing movies ranked by community scores
                        </p>
                    </div>
                </div>
            </div>

            <div className="page-container -mt-4 relative z-20 pb-24">

                {/* Filter + Sort Bar */}
                <div className="p-4 md:p-[18px] mb-8 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-center">
                    <FilterBar
                        options={industries}
                        activeFilter={filter}
                        onFilterChange={setFilter}
                        label="Industry"
                    />
                </div>

                {/* Top 3 Podium */}
                {topMovies.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Top Performers</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                            {topMovies.map((movie, idx) => {
                                const rank = idx + 1;
                                return (
                                    <Link
                                        key={movie._id}
                                        to={`${(movie.releaseDate && new Date(movie.releaseDate) <= new Date()) ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`}
                                        state={{ scrollToTab: 'Box Office' }}
                                        className={`group relative rounded-xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 no-underline block ${rank === 1 ? 'border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : 'border-white/5'}`}
                                    >
                                        <div className="relative aspect-[2/3] overflow-hidden">
                                            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                                            {/* Rank Badge */}
                                            <div className={`absolute top-3 left-3 w-8 h-8 rounded-full ${getRankBg(rank)} flex items-center justify-center shadow-xl`}>
                                                <span className="text-xs font-black text-white">#{rank}</span>
                                            </div>

                                            {/* Rating Badge */}
                                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-yellow-400/30 flex items-center gap-1">
                                                <i className="fas fa-star text-yellow-400 text-[9px]"></i>
                                                <span className="text-white font-black text-[10px]">{(movie.averageRating || 0).toFixed(1)}</span>
                                            </div>

                                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/60 to-transparent">
                                    <p className="text-yellow-400 font-black text-[9px] uppercase tracking-widest mb-0.5">{movie.industry}</p>
                                    <h3 className="text-white font-black text-sm md:text-base leading-tight line-clamp-1 uppercase tracking-tight italic group-hover:text-yellow-400 transition-colors mb-1.5">
                                        {movie.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${getPerformanceColor(movie.performance?.status)}`}>
                                            <i className="fas fa-fire mr-1"></i>
                                            {(movie.performance?.status && movie.performance.status !== 'Upcoming') ? movie.performance.status : 'Released'}
                                        </span>
                                    </div>
                                </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Ranked List */}
                {restMovies.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Full Rankings</span>
                        </div>
                        <div className="space-y-2">
                            {restMovies.map((movie, idx) => {
                                const rank = idx + 6;
                                return (
                                    <Link
                                        key={movie._id}
                                        to={`${(movie.releaseDate && new Date(movie.releaseDate) <= new Date()) ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`}
                                        state={{ scrollToTab: 'Box Office' }}
                                        className="group flex items-center gap-4 bg-white/3 hover:bg-white/8 border border-white/5 hover:border-yellow-400/20 rounded-2xl px-4 py-3 transition-all duration-300 no-underline"
                                    >
                                        {/* Rank */}
                                        <span className={`text-2xl font-black italic w-8 shrink-0 text-right ${getRankColor(rank)}`}>
                                            {rank}
                                        </span>

                                        {/* Poster */}
                                        <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-yellow-400/30 transition-all">
                                            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-black text-sm uppercase tracking-tight italic line-clamp-1 group-hover:text-yellow-400 transition-colors">
                                                {movie.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{movie.industry}</span>
                                                <span className="text-white/20">•</span>
                                                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{movie.genre}</span>
                                            </div>
                                        </div>

                                        {/* Performance */}
                                        <span className={`hidden sm:block text-[9px] font-black uppercase tracking-widest shrink-0 ${getPerformanceColor(movie.performance?.status)}`}>
                                            {(movie.performance?.status && movie.performance.status !== 'Upcoming') ? movie.performance.status : 'Released'}
                                        </span>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1.5 shrink-0 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 group-hover:border-yellow-400/30 transition-all">
                                            <i className="fas fa-star text-yellow-400 text-[9px]"></i>
                                            <span className="text-white font-black text-[11px]">{(movie.averageRating || 0).toFixed(1)}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {filteredMovies.length === 0 && (
                    <div className="glass-panel py-32 rounded-[3rem] text-center border-2 border-dashed border-white/5">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20 text-4xl">
                            <i className="fas fa-trophy"></i>
                        </div>
                        <h2 className="text-2xl font-black text-white/40 italic uppercase tracking-widest mb-2">No Movies Found</h2>
                        <p className="text-white/30 text-sm font-medium">Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoxOffice;
