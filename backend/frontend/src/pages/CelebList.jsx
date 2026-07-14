import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FilterBar from '../components/FilterBar';

const CelebList = () => {
  const { celebs } = useData();
  const params = useParams();
  const param = params.param || params['*'];
  const [filter, setFilter] = useState(param || 'ALL');
  const [visibleCount, setVisibleCount] = useState(10);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (param) {
      setFilter(param);
    } else {
      setFilter('ALL');
    }
    // Reset count when filter changes
    setVisibleCount(10);
  }, [param]);

  const industries = ['ALL', ...new Set(celebs.map(c => c.industry).filter(Boolean))];
  
  // Find the original industry name from the slugified param
  const activeIndustry = industries.find(ind => 
    ind.toLowerCase().trim().replace(/\s+/g, '-') === param?.toLowerCase()
  ) || 'ALL';

  const filteredCelebs = activeIndustry === 'ALL' ? celebs : celebs.filter(c => c.industry === activeIndustry);
  const displayedCelebs = filteredCelebs.slice(0, visibleCount);

  return (
    <div className="bg-[#050505] min-h-screen">
        {/* Dynamic Hero Section */}
        <div className="relative h-auto py-3 md:py-5 flex items-center justify-center overflow-hidden">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                    alt="Cinema Stars" 
                    className="w-full h-full object-cover blur-sm brightness-[0.2] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]"></div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-5xl animate-slide-up">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-[5px] tracking-tighter leading-none uppercase drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 md:gap-8">
                    <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-r from-transparent to-yellow-500"></div>
                    <span>GLOBAL <span className="text-yellow-400 text-shadow-premium">STARS</span></span>
                    <div className="hidden sm:block w-12 md:w-20 h-[2px] bg-gradient-to-l from-transparent to-yellow-500"></div>
                </h1>
                
                <div className="relative inline-block w-full max-w-2xl">
                    <p className="text-white/90 text-xs md:text-sm font-bold mx-auto leading-relaxed italic tracking-[0.05em] px-4 md:px-8 py-3 border-y border-white/10 uppercase drop-shadow-md">
                        Discover the profiles, milestones, and cinematic journeys of your favorite stars
                    </p>
                </div>
            </div>
        </div>

        <div className="page-container -mt-4 relative z-20 pb-24">
            {/* Filter Controls - Removed glass-panel bg/rounded */}
            <div className="p-4 md:p-[18px] mb-4 border-b border-white/10">
                <FilterBar 
                    options={industries} 
                    activeFilter={activeIndustry} 
                    onFilterChange={setFilter} 
                    linkGenerator={(opt) => opt === 'ALL' ? '/celebrities' : `/celebrities/${opt.toLowerCase().trim().replace(/\s+/g, '-')}`}
                    label="Industry" 
                />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {displayedCelebs.map((celeb) => (
              <Link to={`/celebrities/${celeb.slug || celeb._id}`} key={celeb._id} className="group relative block rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 shadow-2xl shadow-black/50 hover:shadow-primary-red/20 transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[3/4] relative">
                  <img src={celeb.image} alt={celeb.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                  
                  {/* Content Container */}
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="bg-primary-red text-white text-[8px] md:text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider mb-2.5 inline-block shadow-lg border border-white/10">
                        {celeb.category || celeb.role}
                    </span>
                    <h3 className="text-lg md:text-2xl font-black text-white group-hover:text-primary-red transition-colors duration-300 drop-shadow-lg leading-tight">{celeb.name}</h3>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 right-4 z-10 transition-transform duration-500 group-hover:rotate-3 scale-90 md:scale-100">
                    <span className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest block">{celeb.industry}</span>
                  </div>
                </div>
              </Link>
            ))}

            {visibleCount < filteredCelebs.length && (
              <div className="col-span-full mt-12 text-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="px-10 py-4 bg-white/5 hover:bg-primary-red border border-white/10 rounded-full text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-primary-red/20 active:scale-95"
                >
                  View More Stars <i className="fas fa-chevron-down ml-2"></i>
                </button>
              </div>
            )}

            {filteredCelebs.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <i className="fas fa-star text-white/20 text-3xl"></i>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">No Celebrities Found</h3>
                    <p className="text-white/50 text-sm">No stars match the selected industry filter.</p>
                </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default CelebList;
