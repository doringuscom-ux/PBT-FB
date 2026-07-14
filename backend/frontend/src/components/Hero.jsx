import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="mb-4 w-full transition-all">
      
      {/* Expanded Feature Slider (Full width of Hero container) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/10] lg:h-[500px] w-full group shadow-2xl">
        {sliderStories.map((story, index) => (
          <Link 
            key={story._id}
            to={`/latest-news/${story.slug || story._id}`} 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out no-underline block
              ${index === currentIndex ? 'opacity-100 visible z-10' : 'opacity-0 invisible z-0'}`}
          >
            <img 
              src={optimizeImage(story.image)} 
              alt={story.title}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              className={`w-full h-full object-cover opacity-60 transition-transform duration-[5s] ease-linear
                ${index === currentIndex ? 'scale-110' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
            
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 text-left">
                <div className={`flex items-center gap-3 mb-5 ${index === currentIndex ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
                    <span className="bg-primary-red text-white py-1 px-3 rounded-md text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-primary-red/20">
                        {story.category}
                    </span>
                    <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Global Top Story</span>
                </div>
                <h2 className={`text-lg md:text-2xl lg:text-3xl font-black text-white text-shadow-premium group-hover:text-accent-gold transition-colors duration-300 leading-[1.2] mb-4 italic tracking-tighter uppercase ${index === currentIndex ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
                    {story.title}
                </h2>
                <div className={`mt-8 flex items-center gap-4 ${index === currentIndex ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '800ms' }}>
                    <div className="flex items-center gap-3 bg-white/10 hover:bg-accent-gold group/btn px-6 py-3 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-lg hover:shadow-accent-gold/20 border border-white/10">
                        <i className="fas fa-play text-[10px] text-white group-hover/btn:text-slate-900"></i>
                        <span className="text-white group-hover/btn:text-slate-900 text-[11px] font-black uppercase tracking-widest">Read full story</span>
                    </div>
                </div>
            </div>
          </Link>
        ))}

        {/* Slider Indicators */}
        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
            {sliderStories.map((_, i) => (
                <button 
                    key={i}
                    onClick={(e) => {
                        e.preventDefault();
                        setCurrentIndex(i);
                    }}
                    className={`h-1.5 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-10 bg-primary-red' : 'w-2.5 bg-white/30 hover:bg-white/50'}`}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;

