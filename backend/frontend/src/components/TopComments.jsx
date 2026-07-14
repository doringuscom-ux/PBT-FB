import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const TopComments = () => {
    const { 
        news, videos, movies, celebs, user,
        likeComment, likeMovieComment, likeCelebComment, likeVideoComment 
    } = useData();

    const handleLike = (comment) => {
        if (!user) {
            alert('Please login to like comments!');
            return;
        }

        const actualSourceId = comment.rawSourceId || comment.sourceId;

        switch(comment.sourceType) {
            case 'News': likeComment(actualSourceId, comment._id); break;
            case 'Movie': likeMovieComment(actualSourceId, comment._id); break;
            case 'Celebrity': likeCelebComment(actualSourceId, comment._id); break;
            case 'Video': likeVideoComment(actualSourceId, comment._id); break;
            default: console.error("Unknown source type for like");
        }
    };

    // Aggregate and compute top 3 comments with source metadata
    const topComments = useMemo(() => {
        const allComments = [];

        news.forEach(item => {
            if (item.comments) {
                item.comments.forEach(c => allComments.push({ 
                    ...c, 
                    _id: c._id || c.id, 
                    sourceTitle: item.title, 
                    sourceType: 'News', 
                    sourceId: item.slug || item._id,
                    rawSourceId: item._id,
                    sourceImage: item.image,
                    sourceGenre: item.category || 'News',
                    sourceRating: 5, // News doesn't have ratings, treat as top content
                    link: `/news/${item.slug || item._id}`
                }));
            }
        });

        videos.forEach(item => {
            if (item.comments) {
                item.comments.forEach(c => allComments.push({ 
                    ...c, 
                    _id: c._id || c.id, 
                    sourceTitle: item.title, 
                    sourceType: 'Video', 
                    sourceId: item.slug || item._id,
                    rawSourceId: item._id,
                    sourceImage: item.image,
                    sourceGenre: item.category || 'Trailer',
                    sourceRating: 10,
                    link: `/latest-viral-videos/${item.slug || item._id}`
                }));
            }
        });

        movies.forEach(item => {
            if (item.comments) {
                item.comments.forEach(c => allComments.push({ 
                    ...c, 
                    _id: c._id || c.id, 
                    sourceTitle: item.title, 
                    sourceType: 'Movie', 
                    sourceId: item.slug || item._id,
                    rawSourceId: item._id,
                    sourceImage: item.image,
                    sourceGenre: item.genre || 'Action',
                    sourceRating: item.rating || 5,
                    link: `/movie/${item.slug || item._id}`
                }));
            }
        });

        celebs.forEach(item => {
            if (item.comments) {
                item.comments.forEach(c => allComments.push({ 
                    ...c, 
                    _id: c._id || c.id, 
                    sourceTitle: item.name, 
                    sourceType: 'Celebrity', 
                    sourceId: item.slug || item._id,
                    rawSourceId: item._id,
                    sourceImage: item.image,
                    sourceGenre: item.category || 'Actor',
                    sourceRating: 10,
                    link: `/celebrities/${item.slug || item._id}`
                }));
            }
        });

        return allComments
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 3); // Showing 3 as per the image layout
    }, [news, videos, movies, celebs]);

    if (topComments.length === 0) return null;

    return (
        <section className="mb-16 mt-12 overflow-visible bg-black/95 p-8 rounded-[2rem] shadow-[0_0_100px_rgba(75,0,130,0.2)]">
            {/* Header Section */}
            <div className="flex flex-col gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5 h-10 items-center">
                        <div className="w-2.5 h-full bg-primary-red transform -skew-x-[20deg]"></div>
                        <div className="w-2.5 h-full bg-purple-600 transform -skew-x-[20deg]"></div>
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        TOP REVIEWS
                    </h2>
                </div>

                <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                        Recent Discussions
                    </h3>
                    <Link to="/latest-news" className="relative px-6 py-2 group no-underline">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-primary-red transform -skew-x-[20deg] rounded-sm group-hover:scale-105 transition-transform duration-300"></div>
                        <span className="relative z-10 text-white font-black text-xs uppercase tracking-widest px-2">View All</span>
                    </Link>
                </div>
            </div>

            {/* Content Section - Horizontal Scroll or Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {topComments.map((comment, index) => (
                    <Link 
                        key={comment._id || index} 
                        to={comment.link}
                        className="group flex bg-[#2d005f] rounded-xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-500 border border-white/5 hover:border-white/20"
                    >
                        {/* Left: Image (40%) */}
                        <div className="w-[35%] relative aspect-[3/4] overflow-hidden">
                            <img 
                                src={comment.sourceImage} 
                                alt={comment.sourceTitle} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#2d005f] opacity-40"></div>
                        </div>

                        {/* Right: Content (60%) */}
                        <div className="w-[65%] p-5 flex flex-col justify-start gap-2 relative">
                            {/* Decorative Quote Icon */}
                            <div className="absolute top-2 right-4 opacity-10">
                                <i className="fas fa-quote-right text-4xl text-white"></i>
                            </div>

                            <h4 className="text-lg font-black text-white leading-tight line-clamp-1 pr-4 uppercase italic">
                                {comment.sourceTitle}
                            </h4>

                            {/* Stars & Rating */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex gap-0.5 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={`fas fa-star text-[10px] ${i < Math.floor(comment.sourceRating) ? '' : 'text-slate-600'}`}></i>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black text-white/90">{comment.sourceRating}/10</span>
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-start gap-1">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">Genre:</span>
                                    <span className="text-[10px] font-bold text-white leading-none capitalize">{comment.sourceGenre}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">Synopsis:</span>
                                    <p className="text-[10px] font-medium text-white/90 leading-tight italic">
                                        {comment.content.split(' ').length > 8 
                                            ? comment.content.split(' ').slice(0, 8).join(' ') + '... ' 
                                            : comment.content
                                        }
                                        {comment.content.split(' ').length > 8 && (
                                            <span className="text-purple-400 font-black hover:text-white transition-colors ml-1 uppercase text-[8px] tracking-widest whitespace-nowrap">
                                                [ READ MORE ]
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* User Bottom Bar */}
                            <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-white/10 flex items-center justify-center text-[8px] font-black text-white">
                                        {(comment.user || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[9px] font-black text-white/60 lowercase tracking-tighter">
                                        @{comment.user}
                                    </span>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleLike(comment);
                                    }}
                                    className="flex items-center gap-1 group/like bg-white/5 hover:bg-white/10 px-2 py-1 rounded-full transition-all duration-300"
                                >
                                    <i className={`fas fa-heart text-[8px] transition-transform group-hover/like:scale-125 ${comment.isLiked ? 'text-primary-red' : 'text-white/40'}`}></i>
                                    <span className="text-[9px] font-black text-white/80">{comment.likes || 0}</span>
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Bottom Glow */}
            <div className="mt-8 flex justify-center opacity-50">
                 <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            </div>
        </section>
    );
};

export default TopComments;
