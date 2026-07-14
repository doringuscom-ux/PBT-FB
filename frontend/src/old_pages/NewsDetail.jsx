"use client";
import { useParams } from 'next/navigation';
import Link from 'next/link';


import React, { useEffect, useState } from 'react';
;
import { useData } from '../context/DataContext';
import CommentSection from '../components/CommentSection';
import ImageModal from '../components/ImageModal';
import AutoLinker from '@/components/AutoLinker';

const NewsDetail = () => {
    const params = useParams();
    const rawId = params?.id || params?.param || params?.['*']; const id = Array.isArray(rawId) ? rawId.join('/') : rawId;
    const { news, addComment, likeComment, reportComment, updateComment, deleteComment } = useData();
    const article = news.find(n => n._id === id || n.slug === id);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (article) {
            // Ads removed
        }
    }, [article]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Just Now';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getRelatedContent = () => {
        if (!article) return [];
        const related = news.filter(n => n.category === article.category && n._id !== id);
        const others = news.filter(n => n.category !== article.category && n._id !== id);
        return [...related, ...others].sort(() => 0.5 - Math.random()).slice(0, 6);
    };

    const relatedNews = getRelatedContent();

    if (!article) return <div className="p-10 text-center font-bold">Article not found</div>;

    const handleCommentSubmit = async (e) => {
        // Redundant - remove later if everything works
    };

    return (
        <div className="bg-white min-h-screen">
            <main className="page-container py-8 mt-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    <div className="lg:w-[65%] xl:w-[65%] min-w-0">
                        <nav className="mb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Link href="/" className="hover:text-primary-red">Home</Link> 
                            <span className="mx-2">/</span>
                            <Link href="/latest-news" className="hover:text-primary-red">News</Link> 
                            <span className="mx-2">/</span>
                            <span className="text-slate-900">{article.category}</span>
                        </nav>
                        
                        <h1 className="text-2xl md:text-4xl font-headline font-black mb-6 leading-tight text-slate-950 tracking-tight">
                            {article.title}
                        </h1>
                        
                        <div className="flex items-center gap-6 mb-8 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2"><i className="far fa-calendar-alt text-primary-red"></i> {formatDate(article.createdAt || article.date)}</span>
                            <span className="flex items-center gap-2"><i className="far fa-user text-primary-red"></i> By {article.author || 'Editor Team'}</span>
                            <span className="flex items-center gap-2"><i className="far fa-heart text-primary-red"></i> {article.likes || 0} Likes</span>
                        </div>
                        
                        <div 
                            className="rounded-2xl overflow-hidden mb-10 shadow-2xl border border-gray-100 cursor-zoom-in group"
                            onClick={() => setIsImageModalOpen(true)}
                        >
                            <img src={article.image} alt={article.title} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        
                        <ImageModal 
                            isOpen={isImageModalOpen} 
                            onClose={() => setIsImageModalOpen(false)} 
                            imageSrc={article.image} 
                            altText={article.title} 
                        />
                        
                        <div className="max-w-none text-slate-800 leading-relaxed mb-12">
                            <p className="text-xl md:text-2xl font-black mb-8 italic text-slate-500 border-l-4 border-primary-red pl-6 py-2 leading-snug rich-text-content">
                                {article.excerpt}
                            </p>
                            <AutoLinker 
                                className="space-y-6 font-medium text-lg text-slate-700"
                                html={(article.fullStory || article.content || '').replace(/&nbsp;|\u00a0/g, ' ')}
                            />
                        </div>



                        {/* Comment Section */}
                        <CommentSection 
                            itemId={article._id}
                            comments={article.comments}
                            onAdd={addComment}
                            onLike={likeComment}
                            onReport={reportComment}
                            onUpdate={updateComment}
                            onDelete={deleteComment}
                        />


                    </div>

                    <aside className="lg:w-[35%] xl:w-[35%] relative">
                        <div className="sticky top-[140px] h-[calc(100vh-160px)] flex flex-col">
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-full overflow-hidden">
                                <h3 className="text-sm font-black text-primary-red uppercase tracking-widest mb-8 flex items-center gap-2 italic shrink-0">
                                    <span className="w-2.5 h-2.5 bg-primary-red rounded-full animate-pulse"></span> Related Stories
                                </h3>
                                
                                <div className="space-y-8 overflow-y-auto flex-1 pr-2 no-scrollbar">
                                    {relatedNews.map((item) => (
                                        <Link key={item._id} href={`/latest-news/${item.slug || item._id}`} className="flex gap-4 group cursor-pointer no-underline items-center">
                                            <div className="w-24 h-24 lg:w-28 lg:h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-md relative">
                                                <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="text-xs lg:text-[13px] font-black text-slate-900 leading-[1.3] line-clamp-1 group-hover:text-primary-red transition-colors uppercase tracking-tight italic">
                                                    {item.title}
                                                </h4>
                                                <div className="mt-2 text-[9px] text-gray-400 font-black uppercase tracking-widest italic flex items-center gap-1.5 line-clamp-1">
                                                    <span className="w-1.5 h-1.5 bg-primary-red rounded-full"></span> {item.category || 'Cinema Update'}
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

            {/* UserAuthModal removed - now inside CommentSection */}
        </div>
    );
};

export default NewsDetail;
