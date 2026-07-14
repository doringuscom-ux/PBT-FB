import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FilterBar from '../components/FilterBar';

const NewsList = () => {
  const { news } = useData();
  const [filter, setFilter] = useState('ALL');
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Just Now';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const categories = ['ALL', ...new Set(news.filter(item => item.category).map(item => item.category.trim().toUpperCase()))];
  const filteredNews = filter === 'ALL' ? news : news.filter(item => item.category?.trim().toUpperCase() === filter);

  return (
    <div className="bg-gray-50 py-12">
        <div className="page-container">
          <div className="mb-12">
            <h1 className="text-5xl font-black text-text-dark mb-4">Latest Updates</h1>
            <p className="text-text-gray text-lg mb-10">Fresh news from the heart of the film industry.</p>
            
            <FilterBar 
              options={categories} 
              activeFilter={filter} 
              onFilterChange={setFilter} 
              label="Category" 
              theme="light"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNews.map((article, index) => (
              <React.Fragment key={article._id}>
                <Link to={`/latest-news/${article.slug || article._id}`} className="group flex flex-col bg-white rounded-[16px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 h-full">
                  <article className="h-full flex flex-col">
                    <div className="relative h-[200px] overflow-hidden">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-3 left-3 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl border border-white/10">
                        {article.category}
                      </div>
                    </div>
                    <div className="px-5 py-4 flex-1 flex flex-col">
                      <div className="text-text-gray text-[8px] font-black mb-1 flex items-center gap-2 uppercase tracking-widest opacity-60">
                        <i className="far fa-clock text-primary-red"></i> {formatDate(article.createdAt || article.date)}
                      </div>
                      <h2 className="text-[16px] font-black text-text-dark mb-1 group-hover:text-primary-red transition-colors leading-[1.2] uppercase tracking-wide italic line-clamp-1">
                        {article.title}
                      </h2>
                      <p className="text-slate-600 text-[11px] leading-relaxed mb-4 line-clamp-2 font-medium">
                        {article.excerpt}
                      </p>
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-primary-red font-black text-[9px] uppercase tracking-wide flex items-center gap-2 group-hover:gap-3 transition-all underline decoration-red-500/30 underline-offset-4">
                          VIEW STORY <i className="fas fa-arrow-right"></i>
                        </span>
                        <i className="fas fa-share-alt text-gray-300 hover:text-primary-red cursor-pointer"></i>
                      </div>
                    </div>
                  </article>
                </Link>
                {index === 3 && (
                  <div className="col-span-full my-4">
                    <InlineFluidAd />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
    </div>
  );
};

const InlineFluidAd = () => {
  useEffect(() => {
    
  }, []);
  return (
    <div className="w-full text-center overflow-hidden flex justify-center">
      
    </div>
  );
};

export default NewsList;
