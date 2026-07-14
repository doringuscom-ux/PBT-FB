import React, { useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const SearchPage = () => {
  const { news, movies, celebs, videos } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q')?.toLowerCase() || '';

  const results = useMemo(() => {
    if (!query) return { news: [], movies: [], celebs: [], videos: [] };

    return {
      news: news.filter(item => 
        item.title?.toLowerCase().includes(query) || 
        item.excerpt?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      ),
      movies: movies.filter(item => 
        item.title?.toLowerCase().includes(query) || 
        item.genre?.toLowerCase().includes(query) ||
        item.industry?.toLowerCase().includes(query)
      ),
      celebs: celebs.filter(item => 
        item.name?.toLowerCase().includes(query) || 
        item.role?.toLowerCase().includes(query)
      ),
      videos: videos.filter(item => 
        item.title?.toLowerCase().includes(query) || 
        item.category?.toLowerCase().includes(query)
      )
    };
  }, [query, news, movies, celebs, videos]);

  const hasResults = results.news.length > 0 || results.movies.length > 0 || results.celebs.length > 0 || results.videos.length > 0;

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Trending Fallback Data
  const trendingMovies = useMemo(() => [...movies].sort(() => 0.5 - Math.random()).slice(0, 6), [movies]);
  const trendingCelebs = useMemo(() => [...celebs].sort((a, b) => ((b.followers?.length || 0) + (b.bonusFollowers || 0)) - ((a.followers?.length || 0) + (a.bonusFollowers || 0))).slice(0, 6), [celebs]);
  const latestNews = useMemo(() => [...news].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4), [news]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Cinematic Header Block - Only show when there is an active search query */}
      {query ? (
          <div className="bg-slate-900 pt-16 pb-16 relative overflow-hidden shadow-2xl shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-red/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="page-container relative z-20 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg mb-6 leading-tight">
                    Search Results for <br/><span className="text-primary-red">"{query}"</span>
                </h1>
                
                <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-6 bg-slate-800/50 py-2 px-6 rounded-full border border-slate-700/50 backdrop-blur-sm">
                    {hasResults ? 'Matches Found Below' : 'No exact matches found'}
                </p>
            </div>
          </div>
      ) : (
        <h1 className="sr-only">Search Pbtadka - Find Movies, News, & Celebrities</h1>
      )}

      <main className="page-container py-12 flex-1">
        {query && !hasResults && (
            <div className="mb-16 bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                    <i className="fas fa-ghost text-4xl text-slate-300"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase mb-2">Nothing found for "{query}"</h2>
                <p className="text-slate-500 font-medium text-sm">But don't worry, there is plenty of other amazing content to explore.</p>
            </div>
        )}

        <div className="space-y-16">
            
            {/* -------------------- DYNAMIC SEARCH RESULTS -------------------- */}

            {results.movies.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                    <span className="w-2 h-8 bg-primary-red rounded-sm"></span> Matching Movies
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {results.movies.map(movie => {
                    const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
                    return (
                    <Link key={movie._id} to={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`} className="group flex flex-col no-underline text-inherit">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg border-2 border-white group-hover:border-primary-red transition-all duration-300">
                        <img src={movie.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                          <span className="text-[10px] font-black text-yellow-400 flex items-center gap-1 drop-shadow-md">
                            <i className="fas fa-star"></i> {movie.averageRating ? movie.averageRating.toFixed(1) : 'New'}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-black text-xs md:text-sm truncate group-hover:text-primary-red transition-colors italic tracking-tight">{movie.title}</h3>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{movie.industry}</span>
                    </Link>
                    );
                  })}
                </div>
              </section>
            )}

             {results.celebs.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                    <span className="w-2 h-8 bg-blue-500 rounded-sm"></span> Matching Celebrities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {results.celebs.map(celeb => (
                    <Link key={celeb._id} to={`/celebrities/${celeb.slug || celeb._id}`} className="group flex flex-col text-center no-underline text-inherit bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100">
                        <img src={celeb.image} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" alt="" />
                      </div>
                      <div className="p-4 border-t-2 border-transparent group-hover:border-blue-500 transition-colors">
                        <h3 className="font-black text-[13px] line-clamp-1 italic tracking-tight group-hover:text-blue-600 transition-colors">{celeb.name}</h3>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 block">{celeb.role}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.news.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                    <span className="w-2 h-8 bg-orange-500 rounded-sm"></span> Matching News
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.news.map(item => (
                    <Link key={item._id} to={`/latest-news/${item.slug || item._id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline text-inherit flex flex-col">
                      <div className="relative aspect-video overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        <div className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md">
                            {item.category}
                        </div>
                      </div>
                      <div className="px-5 py-4 flex-1 flex flex-col">
                        <h3 className="font-black text-[15px] leading-snug text-slate-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors italic tracking-tight">{item.title}</h3>
                        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <i className="far fa-calendar-alt"></i> {formatDate(item.createdAt || item.date)}
                            </span>
                            <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest group-hover:underline">Read More</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.videos.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                    <span className="w-2 h-8 bg-slate-900 rounded-sm"></span> Matching Videos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.videos.map(video => (
                    <Link key={video._id} to={`/latest-viral-videos/${video.slug || video._id}`} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline text-inherit">
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-inner bg-slate-100">
                        <img src={video.image} className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" alt="" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all">
                           <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                               <i className="fas fa-play ml-1"></i>
                           </div>
                        </div>
                      </div>
                      <h3 className="font-black text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors italic tracking-tight px-1">{video.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* -------------------- TRENDING FALLBACK SECTION -------------------- */}
            
            {(!query || !hasResults) && (
                <>
                    {(query && !hasResults) && (
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-16 opacity-50"></div>
                    )}
                    
                    <div className="text-center mb-12">
                        <span className="text-primary-red text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-3 inline-block">Explore</span>
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Trending Right Now</h2>
                    </div>

                    {/* Trending Movies */}
                    <section>
                        <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center justify-between border-b pb-3">
                            <span>Hot Movies</span>
                            <Link to="/latest-movies" className="text-[10px] text-primary-red hover:text-slate-900 transition-colors">VIEW ALL</Link>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {trendingMovies.map(movie => {
                            const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
                            return (
                                <Link key={movie._id} to={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`} className="group flex flex-col no-underline text-inherit">
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-md border-2 border-white group-hover:border-slate-900 transition-all duration-300">
                                        <img src={movie.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                    </div>
                                    <h4 className="font-bold text-[11px] truncate group-hover:text-primary-red transition-colors uppercase tracking-tight">{movie.title}</h4>
                                </Link>
                            );
                        })}
                        </div>
                    </section>

                    {/* Trending Celebs */}
                    <section>
                        <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center justify-between border-b pb-3">
                            <span>Top Celebrities</span>
                            <Link to="/celebrities" className="text-[10px] text-primary-red hover:text-slate-900 transition-colors">VIEW ALL</Link>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {trendingCelebs.map(celeb => (
                            <Link key={celeb._id} to={`/celebrities/${celeb.slug || celeb._id}`} className="group flex flex-col text-center no-underline text-inherit bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300">
                            <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100">
                                <img src={celeb.image} className="absolute inset-0 w-full h-full object-cover object-[center_top] group-hover:scale-110 transition-transform duration-700" alt="" />
                            </div>
                            <div className="p-3 border-t-2 border-transparent group-hover:border-slate-900 transition-colors">
                                <h4 className="font-black text-[12px] line-clamp-1 italic tracking-tight">{celeb.name}</h4>
                            </div>
                            </Link>
                        ))}
                        </div>
                    </section>
                </>
            )}

        </div>
      </main>
    </div>
  );
};

export default SearchPage;
