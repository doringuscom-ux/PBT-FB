import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const SportsList = () => {
  const { news, celebs } = useData();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Just Now';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const sportsNews = news.filter(item => item.category?.toUpperCase() === 'SPORTS');
  
  // Trending Sports Stars Logic (Last 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const trendingCelebrities = Array.from(new Set(
    news
      .filter(n => new Date(n.createdAt) >= threeDaysAgo && n.category?.toUpperCase() === 'SPORTS')
      .flatMap(n => n.relatedCelebrities || [])
      .filter(c => c && c.industry === 'Sports')
      .map(c => JSON.stringify(c))
  )).map(s => JSON.parse(s));

  // Fallback: Top 6 Following if no trending
  const topFollowingCelebrities = [...celebs]
    .filter(c => c.industry === 'Sports')
    .sort((a,b) => {
        const countA = (a.followers?.length || 0) + (a.bonusFollowers || 0);
        const countB = (b.followers?.length || 0) + (b.bonusFollowers || 0);
        return countB - countA;
    })
    .slice(0, 6);

  const sidebarCelebrities = trendingCelebrities.length > 0 ? trendingCelebrities : topFollowingCelebrities;
  const isTrending = trendingCelebrities.length > 0;

  return (
    <div className="bg-gray-50 py-12 min-h-screen">
        <div className="page-container">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-slate-900 pb-8">
            <div>
              <span className="bg-primary-red text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">Live Coverage</span>
              <h1 className="text-5xl md:text-7xl font-black text-text-dark tracking-tighter uppercase italic leading-[0.9]">
                SPORTS <span className="text-primary-red">NEWS</span>
              </h1>
            </div>
            <p className="text-text-gray font-bold max-w-sm md:text-right text-sm uppercase tracking-wide">
              The latest action from Punjab and beyond. Track your favorite teams and athletes.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3 xl:w-3/4">
              {sportsNews.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                  <i className="fas fa-trophy text-6xl text-gray-200 mb-6"></i>
                  <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-tighter">No Sports Updates Yet</h2>
                  <p className="text-gray-400 mt-2">Checking for the latest match results. Stay tuned!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sportsNews.map((article) => (
                    <Link to={`/latest-news/${article.slug || article._id}`} key={article._id} className="group flex flex-col bg-white rounded-[16px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                      <div className="relative h-[200px] overflow-hidden">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-3 left-3 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl border border-white/10 text-center flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-primary-red rounded-full animate-pulse"></span> {article.category}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="text-text-gray text-[8px] font-black mb-2 flex items-center gap-2 uppercase tracking-widest opacity-60">
                          <i className="far fa-clock text-primary-red"></i> {formatDate(article.createdAt || article.date)}
                        </div>
                        <h2 className="text-[16px] font-black text-text-dark mb-2 group-hover:text-primary-red transition-colors leading-[1.2] uppercase tracking-wide italic line-clamp-1">
                          {article.title}
                        </h2>
                        <p className="text-slate-600 text-[11px] leading-relaxed mb-4 line-clamp-2 font-medium">
                          {article.excerpt}
                        </p>
                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between font-black text-[8px] uppercase tracking-widest">
                            <span className="text-primary-red flex items-center gap-2 group-hover:gap-3 transition-all">
                                VIEW STORY <i className="fas fa-arrow-right"></i>
                            </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar: Trending Sports Stars */}
            <aside className="lg:w-1/3 xl:w-1/4">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 relative overflow-hidden shadow-xl">
                        {/* Decorative bolt icon in background */}
                        <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
                            <i className="fas fa-bolt text-7xl text-slate-900"></i>
                        </div>

                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 italic text-wrap shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span> 
                            {isTrending ? 'Trending Sports Stars' : 'Suggested For You'}
                        </h3>

                        {sidebarCelebrities.length > 0 ? (
                            <div className="grid grid-cols-2 gap-x-3 gap-y-4 overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-280px)] pr-2 no-scrollbar scroll-smooth">
                                {sidebarCelebrities.map((celeb) => (
                                    <Link key={celeb._id} to={`/celebrities/${celeb.slug || celeb._id}`} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <img 
                                            src={celeb.image} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            alt={celeb.name} 
                                        />
                                        
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
                                        
                                        {/* Content Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-2 text-center">
                                            <h4 className="text-[10px] sm:text-[11px] font-black text-white uppercase italic tracking-tighter line-clamp-1 group-hover:text-yellow-400 transition-colors">
                                                {celeb.name}
                                            </h4>
                                            <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                                {!isTrending && (
                                                    <span className="text-[7px] font-black text-yellow-400 bg-black/40 px-1 py-0.5 rounded italic whitespace-nowrap backdrop-blur-sm">
                                                        {( (celeb.followers?.length || 0) + (celeb.bonusFollowers || 0) ).toLocaleString()} Fans
                                                    </span>
                                                )}
                                                {isTrending && (
                                                    <span className="text-[7px] font-bold text-gray-300 uppercase tracking-tighter line-clamp-1">
                                                        {celeb.role || 'Athlete'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Trending Badge */}
                                        {isTrending && (
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-red rounded-full shadow-lg shadow-primary-red/50 animate-pulse"></div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 shrink-0">
                                <i className="fas fa-running text-gray-300 text-3xl mb-3"></i>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed px-4">
                                    Follow the news to see who's trending today
                                </p>
                            </div>
                        )}
                        
                        <p className="text-[8px] font-black text-gray-400 text-center uppercase tracking-[0.3em] pt-6 italic shrink-0 border-t border-gray-100 mt-4">
                            {isTrending ? 'Updates every 72 hours' : 'Ranked by Fan Followers'}
                        </p>
                    </div>
                </div>
            </aside>
          </div>
        </div>
    </div>
  );
};

export default SportsList;
