"use client";
import Link from 'next/link';
import { useData } from '../context/DataContext';

export default function SidebarVideos() {
    const { videos } = useData();

    if (!videos || videos.length === 0) return null;

    // Identify the top 5 trailers that are already showing in the Latest Trailers section
    const topTrailers = videos.filter(v => {
        const title = (v.title || '').toLowerCase();
        if (title.includes('song') || title.includes('music video') || title.includes('lyrical') || title.includes('audio') || title.includes('interview')) {
            return false;
        }
        return title.includes('trailer') || title.includes('teaser');
    }).slice(0, 5);

    const trailerIds = new Set(topTrailers.map(t => t._id));

    // Exclude the top 5 trailers, then take 7 for the sidebar
    const trendingVideos = videos.filter(v => !trailerIds.has(v._id)).slice(0, 7);

    if (!trendingVideos.length) return null;

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4 shrink-0">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <h3 className="text-[17px] font-extrabold text-slate-900 tracking-tight uppercase">Latest Videos</h3>
            </div>

            {/* List (Scrollable) */}
            <div className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                {trendingVideos.map((video) => (
                    <Link
                        key={video._id}
                        href={`/latest-viral-videos/${video.slug || video._id}`}
                        className="group relative flex items-center gap-4 no-underline py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        {/* Thumbnail */}
                        <div className="w-28 h-20 rounded-md overflow-hidden bg-slate-100 shrink-0 relative">
                            <img
                                src={video.thumbnail || video.image}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center group-hover:bg-red-600 transition-colors border border-white/20">
                                    <i className="fas fa-play text-white text-[10px] ml-0.5"></i>
                                </div>
                            </div>
                        </div>
                        {/* Title */}
                        <div className="flex flex-col">
                            <h4 className="text-[13px] md:text-[14px] font-bold text-slate-800 leading-snug line-clamp-3 group-hover:text-red-700 transition-colors">
                                {video.title}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>

            {/* View All Button */}
            <div className="mt-auto pt-4 border-t border-gray-100">
                <Link
                    href="/latest-viral-videos"
                    className="block w-full bg-[#d6182a] hover:bg-[#c21525] text-white text-center py-3 rounded-md text-[13px] font-bold uppercase transition-colors"
                >
                    View All Videos <i className="fas fa-angle-right ml-1 text-[13px]"></i>
                </Link>
            </div>
        </div>
    );
}
