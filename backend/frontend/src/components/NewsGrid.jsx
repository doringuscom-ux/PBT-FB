import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const NewsGrid = () => {
  const { news } = useData();
  if (news.length === 0) return (
    <div className="mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1,2,3].map(i => (
          <div key={i} className="h-[300px] rounded-3xl skeleton opacity-20"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mb-16">
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">World Pulse</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              Latest <span className="text-red-600">News</span>
            </h2>
          </div>
          <Link to="/latest-news" className="text-slate-900 font-black no-underline text-[10px] lg:text-[11px] uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-2 mb-2">
            View All <i className="fas fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.slice(0, 6).map((item, index) => (
          <Link to={`/latest-news/${item.slug || item._id}`} key={item._id} className="group cursor-pointer no-underline text-inherit block">
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 shadow-xl border border-slate-100 bg-slate-50">
              <img 
                src={item.image} 
                alt={item.title} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-primary-red py-1 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                {item.category}
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            <div className="flex gap-5">
                <span className="text-4xl font-black text-slate-400 group-hover:text-primary-red transition-colors italic leading-none shrink-0">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="p-4 rounded-3xl group-hover:bg-white transition-all">
                    <h3 className="text-xl font-black mb-3 leading-[1.2] text-slate-900 group-hover:text-primary-red transition-colors italic tracking-tighter uppercase line-clamp-1">
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{item.date}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-primary-red hover:underline underline-offset-4">Full Story <i className="fas fa-chevron-right text-[8px] ml-1"></i></span>
                    </div>
                </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;
