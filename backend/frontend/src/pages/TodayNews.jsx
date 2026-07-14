import React from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import ImageModal from '../components/ImageModal';

const TodayNews = () => {
  const { todayNews, news } = useData();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Just Now';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const todayDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Solution: If no news in last 3 days, show popular stories from the archive
  const fallbackNews = news.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="page-container py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary-red text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse">
                {todayNews.length > 0 ? 'Live Updates' : 'Our Archive'}
              </span>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{todayDate}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-text-dark tracking-tighter uppercase">
              {todayNews.length > 0 ? (
                <>Latest <span className="text-primary-red">Headlines</span></>
              ) : (
                <>Trending <span className="text-primary-red">Stories</span></>
              )}
            </h1>
          </div>
          <p className="text-gray-500 font-medium max-w-md md:text-right">
            {todayNews.length > 0 
              ? "Stay ahead with the most recent developments in the film industry, updated in real-time."
              : "No new headlines in the last 72 hours, but here's what everyone is talking about from our archive."}
          </p>
        </div>

        {(todayNews.length > 0 ? todayNews : fallbackNews).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(todayNews.length > 0 ? todayNews : fallbackNews).map((item) => (
              <Link 
                key={item._id} 
                to={`/latest-news/${item.slug || item._id}`}
                className="group flex flex-col bg-white rounded-[16px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 h-full relative"
              >
                {todayNews.length === 0 && (
                   <div className="absolute top-3 right-3 z-20 bg-slate-900/80 backdrop-blur-md text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/10">
                     Top Story
                   </div>
                )}
                <div className="relative h-[200px] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute top-3 left-3 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl border border-white/10">
                    {item.category}
                  </span>
                </div>
                <div className="px-5 py-4 flex flex-col flex-1">
                  <div className="text-text-gray text-[8px] font-black mb-1 flex items-center gap-2 uppercase tracking-widest opacity-60">
                    <i className="far fa-clock text-primary-red"></i> {formatDate(item.createdAt)}
                  </div>
                  <h3 className="text-[16px] font-black text-text-dark mb-1 group-hover:text-primary-red transition-colors line-clamp-1 leading-[1.2] uppercase tracking-wide italic">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-[11px] mb-4 line-clamp-2 leading-relaxed flex-1 font-medium">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-primary-red font-black text-[9px] uppercase tracking-wide group-hover:translate-x-2 transition-all underline decoration-red-500/30 underline-offset-4">
                      VIEW STORY <i className="fas fa-arrow-right"></i>
                    </span>
                    <i className="fas fa-share-alt text-gray-300 hover:text-primary-red cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Add share logic if needed */ }}></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 text-3xl">
              <i className="fas fa-newspaper"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">The News Desk is Quiet</h2>
            <p className="text-gray-400">We're verifying some big scoops. In the meantime, explore our other sections!</p>
            <div className="flex justify-center gap-4 mt-8">
               <Link to="/latest-movies" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-red transition-colors">Browse Movies</Link>
               <Link to="/celebrities" className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Meet Celebs</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TodayNews;
