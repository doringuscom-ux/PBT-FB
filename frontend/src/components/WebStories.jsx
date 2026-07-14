"use client";
import React from 'react';
import Link from 'next/link';
import { useData } from '../context/DataContext';

export default function WebStories() {
    const { movies, news } = useData();

    // Combine top movies and news to create interesting "Stories"
    // In a real app, this would come from a specific /stories API
    const movieStories = movies ? movies.slice(0, 5).map(m => ({ ...m, type: 'movies', img: m.poster || m.image })) : [];
    const newsStories = news ? news.slice(0, 5).map(n => ({ ...n, type: 'latest-news', img: n.image })) : [];
    
    const stories = [...movieStories, ...newsStories].sort(() => Math.random() - 0.5); // Shuffle for variety

    if (!stories.length) return null;

    return (
        <div className="w-full mb-8 pt-2">
            <div className="flex items-center gap-2 mb-4 px-2">
                <i className="fas fa-bolt text-yellow-500"></i>
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Trending Now</h2>
            </div>
            
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 px-2 no-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                
                {stories.map((story, idx) => (
                    <Link 
                        key={`${story._id}-${idx}`} 
                        href={`/${story.type}/${story.slug || story._id}`} 
                        className="flex flex-col items-center gap-2 shrink-0 group no-underline"
                    >
                        {/* Instagram-style Gradient Ring */}
                        <div className="p-[3px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-md group-hover:scale-105 transition-transform duration-300">
                            {/* Inner White Border and Image */}
                            <div className="w-[60px] h-[60px] md:w-[76px] md:h-[76px] rounded-full border-[2px] border-white overflow-hidden bg-slate-100">
                                <img 
                                    src={story.img} 
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {/* Text Below Circle */}
                        <span className="text-[10px] md:text-xs font-bold text-slate-800 w-[64px] md:w-[80px] text-center truncate px-1">
                            {story.title}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
