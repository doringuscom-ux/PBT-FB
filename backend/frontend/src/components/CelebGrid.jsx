import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const CelebGrid = ({ industry }) => {
  const { celebs } = useData();
  
  // Filter by industry if provided
  const baseCelebs = industry ? celebs.filter(c => c.industry === industry) : celebs;

  // Sort by total followers descending
  const sortedCelebs = [...baseCelebs].sort((a, b) => {
    const aFollowers = (a.followers?.length || 0) + (a.bonusFollowers || 0);
    const bFollowers = (b.followers?.length || 0) + (b.bonusFollowers || 0);
    return bFollowers - aFollowers;
  });

  const displayedCelebs = sortedCelebs.slice(0, 10);

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

  return (
    <div className="mb-12 overflow-hidden relative">

      <div className="mb-10">
        <div className="flex items-center justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Popular Stars</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              {industry ? industry : 'Trending'} <span className="text-red-600">Celebrities</span>
            </h2>
          </div>
          <Link 
            to={industry ? `/celebrities/${industry.toLowerCase().trim().replace(/\s+/g, '-')}` : "/celebrities"} 
            className="text-slate-900 font-black no-underline text-[10px] lg:text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-2 mb-2"
          >
            View More <i className="fas fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </div>
      
      <div className="celeb-marquee-container relative w-full overflow-hidden py-2">
        {/* Gradient Masks for smooth fading edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f8f9fa] to-transparent z-10 pointer-events-none hidden lg:block"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10 pointer-events-none hidden lg:block"></div>
        
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 px-2 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          {[...displayedCelebs, ...displayedCelebs].map((celeb, idx) => (
            <Link to={`/celebrities/${celeb.slug || celeb._id}`} key={`${celeb._id}-${idx}`} className="w-[200px] shrink-0 bg-white rounded-xl shadow-md text-center hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group no-underline text-inherit block overflow-hidden">
              <div className="relative w-full pt-[125%] overflow-hidden bg-slate-100">
                <img 
                  src={celeb.image} 
                  alt={celeb.name} 
                  loading="lazy"
                  className="absolute top-0 left-0 w-full h-full object-cover object-[center_top] transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-3 border-t-2 border-transparent group-hover:border-primary-red transition-colors">
                <div className="font-black text-[13px] mb-1 group-hover:text-primary-red transition-colors line-clamp-1 italic tracking-tight">{celeb.name}</div>
                <div className="flex justify-center">
                    <span className="bg-primary-red text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block shadow-sm border border-white/10">
                        {celeb.category || celeb.role}
                    </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CelebGrid;
