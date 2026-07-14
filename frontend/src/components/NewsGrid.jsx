"use client";
import Link from 'next/link';
;
import { useData } from '../context/DataContext';

const NewsGrid = () => {
  const { news } = useData();
  if (news.length === 0) return (
    <div className="mb-16 px-4 lg:px-20 xl:px-32 2xl:px-48">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1,2,3].map(i => (
          <div key={i} className="h-[300px] rounded-3xl skeleton opacity-20"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mb-16 px-4 lg:px-20 xl:px-32 2xl:px-48">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-900 tracking-tight text-xl md:text-2xl lg:text-3xl uppercase">Latest News</h3>
        </div>
        <Link href="/latest-news" className="text-[10px] md:text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider flex items-center gap-1">
            VIEW ALL <i className="fas fa-chevron-right text-[8px]"></i>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.slice(12, 18).map((item, index) => (
          <Link href={`/latest-news/${item.slug || item._id}`} key={item._id} className="group cursor-pointer no-underline text-inherit block">
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
