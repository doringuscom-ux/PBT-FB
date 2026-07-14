"use client";
import Link from 'next/link';
import { useRef } from 'react';
import { useData } from '../context/DataContext';

export default function CompactNewsSlider() {
  const { news } = useData();
  const scrollRef = useRef(null);

  if (!news || news.length === 0) return null;

  // Take first 12 items for Trending Now
  const displayNews = news.slice(0, 12); 

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `Just now`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-[100vw] relative left-[50%] -translate-x-[50%] bg-[#0a0a0a] py-12 my-8 border-y border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
      <div className="w-[96%] max-w-[1800px] mx-auto px-4">
        <div className="px-4 lg:px-20 xl:px-32 2xl:px-48">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-6 md:h-8 bg-[#f84464] rounded-full shadow-[0_0_10px_rgba(248,68,100,0.8)]"></div>
                <h3 className="font-black text-white tracking-tight text-xl md:text-2xl lg:text-3xl uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                  Entertainment Buzz
                </h3>
            </div>
            <Link href="/latest-news" className="text-[10px] md:text-xs font-bold text-[#f84464] hover:text-red-400 uppercase tracking-wider flex items-center gap-1 drop-shadow-[0_0_8px_rgba(248,68,100,0.6)] transition-all">
                VIEW ALL <i className="fas fa-chevron-right text-[8px]"></i>
            </Link>
          </div>

          {/* Slider Container */}
          <div className="relative group/slider">
            {/* Left Button */}
            <button 
              onClick={(e) => { e.preventDefault(); scroll('left'); }}
              className="absolute left-0 top-[40%] -translate-y-1/2 -ml-3 lg:-ml-5 z-10 w-10 h-10 rounded-full bg-black border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-all hover:border-[#f84464] hover:text-[#f84464] hover:shadow-[0_0_15px_rgba(248,68,100,0.5)]"
            >
              <i className="fas fa-chevron-left text-sm"></i>
            </button>

            {/* Scroll Area */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-5 lg:gap-6 snap-x snap-mandatory hide-scrollbar pb-6 pt-2 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`
                div::-webkit-scrollbar { display: none; }
              `}</style>
              
              {displayNews.map((item) => {
                const timeStr = getTimeAgo(item.createdAt || item.date);
                return (
                  <Link 
                    key={item._id} 
                    href={`/latest-news/${item.slug || item._id}`} 
                    className="group no-underline flex flex-col snap-start shrink-0 w-[calc(80%-16px)] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-[#141414] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#f84464] hover:shadow-[0_0_25px_rgba(248,68,100,0.4)] relative"
                  >
                    {/* Glowing Accent Line at the top of the card on hover */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#f84464] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

                    <div className="w-full aspect-[16/9] bg-black relative overflow-hidden">
                        <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-2 z-10">
                            {item.isBreaking ? (
                              <div className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-[0_0_10px_rgba(220,38,38,0.8)] uppercase tracking-wider">
                                  BREAKING
                              </div>
                            ) : (
                              <div className="bg-black/80 border border-white/20 text-[#f84464] text-[10px] font-black px-2.5 py-1 rounded shadow-lg uppercase tracking-widest backdrop-blur-md">
                                  NEWS
                              </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Text Section */}
                    <div className="p-4 md:p-5 flex flex-col flex-1 bg-gradient-to-b from-[#141414] to-[#0a0a0a]">
                        <h4 className="font-bold text-gray-100 text-[14px] md:text-[16px] leading-snug line-clamp-2 transition-colors">
                            {item.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-auto pt-4 text-gray-400 text-[11px] md:text-[12px] font-medium">
                            <i className="far fa-clock text-[#f84464] opacity-80"></i>
                            <span>{timeStr}</span>
                        </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Right Button */}
            <button 
              onClick={(e) => { e.preventDefault(); scroll('right'); }}
              className="absolute right-0 top-[40%] -translate-y-1/2 -mr-3 lg:-mr-5 z-10 w-10 h-10 rounded-full bg-black border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-all hover:border-[#f84464] hover:text-[#f84464] hover:shadow-[0_0_15px_rgba(248,68,100,0.5)]"
            >
              <i className="fas fa-chevron-right text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
