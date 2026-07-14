import React from 'react';
import { Link } from 'react-router-dom';

const FilterBar = ({ options, activeFilter, onFilterChange, label = "Filter By", theme = "dark", linkGenerator }) => {
  const isLight = theme === 'light';
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const onWheel = (e) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY * 1.5, // 1.5 multiplier for smoother scroll
          behavior: 'auto'
        });
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 overflow-hidden">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-1.5 h-4 bg-primary-red"></div>
        <span className={`text-[10px] md:text-[9px] font-black uppercase tracking-[0.3em] italic ${isLight ? 'text-gray-400' : 'text-white'}`}>{label}</span>
      </div>
      
      <div ref={scrollRef} className="flex flex-nowrap overflow-x-auto gap-3 pb-2 md:pb-0 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
        {options.map((option) => {
          const content = (
            <span className="relative z-10">{option}</span>
          );
          
          const className = `px-5 md:px-6 py-2 md:py-2.5 rounded-[4px] font-black text-[10px] uppercase tracking-widest transition-all duration-300 border flex-shrink-0 mb-1 md:mb-0 no-underline ${
            activeFilter === option
              ? 'bg-primary-red border-primary-red text-white shadow-[0_10px_25px_rgba(211,47,47,0.3)] scale-105'
              : isLight
                ? 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white'
          }`;

          if (linkGenerator) {
            return (
              <Link key={option} to={linkGenerator(option)} className={className}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={option}
              onClick={() => onFilterChange(option)}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;
