"use client";
import Link from 'next/link';


import { useState, useEffect } from 'react';
;
import { useData } from '../context/DataContext';

const Hero = () => {
  const { news } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use top 5 stories for the slider, or fewer if less news available
  const sliderStories = news ? news.slice(0, 5) : [];

  useEffect(() => {
    if (sliderStories.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderStories.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [sliderStories.length]);

  // Helper function to optimize image URLs
  const optimizeImage = (url, width = 800) => {
    if (!url) return '';
    // If it's a Cloudinary URL, add optimization parameters
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_fill/`);
    }
    return url;
  };

  if (!news || news.length === 0) {
    return (
      <div className="mb-4 w-full">
        <div className="relative overflow-hidden rounded-3xl skeleton aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/10] lg:h-[500px] w-full shadow-2xl">
          <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 space-y-4">
            <div className="w-24 h-6 rounded bg-white/10 animate-pulse"></div>
            <div className="w-3/4 h-10 md:h-14 rounded bg-white/10 animate-pulse"></div>
            <div className="w-1/2 h-4 rounded bg-white/10 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full transition-all">
      
      {/* Expanded Feature Slider (Clean Card Design) */}
      <div className="relative overflow-hidden rounded-xl bg-white w-full group shadow-md border border-gray-100 flex flex-col">
        {sliderStories.map((story, index) => {
            let snippet = story.content ? story.content.replace(/<[^>]+>/g, '') : "Read the full story to know more about this latest update. We bring you the most accurate and up-to-date information directly from our reliable sources.";
            if (snippet.length > 150) snippet = snippet.substring(0, 150) + '...';

            return (
              <Link 
                key={story._id}
                href={`/latest-news/${story.slug || story._id}`} 
                className={`transition-opacity duration-1000 ease-in-out no-underline flex flex-col
                  ${index === currentIndex ? 'block' : 'hidden'}`}
              >
                {/* Top Image Area */}
                <div className="w-full relative overflow-hidden bg-slate-50 border-b border-gray-100" style={{ aspectRatio: '21/9' }}>
                    <img 
                    src={optimizeImage(story.image)} 
                    alt={story.title}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[8s] ease-linear hover:scale-105"
                    />
                    
                    {/* Minimal Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/90 backdrop-blur text-red-700 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50">
                            {story.category || 'Featured'}
                        </span>
                    </div>
                </div>
                
                {/* Bottom White Text Area */}
                <div className="px-5 py-4 md:px-8 md:py-5 bg-white text-left relative z-10">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-red-700 leading-[1.3] md:leading-[1.4] mb-3">
                        {story.title}
                    </h2>
                    
                    {/* Prominent Red Line Divider */}
                    <div className="w-12 h-1.5 bg-red-600 mb-4"></div>
                    
                    {/* Summary Snippet */}
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-3">
                        {snippet}
                    </p>
                </div>
              </Link>
            );
        })}

        {/* Minimal Slider Indicators */}
        <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-black/30 backdrop-blur-md px-2 py-1.5 rounded-full">
            {sliderStories.map((_, i) => (
                <button 
                    key={i}
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentIndex(i);
                    }}
                    className={`h-1.5 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;

