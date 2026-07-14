import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const AnnouncementBar = () => {
  const { announcements } = useData();
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;
    if (currentIndex >= announcements.length) setCurrentIndex(0);
    
    if (isHovered) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements, isHovered, currentIndex]);

  if (announcements.length === 0) return (
    <div className="w-full h-12 lg:h-16 bg-slate-900 border-y border-slate-700/50 skeleton">
        <div className="w-full max-w-[1800px] mx-auto flex items-center h-full px-12">
            <div className="w-48 h-4 bg-white/5 rounded-full animate-pulse"></div>
        </div>
    </div>
  );

  return (
    <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full bg-gradient-to-r from-slate-900 via-[#1a1f2e] to-slate-900 border-y border-slate-700/50 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] group cursor-pointer relative z-20"
    >
        <div className="w-full max-w-[1800px] mx-auto flex items-center h-12 lg:h-16 relative">
            {/* Glowing effect behind breaking badge */}
            <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-[#e61e25]/25 blur-2xl pointer-events-none"></div>
 
            {/* Breaking Tag */}
            <div className="bg-gradient-to-r from-black to-slate-900 shadow-[20px_0_40px_rgba(0,0,0,0.5)] text-white px-3 md:px-6 h-full flex items-center gap-2 md:gap-3 shrink-0 z-30 relative">
                <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]"></span>
                <span className="font-black text-[10px] md:text-[14px] uppercase tracking-[0.1em] md:tracking-[0.15em] italic text-yellow-400">Announcement</span>
                {/* Slanted edge effect */}
                <div className="absolute top-0 -right-4 h-full w-8 bg-slate-900 -skew-x-[20deg] border-r border-white/5 z-0"></div>
            </div>

            {/* News Content */}
            <div className="flex-1 overflow-hidden relative flex items-center h-full ml-2">
                <div 
                    className="flex items-center whitespace-nowrap animate-marquee-infinite"
                    style={{ animationDuration: `${Math.max(10, announcements.length * 6)}s` }}
                >
                    {/* First set of announcements */}
                    {announcements.map((ann, idx) => (
                        <div key={`orig-${idx}`} className="flex items-center">
                            {ann.link ? (
                                <Link 
                                    to={ann.link}
                                    className="text-white font-black text-[12px] md:text-[16px] italic hover:text-yellow-400 transition-all no-underline px-4 md:px-8"
                                >
                                    {ann.text}
                                </Link>
                            ) : (
                                <div className="text-white font-black text-[12px] md:text-[16px] italic px-4 md:px-8">
                                    {ann.text}
                                </div>
                            )}
                            <div className="w-1 h-1 rounded-full bg-yellow-400 mx-1 shadow-[0_0_5px_rgba(250,204,21,0.6)]"></div>
                        </div>
                    ))}
                    
                    {/* Duplicate set for seamless loop */}
                    {[...announcements].map((ann, idx) => (
                        <div key={`dup-${idx}`} className="flex items-center">
                            {ann.link ? (
                                <Link 
                                    to={ann.link}
                                    className="text-white font-black text-[12px] md:text-[16px] italic hover:text-yellow-400 transition-all no-underline px-4 md:px-8"
                                >
                                    {ann.text}
                                </Link>
                            ) : (
                                <div className="text-white font-black text-[12px] md:text-[16px] italic px-4 md:px-8">
                                    {ann.text}
                                </div>
                            )}
                            <div className="w-1 h-1 rounded-full bg-yellow-400 mx-1 shadow-[0_0_5px_rgba(250,204,21,0.6)]"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Date Tag - Reduced/Hidden on small mobile */}
            <div className="hidden md:flex items-center px-4 h-full relative z-20 shrink-0">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-lg px-4 py-1.5 transition-all">
                    <i className="far fa-clock text-yellow-400 text-[10px]"></i>
                    <div className="flex items-center gap-2 uppercase text-[10px] font-black tracking-widest">
                        <span className="text-white opacity-80">
                            {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-yellow-400">
                            {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AnnouncementBar;
