"use client";
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';

const CelebGrid = ({ industry, excludeTrending = false }) => {
  const { celebs, news } = useData();
  
  // Calculate trending score based on recent articles linked
  const trendingScores = {};
  if (news && news.length > 0) {
    news.forEach(article => {
      if (article.relatedCelebrities && Array.isArray(article.relatedCelebrities)) {
        article.relatedCelebrities.forEach(celebRef => {
          const celebId = typeof celebRef === 'object' ? celebRef._id : celebRef;
          if (celebId) {
            trendingScores[celebId] = (trendingScores[celebId] || 0) + 1;
          }
        });
      }
    });
  }

  // Find top 10 trending to exclude them if needed
  let excludeIds = [];
  if (excludeTrending) {
    const allSortedForTrending = [...celebs].sort((a, b) => {
      const aScore = trendingScores[a._id] || 0;
      const bScore = trendingScores[b._id] || 0;
      if (bScore !== aScore) return bScore - aScore;
      const aFollowers = (a.followers?.length || 0) + (a.bonusFollowers || 0);
      const bFollowers = (b.followers?.length || 0) + (b.bonusFollowers || 0);
      return bFollowers - aFollowers;
    });
    excludeIds = allSortedForTrending.slice(0, 10).map(c => c._id);
  }

  // Filter by industry if provided and exclude trending if required
  const baseCelebs = celebs.filter(c => {
    if (industry && c.industry !== industry) return false;
    if (excludeTrending && excludeIds.includes(c._id)) return false;
    return true;
  });

  // Sort by articles linked descending, then by followers
  const sortedCelebs = [...baseCelebs].sort((a, b) => {
    const aScore = trendingScores[a._id] || 0;
    const bScore = trendingScores[b._id] || 0;
    
    if (bScore !== aScore) {
      return bScore - aScore;
    }

    const aFollowers = (a.followers?.length || 0) + (a.bonusFollowers || 0);
    const bFollowers = (b.followers?.length || 0) + (b.bonusFollowers || 0);
    return bFollowers - aFollowers;
  });

  const displayedCelebs = sortedCelebs.slice(0, 8);

  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || displayedCelebs.length === 0) return;

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
  }, [displayedCelebs]);

  const formatFollowers = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  return (
    <div className="mb-12 overflow-hidden relative px-4 lg:px-20 xl:px-32 2xl:px-48">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-100">
          <div className="flex items-center gap-3">
              {!industry && (
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                    <i className="fas fa-arrow-trend-up text-red-500 text-sm"></i>
                </div>
              )}
              <h3 className="font-black tracking-tight text-xl md:text-2xl lg:text-3xl uppercase text-slate-900">
                {industry ? `${industry} Celebrities` : 'Trending Celebrities'}
              </h3>
          </div>
          <Link 
            href={industry ? `/celebrities/${industry.toLowerCase().trim().replace(/\s+/g, '-')}` : "/celebrities"} 
            className="text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors group"
          >
              VIEW ALL <i className="fas fa-chevron-right text-[8px] ml-1 group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>
        
        <div className="celeb-marquee-container relative w-full overflow-hidden py-4">
          {/* Gradient Masks for smooth fading edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none hidden lg:block bg-gradient-to-r from-white to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none hidden lg:block bg-gradient-to-l from-white to-transparent"></div>
          
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto gap-4 lg:gap-5 px-2 no-scrollbar pb-6 pt-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {[...displayedCelebs, ...displayedCelebs].map((celeb, idx) => {
              
              const getBaseFollowers = (id) => {
                  if (!id) return 25400;
                  const num = parseInt(id.toString().slice(-6), 16) || 0;
                  return (num % 90000) + 10000;
              };

              const originalFans = (celeb.followers?.length || 0) + (celeb.bonusFollowers || 0);
              const followersCount = getBaseFollowers(celeb._id) + originalFans;
              const formattedFollowers = formatFollowers(followersCount);
              
              // Default (Bollywood) styling
              let cardStyle = "w-[200px] shrink-0 bg-white rounded-xl shadow-md text-center hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group no-underline text-inherit block overflow-hidden";
              let imgContainerStyle = "relative w-full pt-[125%] overflow-hidden bg-slate-100";
              let infoStyle = "p-3 border-t-2 border-transparent group-hover:border-primary-red transition-colors";
              let badgeStyle = "bg-primary-red text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block shadow-sm border border-white/10";
              let nameStyle = "font-black text-[13px] mb-1 group-hover:text-primary-red transition-colors line-clamp-1 italic tracking-tight";
              let imgClass = "absolute top-0 left-0 w-full h-full object-cover object-[center_top] transition-transform duration-700 group-hover:scale-110";

              if (!industry) {
                // Trending Celebrities - Premium Clean Image Card (Site match)
                cardStyle = "w-[130px] md:w-[145px] lg:w-[155px] shrink-0 bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_30px_rgba(225,29,72,0.12)] text-center hover:-translate-y-2 transition-all duration-500 group no-underline text-inherit block overflow-hidden border border-gray-100";
                imgContainerStyle = "relative w-full aspect-[4/5] overflow-hidden bg-slate-100";
                infoStyle = "p-3 bg-white";
                badgeStyle = "bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block border border-red-100";
                nameStyle = "font-black text-[13px] md:text-[14px] mb-1 text-slate-800 group-hover:text-red-600 transition-colors line-clamp-1 tracking-tight";
                imgClass = "absolute inset-0 w-full h-full object-cover object-[center_top] transition-transform duration-700 group-hover:scale-110";
              } else if (industry === 'Hollywood') {
                // Hollywood - Premium Square Style with Blue Accents
                cardStyle = "w-[220px] shrink-0 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm text-center hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group no-underline text-inherit block overflow-hidden";
                imgContainerStyle = "relative w-full pt-[100%] overflow-hidden bg-slate-200";
                infoStyle = "p-4 border-b-[3px] border-transparent group-hover:border-blue-600 transition-colors bg-white";
                badgeStyle = "bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block shadow-sm";
                nameStyle = "font-black text-[14px] mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight";
              }

              return (
                <Link href={`/celebrities/${celeb.slug || celeb._id}`} key={`${celeb._id}-${idx}`} className={cardStyle}>
                  <div className={imgContainerStyle}>
                    <img 
                      src={celeb.image} 
                      alt={celeb.name} 
                      loading="lazy"
                      className={imgClass}
                    />
                    {!industry && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-black px-2 py-1 rounded-md shadow-sm border border-white/50 flex items-center gap-1">
                        <i className="fas fa-users text-red-500 text-[8px]"></i> {formattedFollowers}
                      </div>
                    )}
                  </div>
                  <div className={infoStyle}>
                    <div className={nameStyle}>{celeb.name}</div>
                    <div className="flex justify-center mt-1">
                        <span className={badgeStyle}>
                            {celeb.category || celeb.role}
                        </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebGrid;