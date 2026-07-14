"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../api';

export default function CompactTrailersSlider() {
  const { videos } = useData();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);

  if (!videos || videos.length === 0) return null;

  // Filter only strict trailers or teasers
  const trailers = videos.filter(v => {
    const title = (v.title || '').toLowerCase();

    // Reject anything that looks like a song, music video, or interview
    if (title.includes('song') || title.includes('music video') || title.includes('lyrical') || title.includes('audio') || title.includes('interview')) {
      return false;
    }

    return title.includes('trailer') || title.includes('teaser');
  });

  if (trailers.length === 0) return null;

  // Take 5 items for the interactive gallery
  const displayVideos = trailers.slice(0, 5);
  const activeVideo = displayVideos[activeIndex] || displayVideos[0];
  
  const sideVideoList = displayVideos.map((video, index) => ({ video, index })).filter((item) => item.index !== activeIndex);
  const leftVideos = sideVideoList.slice(0, 2);
  const rightVideos = sideVideoList.slice(2, 4);

  const getYoutubeEmbedUrl = (url, autoplay) => {
      if (!url) return '';
      let videoId = '';
      if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('embed/')) {
          videoId = url.split('embed/')[1].split('?')[0];
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}`;
  };

  const isYoutube = activeVideo.videoType === 'youtube' || (activeVideo.videoUrl || '').includes('youtube.com') || (activeVideo.videoUrl || '').includes('youtu.be');

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
    setHasClicked(true);
  };

  const renderThumbnail = (video, originalIndex) => (
    <div
      key={video._id}
      onClick={() => handleThumbnailClick(originalIndex)}
      className="cursor-pointer group relative rounded-xl overflow-hidden border border-white/10 hover:border-white/40 transition-all bg-[#151825] flex flex-col hover:-translate-y-1 shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_25px_rgba(248,68,100,0.2)]"
    >
      <div className="aspect-video relative">
        <img src={video.thumbnail || video.image} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f84464] to-[#e62429] shadow-lg flex items-center justify-center text-white text-sm pl-0.5 transform scale-90 group-hover:scale-110 transition-transform">
               <i className="fas fa-play"></i>
            </div>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-white text-xs md:text-sm font-bold line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">{video.title}</h4>
      </div>
    </div>
  );

  return (
    <div className="w-[100vw] relative left-[50%] -translate-x-[50%] bg-gradient-to-b from-[#1e2336] to-[#0f121d] py-10 mt-6 mb-[18px] border-y border-white/5">
      <div className="w-[96%] max-w-[1800px] mx-auto px-4">
        <div className="px-4 lg:px-20 xl:px-32 2xl:px-48">
          {/* Premiere-style Banner Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#f84464] to-[#e62429] rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(248,68,100,0.5)] shrink-0 border border-white/20">
              <i className="fas fa-play ml-1 text-xl md:text-2xl"></i>
            </div>
            <div>
              <h2 className="text-white text-2xl md:text-3xl font-black tracking-widest uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Trailers</h2>
              <p className="text-white/70 text-xs md:text-sm mt-1 font-medium tracking-wide">Watch the newest trailers and teasers, right here</p>
            </div>
          </div>

        {/* Video Player Layout */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
           {/* Left Thumbnails */}
           <div className="hidden lg:flex flex-col justify-center gap-5 w-[23%]">
              {leftVideos.map((item) => renderThumbnail(item.video, item.index))}
           </div>

           {/* Main Player */}
           <div className="w-full lg:w-[54%] flex flex-col">
               <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] border-2 border-white/10 bg-black relative">
                  {isYoutube ? (
                      <iframe 
                          className="w-full h-full"
                          src={getYoutubeEmbedUrl(activeVideo.videoUrl, hasClicked)}
                          title={activeVideo.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                      ></iframe>
                  ) : (
                      <video 
                          className="w-full h-full"
                          controls 
                          autoPlay={hasClicked}
                          src={activeVideo.videoUrl?.startsWith('http') ? activeVideo.videoUrl : `${API_BASE_URL}${activeVideo.videoUrl}`}
                      >
                          Your browser does not support the video tag.
                      </video>
                  )}
               </div>
               <div className="mt-5 flex flex-col">
                   <h3 className="text-white text-lg md:text-2xl font-black line-clamp-2 leading-tight">{activeVideo.title}</h3>
                   <Link href={`/latest-viral-videos/${activeVideo.slug || activeVideo._id}`} className="text-red-400 text-sm mt-3 font-bold hover:text-red-300 w-max flex items-center gap-2">
                     Go to Video Details <i className="fas fa-arrow-right"></i>
                   </Link>
               </div>
           </div>

           {/* Right Thumbnails */}
           <div className="hidden lg:flex flex-col justify-center gap-5 w-[23%]">
              {rightVideos.map((item) => renderThumbnail(item.video, item.index))}
           </div>
        </div>

        {/* Mobile Thumbnails (Horizontal Scroll) */}
        <div className="flex lg:hidden overflow-x-auto gap-4 mt-8 hide-scrollbar pb-2">
            <style>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>
            {sideVideoList.map((item) => (
               <div key={item.video._id} className="min-w-[65%] sm:min-w-[45%] shrink-0">
                  {renderThumbnail(item.video, item.index)}
               </div>
            ))}
        </div>
        </div>
      </div>
    </div>
  );
}
