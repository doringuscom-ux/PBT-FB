import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import VideoPlayer from './VideoPlayer';
import { API_BASE_URL } from '../api';

const HomeVideoMarquee = () => {
    const { videos } = useData();
    const [playingInlineId, setPlayingInlineId] = useState(null);
    const latestVideos = videos?.slice(0, 20) || [];
    const baseUrl = API_BASE_URL;

    const getYoutubeEmbedUrl = (url) => {
        let videoId = '';
        if (!url) return '';
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
    };

    const sliderRef = useRef(null);

    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider || latestVideos.length === 0 || playingInlineId) return;

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
    }, [latestVideos, playingInlineId]);

    if (latestVideos.length === 0) return (
        <div className="mb-12 w-full h-[300px] skeleton rounded-3xl opacity-50"></div>
    );

    return (
        <div className="mb-12 overflow-hidden relative">
            <div className="mb-10">
                <div className="flex items-center justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-600/50"></span>
                        <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Trailers & Clips</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                        Movie <span className="text-red-600">Trailers</span>
                    </h2>
                  </div>
                  <Link to="/latest-viral-videos" className="text-slate-900 font-black no-underline text-[10px] lg:text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-2 mb-2">
                    View All <i className="fas fa-arrow-right text-[10px]"></i>
                  </Link>
                </div>
            </div>

            <div className={`marquee-container relative w-full overflow-hidden ${playingInlineId ? 'marquee-paused' : ''}`}>
                {/* Gradient Masks for smooth fading edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f8f9fa] to-transparent z-10 pointer-events-none hidden md:block"></div>
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10 pointer-events-none hidden md:block"></div>
                
                <div 
                    ref={sliderRef}
                    className="flex overflow-x-auto gap-4 py-2 no-scrollbar scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                    {[...latestVideos, ...latestVideos].map((video, idx) => {
                        const isPlaying = playingInlineId === `${video._id}-${idx}`;
                        const isYoutube = video.videoType === 'youtube' || video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');

                        return (
                            <Link 
                                key={`${video._id}-${idx}`} 
                                to={isPlaying ? '#' : `/latest-viral-videos/${video.slug || video._id}`} 
                                onClick={(e) => isPlaying && e.preventDefault()}
                                className="w-[280px] shrink-0 group relative rounded-2xl overflow-hidden shadow-md block no-underline bg-black"
                            >
                                <div className="aspect-video w-full relative group">
                                    {isPlaying ? (
                                        <div className="w-full h-full bg-black relative">
                                            {isYoutube ? (
                                                <iframe 
                                                    className="w-full h-full"
                                                    src={getYoutubeEmbedUrl(video.videoUrl)}
                                                    title={video.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <video 
                                                    className="w-full h-full"
                                                    controls 
                                                    autoPlay
                                                    src={video.videoUrl?.startsWith('http') ? video.videoUrl : `${baseUrl}${video.videoUrl}`}
                                                >
                                                </video>
                                            )}
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setPlayingInlineId(null);
                                                }}
                                                className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-30"
                                            >
                                                <i className="fas fa-times text-[10px]"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <img 
                                                src={video.image?.startsWith('/uploads/') ? `${baseUrl}${video.image}` : video.image} 
                                                alt={video.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                                            />
                                            {/* Reference Image Style Play Button */}
                                            <div className="absolute bottom-4 right-4 z-20">
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setPlayingInlineId(`${video._id}-${idx}`);
                                                    }}
                                                    className="bg-black/90 backdrop-blur-md border border-white/10 flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg shadow-2xl transform transition-transform active:scale-95 group/play"
                                                >
                                                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                                                        <i className="fas fa-play text-white text-[8px] ml-0.5"></i>
                                                    </div>
                                                    <span className="text-white text-[11px] font-black uppercase tracking-widest italic pt-0.5">PLAY</span>
                                                </button>
                                            </div>
                                            <div className="absolute inset-0 bg-black/10 transition-colors pointer-events-none group-hover:bg-transparent"></div>
                                        </>
                                    )}
                                </div>
                                <div className="p-3 bg-white border-t-2 border-red-600/10 group-hover:border-red-600 transition-colors">
                                    <h4 className="text-[11px] font-black uppercase italic tracking-tight text-slate-800 line-clamp-1 leading-snug group-hover:text-red-600 transition-colors">
                                        {video.title}
                                    </h4>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mt-4 hidden md:block">
                Scroll horizontally — Click PLAY to watch inline or touch card for details
            </p>
        </div>
    );
};

export default HomeVideoMarquee;
