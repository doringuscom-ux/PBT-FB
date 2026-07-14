import React from 'react';
import { API_BASE_URL } from '../api';

const VideoPlayer = ({ video, onClose }) => {
    if (!video) return null;

    const getYoutubeEmbedUrl = (url) => {
        let videoId = '';
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    };

    const isYoutube = video.videoType === 'youtube' || video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');
    const baseUrl = API_BASE_URL;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10">
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white text-3xl hover:text-red-500 transition-colors z-[110]"
            >
                <i className="fas fa-times"></i>
            </button>

            <div className="relative w-full max-w-[1280px] aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(211,47,47,0.3)] border border-white/5">
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
                        src={video.videoUrl.startsWith('http') ? video.videoUrl : `${baseUrl}${video.videoUrl}`}
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>

            {/* Video Info Overlay (Bottom) */}
            <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center text-center">
                <h2 className="text-white text-2xl md:text-3xl font-black italic tracking-tighter mb-2">{video.title}</h2>
                <div className="flex items-center gap-4 text-white/50 text-sm font-bold uppercase tracking-widest">
                    <span>{video.views} Views</span>
                    <span>•</span>
                    <span>{video.time}</span>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
