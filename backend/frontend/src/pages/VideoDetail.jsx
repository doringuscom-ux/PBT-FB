import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import CommentSection from '../components/CommentSection';
import { API_BASE_URL } from '../api';

const VideoDetail = () => {
    const params = useParams();
    const id = params['*'];
    const { videos, news, addVideoComment, likeVideoComment, updateVideoComment, deleteVideoComment } = useData();
    const [video, setVideo] = useState(null);
    const baseUrl = API_BASE_URL;

    useEffect(() => {
        const found = videos.find(v => v._id === id || v.slug === id);
        if (found) setVideo(found);
        window.scrollTo(0, 0);
    }, [id, videos]);

    const getRecommendedVideos = () => {
        if (!video) return [];
        // Same type (youtube/upload) first
        const matched = videos.filter(v => v.videoType === video.videoType && v._id !== id);
        const others = videos.filter(v => v.videoType !== video.videoType && v._id !== id);
        return [...matched, ...others.sort(() => 0.5 - Math.random())].slice(0, 4);
    };

    const sidebarNews = [...news].sort(() => 0.5 - Math.random()).slice(0, 6);
    const recommendedVideos = getRecommendedVideos();

    if (!video) return <div className="min-h-screen bg-white flex items-center justify-center font-bold">Loading Video...</div>;

    const getYoutubeEmbedUrl = (url) => {
        let videoId = '';
        if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
        else if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    };

    const isYoutube = video.videoType === 'youtube' || video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');

    return (
        <div className="bg-white min-h-screen">
            <main className="page-container py-8 mt-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Main Content (Video & Details) */}
                    <div className="lg:w-[65%] xl:w-[65%] min-w-0">
                        <h1 className="text-3xl md:text-4xl font-black mb-6 text-slate-900 leading-[1.15] italic tracking-tight uppercase font-article-title">
                            '{video.title}'
                        </h1>

                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-100">
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

                        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-gray-100">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-red">Views</span>
                                    <span className="text-xl font-black text-slate-900">{video.views}</span>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-red">Likes</span>
                                    <span className="text-xl font-black text-slate-900">{video.likes || 0}</span>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-red">Published</span>
                                    <span className="text-xl font-black text-slate-900 tracking-tighter">{video.publishedAt || 'March 2026'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a 
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                                    target="_blank" rel="noopener noreferrer"
                                    className="bg-[#1877F2] text-white px-5 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:opacity-90 no-underline"
                                >
                                    <i className="fab fa-facebook-f"></i> Share
                                </a>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="border-2 border-gray-200 text-slate-700 px-5 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-gray-50"
                                >
                                    <i className="fas fa-link"></i> Copy Link
                                </button>
                            </div>
                        </div>

                        {/* Video Description Section */}
                        <div className="mt-8 max-w-none text-slate-700 font-article-text bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-red mb-4">Description</h4>
                            {video.description ? (
                                <div 
                                    className="rich-text-content"
                                    dangerouslySetInnerHTML={{ __html: video.description }} 
                                />
                            ) : (
                                <p>Exclusive {video.title} coverage only on our Cinematic Hub. Stay updated with the latest in entertainment world.</p>
                            )}
                        </div>

                        {/* Comment Section */}
                        <CommentSection 
                            itemId={video._id}
                            comments={video.comments}
                            onAdd={addVideoComment}
                            onLike={likeVideoComment}
                            onUpdate={updateVideoComment}
                            onDelete={deleteVideoComment}
                        />

                        {/* More Videos Section (Bottom) */}
                        <div className="mt-12">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-8 h-1 bg-primary-red"></span>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Recommended For You</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recommendedVideos.map(v => (
                                    <Link key={v._id} to={`/latest-viral-videos/${v.slug || v._id}`} className="group cursor-pointer no-underline">
                                        <div className="relative aspect-video rounded-xl overflow-hidden mb-2 shadow-md">
                                            <img src={v.image.startsWith('/uploads/') ? `${baseUrl}${v.image}` : v.image} alt={v.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <i className="fas fa-play text-white text-xl"></i>
                                            </div>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-primary-red transition-colors">{v.title}</h4>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Related News) */}
                    <aside className="lg:w-[35%] xl:w-[35%] relative">
                        <div className="sticky top-[140px] h-[calc(100vh-160px)] flex flex-col">
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-full overflow-hidden">
                                <h3 className="text-sm font-black text-primary-red uppercase tracking-widest mb-8 flex items-center gap-2 italic shrink-0">
                                    <span className="w-2.5 h-2.5 bg-primary-red rounded-full animate-pulse"></span> Latest Global News
                                </h3>
                                
                                <div className="space-y-8 overflow-y-auto flex-1 pr-2 no-scrollbar">
                                    {sidebarNews.slice(0, 10).map((item) => (
                                        <Link key={item._id} to={`/latest-news/${item.slug || item._id}`} className="flex gap-4 group cursor-pointer no-underline items-center">
                                            <div className="w-24 h-24 lg:w-28 lg:h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-md relative">
                                                <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="text-xs lg:text-[13px] font-black text-slate-900 leading-[1.3] line-clamp-3 group-hover:text-primary-red transition-colors uppercase tracking-tight italic">
                                                    {item.title}
                                                </h4>
                                                <div className="mt-2 text-[9px] text-gray-400 font-black uppercase tracking-widest italic flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-primary-red rounded-full"></span> Updated Just Now
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
};

export default VideoDetail;
