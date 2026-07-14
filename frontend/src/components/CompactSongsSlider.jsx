"use client";
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

export default function CompactSongsSlider() {
  const scrollRef = useRef(null);
  const audioRef = useRef(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    // Fetch latest Punjabi trending songs from Apple iTunes API
    const fetchSongs = async () => {
      try {
        // Fetch more songs to ensure we can sort and get the absolute newest ones
        const res = await fetch('https://itunes.apple.com/search?term=punjabi&entity=song&limit=50');
        const data = await res.json();
        if (data && data.results) {
          // Sort by release date descending (newest first)
          const sortedSongs = data.results.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
          // Take the top 15 newest
          setSongs(sortedSongs.slice(0, 15));
        }
      } catch (err) {
        console.error("Error fetching Apple Music data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSongs();

    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const togglePlay = (e, track) => {
    e.preventDefault();
    if (playingId === track.trackId) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = track.previewUrl;
      audioRef.current.play();
      setPlayingId(track.trackId);
    }
  };

  if (!loading && songs.length === 0) return null;

  return (
    <div className="w-[100vw] relative left-[50%] -translate-x-[50%] bg-gradient-to-r from-[#2c1035] via-[#1a0822] to-[#0a0011] py-10 my-8 border-y border-purple-500/20 shadow-[inset_0_0_80px_rgba(138,43,226,0.15)] overflow-hidden">
      {/* Hidden Audio Player for 30s previews */}
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="w-[96%] max-w-[1800px] mx-auto px-4 relative z-10">
        <div className="px-4 lg:px-20 xl:px-32 2xl:px-48">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <i className="fab fa-apple text-white text-lg"></i>
                </div>
                <h3 className="font-black text-white tracking-tight text-xl md:text-3xl uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  Top Chartbusters
                </h3>
            </div>
            <div className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                Powered by Apple Music
            </div>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-hidden">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="w-[calc(60%-16px)] sm:w-[calc(33.333%-12px)] lg:w-[calc(20%-16px)] aspect-square bg-white/5 rounded-2xl animate-pulse"></div>
                ))}
            </div>
          ) : (
            <div className="relative group/slider">
              {/* Left Button */}
              <button 
                onClick={(e) => { e.preventDefault(); scroll('left'); }}
                className="absolute left-0 top-[35%] -translate-y-1/2 -ml-3 lg:-ml-5 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-purple-600 hover:border-purple-400 hover:scale-110"
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {/* Scroll Area */}
              <div 
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 lg:gap-6 snap-x snap-mandatory hide-scrollbar pb-6 pt-2 px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`
                  div::-webkit-scrollbar { display: none; }
                `}</style>
                
                {songs.map((item) => {
                  const isPlaying = playingId === item.trackId;
                  // Get high-res artwork from Apple API
                  const highResImage = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '';
                  
                  return (
                    <div 
                      key={item.trackId} 
                      className="group flex flex-col snap-start shrink-0 w-[calc(60%-16px)] sm:w-[calc(33.333%-12px)] md:w-[calc(25%-14px)] lg:w-[calc(20%-16px)] xl:w-[calc(16.666%-18px)] transition-all duration-300 cursor-pointer"
                      onClick={(e) => togglePlay(e, item)}
                    >
                      {/* Square Album Art style container */}
                      <div className={`w-full aspect-square rounded-2xl relative shadow-lg transition-all duration-500 ${isPlaying ? 'shadow-[0_10px_40px_rgba(168,85,247,0.6)] -translate-y-2 border-2 border-purple-500' : 'group-hover:shadow-[0_10px_30px_rgba(168,85,247,0.3)] group-hover:-translate-y-2 border border-white/10'}`}>
                          
                          {/* Vinyl Record decorative effect sticking out on hover/play */}
                          <div className={`absolute top-2 right-2 w-[90%] h-[90%] rounded-full bg-[#111] border-[10px] border-[#222] z-0 transition-all duration-700 shadow-xl flex items-center justify-center ${isPlaying ? 'opacity-100 translate-x-8 animate-[spin_3s_linear_infinite]' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-6 group-hover:-rotate-90'}`}>
                              {/* Vinyl grooves */}
                              <div className="w-[80%] h-[80%] rounded-full border border-[#333]"></div>
                              <div className="absolute w-[60%] h-[60%] rounded-full border border-[#333]"></div>
                              <div className="absolute w-[30%] h-[30%] rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-inner border-2 border-black flex items-center justify-center">
                                  <div className="w-2 h-2 bg-black rounded-full"></div>
                              </div>
                          </div>

                          {/* Actual Cover Art */}
                          <div className="absolute inset-0 rounded-2xl overflow-hidden z-10 bg-black">
                              <img 
                                  src={highResImage} 
                                  alt={item.trackName}
                                  className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'group-hover:scale-110'}`}
                              />
                              {/* Dark overlay for text readability */}
                              <div className={`absolute inset-0 transition-colors ${isPlaying ? 'bg-black/40' : 'bg-black/10 group-hover:bg-black/40'}`}></div>
                              
                              {/* Center Play Button (Spotify style) */}
                              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.6)] ${isPlaying ? 'bg-pink-600 text-white scale-100 opacity-100' : 'bg-purple-600/90 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100'}`}>
                                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1'} text-lg`}></i>
                              </div>

                              {/* Playing Animation Bars */}
                              {isPlaying && (
                                <div className="absolute bottom-3 right-3 flex items-end gap-1 h-4">
                                  <div className="w-1 bg-white rounded animate-[bounce_0.8s_infinite] h-full"></div>
                                  <div className="w-1 bg-white rounded animate-[bounce_1.2s_infinite] h-2/3"></div>
                                  <div className="w-1 bg-white rounded animate-[bounce_0.9s_infinite] h-4/5"></div>
                                </div>
                              )}
                          </div>
                      </div>
                      
                      {/* Text Section (Below the album art) */}
                      <div className="pt-4 flex flex-col items-center text-center">
                          <h4 className={`font-bold text-[13px] md:text-[15px] leading-tight line-clamp-1 transition-colors px-1 ${isPlaying ? 'text-pink-400' : 'text-gray-100 group-hover:text-purple-400'}`}>
                              {item.trackName}
                          </h4>
                          <p className="text-gray-400 text-[11px] md:text-[12px] mt-1 font-medium truncate w-full px-2">
                              {item.artistName}
                          </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Button */}
              <button 
                onClick={(e) => { e.preventDefault(); scroll('right'); }}
                className="absolute right-0 top-[35%] -translate-y-1/2 -mr-3 lg:-mr-5 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-purple-600 hover:border-purple-400 hover:scale-110"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
