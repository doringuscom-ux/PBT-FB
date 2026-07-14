"use client";
import { useParams } from 'next/navigation';
import Link from 'next/link';


import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import CommentSection from '../components/CommentSection';
import ImageModal from '../components/ImageModal';
import AutoLinker from '@/components/AutoLinker';
import UserAuthModal from '../components/UserAuthModal';

const CelebDetail = () => {
    const params = useParams();
    const rawId = params?.id || params?.param || params?.['*'];
    const id = Array.isArray(rawId) ? rawId.join('/') : rawId;
    const { celebs, news, movies, addCelebComment, likeCelebComment, updateCelebComment, deleteCelebComment, followCeleb, user } = useData();
    const [activeSection, setActiveSection] = useState('All');
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    const celeb = celebs.find(item => item._id === id || item.slug === id); console.log('CELEB ID DETECTED:', id, 'TOTAL CELEBS IN CONTEXT:', celebs.length);
 
    const splitText = (text) => {
        if (!text) return { first: '', second: '' };
        const parts = text.trim().split(' ');
        if (parts.length > 1) {
            return { first: parts[0], second: text.slice(parts[0].length).trim() };
        }
        return { first: text, second: '' };
    };
 
    const { first: firstName, second: lastName } = splitText(celeb?.name);

    const formatCount = (num) => {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    };

    const getBaseFollowers = (id) => {
        if (!id) return 25400;
        // Generate a stable 4-5 digit base (10,000 to 99,999)
        const num = parseInt(id.toString().slice(-6), 16) || 0;
        return (num % 90000) + 10000;
    };

    const originalFans = (celeb?.followers?.length || 0) + (celeb?.bonusFollowers || 0);
    // Add the stable base to the actual/bonus fans to keep the old hierarchy perfectly intact
    const displayFollowers = getBaseFollowers(celeb?._id) + originalFans;
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (celeb) {
            // Ads removed
        }
    }, [celeb]);

    const { isLoading } = useData();
    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-black uppercase tracking-widest text-slate-400 italic">Loading Profile...</div>;

    if (!celeb) return <div className="p-10 text-center font-bold">Celebrity not found</div>;

    // Data Filtering
    const celebMovies = movies.filter(m => 
        m.cast?.some(a => 
            (a.celebrity?._id === celeb._id || a.celebrity === celeb._id) || 
            a.name.toLowerCase() === celeb.name.toLowerCase()
        )
    );
    const celebArticles = news
        .filter(n => 
            n.relatedCelebrities?.some(c => c._id === celeb._id || c === celeb._id) ||
            n.title.toLowerCase().includes(celeb.name.toLowerCase()) || 
            n.excerpt?.toLowerCase().includes(celeb.name.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Combined Gallery for Modal
    const galleryImages = [
        { src: celeb.image, title: celeb.name },
        ...(celeb.photos?.filter(p => p).map((p, idx) => ({ src: p, title: `${celeb.name} - Official Photo ${idx + 1}` })) || []),
        ...celebMovies.map(m => ({ src: m.image, title: `Movie Still: ${m.title}` }))
    ];

    const handleNext = () => {
        const currentIndex = galleryImages.findIndex(img => img.src === selectedImage?.src);
        if (currentIndex < galleryImages.length - 1) {
            setSelectedImage(galleryImages[currentIndex + 1]);
        } else {
            setSelectedImage(galleryImages[0]); // Loop back
        }
    };

    const handlePrev = () => {
        const currentIndex = galleryImages.findIndex(img => img.src === selectedImage?.src);
        if (currentIndex > 0) {
            setSelectedImage(galleryImages[currentIndex - 1]);
        } else {
            setSelectedImage(galleryImages[galleryImages.length - 1]); // Loop to end
        }
    };

    const tabs = [
        { id: 'All', label: 'All', count: null },
        { id: 'Articles', label: 'Articles', count: celebArticles.length },
        { id: 'Videos', label: 'Videos', count: celeb.videos?.filter(v => v).length || 0 },
        { id: 'Photos', label: 'Photos', count: galleryImages.length },
        { id: 'Filmography', label: 'Filmography', count: celebMovies.length },
    ].filter(tab => tab.id === 'All' || tab.count > 0);

    return (
        <div className="bg-white min-h-screen">

            {/* Cinematic Profile Header Section */}
            <div className="relative overflow-hidden bg-slate-950">
                {/* Background Banner with Blurry Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src={celeb.image} className="w-full h-full object-cover opacity-20 blur-3xl scale-125" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
                </div>

                <div className="page-container relative z-10 py-12 md:py-16">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-start text-center lg:text-left">
                        {/* Left: Avatar */}
                        <div className="w-64 lg:w-80 flex-shrink-0">
                            <div 
                                className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative group cursor-zoom-in"
                                onClick={() => setSelectedImage(galleryImages[0])}
                            >
                                <img src={celeb.image} alt={celeb.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                        <i className="fas fa-expand-alt text-lg"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle: Name & Biography */}
                        <div className="flex-1 space-y-8 py-4">
                            <div>
                                <div className="flex flex-col items-center lg:items-start gap-2 mb-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-[3px] bg-yellow-400"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 italic">
                                            {celeb.industry === 'Sports' ? 'SPORTS STAR' : celeb.industry === 'Business' ? 'BUSINESS LEADER' : 'CINEMA STAR'}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black italic tracking-[0.10em] leading-[0.9] flex justify-center lg:justify-start gap-3 whitespace-nowrap overflow-hidden text-ellipsis">
                                        <span className="text-white uppercase">{firstName}</span>
                                        {lastName && <span className="text-yellow-400 uppercase">{lastName}</span>}
                                    </h1>
                                </div>
                                {celeb.role && (
                                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-3 gap-y-2 text-sm font-black uppercase tracking-wide mb-1">
                                        {celeb.role.split(',').map((r, i) => (
                                            <React.Fragment key={i}>
                                                <span className={i % 2 === 0 ? "text-yellow-400" : "text-white"}>{r.trim()}</span>
                                                {i < celeb.role.split(',').length - 1 && (
                                                    <span className="text-white/30 font-light">|</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-3 gap-y-2 text-[11px] md:text-xs font-black uppercase tracking-[0.15em] text-white py-1">
                                    <span className="text-slate-400 italic">Official Profile</span>
                                    
                                    {celeb.industry && (
                                        <>
                                            <span className="text-white/20">|</span>
                                            <span className="text-slate-400 italic">Industry: <span className="text-white not-italic">{celeb.industry}</span></span>
                                        </>
                                    )}
                                    
                                    {celeb.birthDate && (
                                        <>
                                            <span className="text-white/20">|</span>
                                            <div className="flex items-center gap-1.5">
                                                <i className="fas fa-calendar-alt text-yellow-400 text-[11px]"></i>
                                                <span className="text-slate-400 italic">Born: <span className="text-slate-200 not-italic">{celeb.birthDate}</span></span>
                                            </div>
                                        </>
                                    )}
                                    
                                    {celeb.birthPlace && (
                                        <>
                                            <span className="text-white/20">|</span>
                                            <div className="flex items-center gap-1.5">
                                                <i className="fas fa-map-marker-alt text-yellow-400 text-[11px]"></i>
                                                <span className="text-slate-200">{celeb.birthPlace}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8 max-w-3xl mx-auto lg:mx-0">
                                <div className="pl-8 border-l-4 border-yellow-400 py-2 relative">
                                    <p className={`text-slate-300 leading-relaxed text-xl italic font-medium transition-all duration-300 ${!isBioExpanded ? 'line-clamp-2' : ''}`}>
                                        "{celeb.bio}"
                                    </p>
                                    {celeb.bio && celeb.bio.length > 80 && (
                                        <button 
                                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                                            className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-white transition-colors mt-2 not-italic"
                                        >
                                            {isBioExpanded ? 'View Less' : 'View More'}
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-start lg:justify-start gap-3 pt-4 overflow-x-auto no-scrollbar pb-2">
                                    <button 
                                        onClick={() => {
                                            if (user) {
                                                followCeleb(celeb._id);
                                            } else {
                                                if (window.confirm('Login First to follow your favorite actors! Would you like to sign in now?')) {
                                                    setShowAuthModal(true);
                                                }
                                            }
                                        }}
                                        className={`${celeb.isFollowing ? 'bg-white/20 border-white/40 text-white' : 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-yellow-400/20'} px-6 md:px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2 border shrink-0`}
                                    >
                                        <i className={`fas ${celeb.isFollowing ? 'fa-check' : 'fa-plus'}`}></i> {celeb.isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                    
                                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 md:px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all shadow-lg shrink-0 whitespace-nowrap">
                                        Add to Collection
                                    </button>
                                    
                                    <button className="w-[46px] h-[46px] shrink-0 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/60 hover:text-primary-red hover:border-primary-red transition-all shadow-xl">
                                        <i className="fas fa-share-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Media Showcase (Fills the 'Empty' Space) */}
                        <div className="w-full lg:w-96 space-y-6 pt-4 lg:pt-0 hidden xl:block">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 pb-2 border-b border-white/10">Featured Showcase</h3>
                            
                            {/* Featured Video or Image */}
                            {celeb.videos?.filter(v => v).length > 0 ? (
                                <div className="aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl group relative cursor-pointer" onClick={() => setActiveSection('Videos')}>
                                    <img src={celeb.image} className="w-full h-full object-cover object-top opacity-60 group-hover:scale-110 transition-transform duration-700" alt="" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-primary-red text-white flex items-center justify-center shadow-2xl shadow-primary-red/50 group-hover:scale-110 transition-transform">
                                            <i className="fas fa-play ml-1 text-xl"></i>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg inline-block">Official Interview</p>
                                    </div>
                                </div>
                            ) : celeb.photos?.filter(p => p).length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {celeb.photos.filter(p => p).slice(0, 2).map((p, i) => (
                                        <div 
                                            key={i} 
                                            className="rounded-2xl overflow-hidden aspect-[4/5] border border-white/10 shadow-xl group cursor-zoom-in relative" 
                                            onClick={() => {
                                                const img = galleryImages.find(img => img.src === p);
                                                setSelectedImage(img || { src: p, title: `${celeb.name} - Featured` });
                                            }}
                                        >
                                            <img src={p} className="w-full h-full object-cover object-[center_top] group-hover:scale-110 transition-transform duration-700" alt="" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <i className="fas fa-search-plus text-white text-lg"></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 flex justify-between items-center text-center">
                                    <div className="flex-1">
                                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none mb-2">
                                            {formatCount(displayFollowers)}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Fans</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10"></div>
                                    <div className="flex-1">
                                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none mb-2">{celeb.stats?.movieCount || celebMovies.length}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                            {celeb.industry === 'Sports' ? 'Matches' : celeb.industry === 'Business' ? 'Enterprises' : 'Movies'}
                                        </p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10"></div>
                                    <div className="flex-1">
                                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none mb-2">{celeb.stats?.nominations || '0'}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                            {celeb.industry === 'Sports' ? 'Trophies' : celeb.industry === 'Business' ? 'Awards' : 'Noms'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Mini Stats Bar */}
                            <div className="grid grid-cols-3 gap-1 pt-8 mt-4 border-t border-white/10">
                                <div className="text-center group">
                                    <p className="text-2xl font-black text-white leading-none group-hover:text-yellow-400 transition-colors">
                                        {formatCount(displayFollowers)}
                                    </p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Fans</p>
                                </div>
                                <div className="text-center group">
                                    <p className="text-2xl font-black text-white leading-none group-hover:text-yellow-400 transition-colors">{celeb.stats?.movieCount || celebMovies.length}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                        {celeb.industry === 'Sports' ? 'Matches' : celeb.industry === 'Business' ? 'Enterprises' : 'Movies'}
                                    </p>
                                </div>
                                <div className="text-center group">
                                    <p className="text-2xl font-black text-white leading-none group-hover:text-yellow-400 transition-colors">{celeb.stats?.nominations || '0'}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                        {celeb.industry === 'Sports' ? 'Trophies' : celeb.industry === 'Business' ? 'Awards' : 'Noms'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Tabs */}
            <div className="bg-white border-y sticky top-[64px] md:top-[74px] z-30 shadow-sm overflow-x-auto no-scrollbar">
                <div className="page-container flex">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-4 ${activeSection === tab.id ? 'border-primary-red text-primary-red bg-primary-red/5' : 'border-transparent text-gray-500 hover:text-slate-900'}`}
                        >
                            {tab.label} {tab.count !== null && <span className="ml-1 opacity-40">({tab.count})</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="page-container py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    <div className="lg:w-[65%] xl:w-[65%] space-y-12">
                        
                        {activeSection === 'All' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                {/* Career / Bio Section */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-6 bg-primary-red"></div>
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Celebrity Biography</h2>
                                    </div>
                                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                            <AutoLinker 
                                                className="text-slate-700 leading-relaxed text-lg font-medium space-y-4"
                                                html={(celeb.fullBio || `<p>${celeb.bio} ... Career details coming soon.</p>`).replace(/&nbsp;|\u00a0/g, ' ')}
                                            />
                                    </div>
                                </section>

                                {/* Featured Filmography Snippet */}
                                {celebMovies.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Featured Movies</h2>
                                            <button onClick={() => setActiveSection('Filmography')} className="text-primary-red font-black uppercase text-[10px] tracking-widest group">See All Filmography <i className="fas fa-chevron-right ml-1 transition-transform group-hover:translate-x-1"></i></button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {celebMovies.slice(0, 4).map((movie) => {
                                                const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
                                                return (
                                                <Link key={movie._id} href={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`} className="group relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
                                                    <img src={movie.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                                        <h4 className="text-white font-black text-xs uppercase italic tracking-tighter leading-tight line-clamp-2">{movie.title}</h4>
                                                        <p className="text-primary-red text-[8px] font-bold uppercase mt-1">View Details</p>
                                                    </div>
                                                </Link>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {celeb.milestones?.length > 0 && (
                                    <section>
                                        <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 mb-8 flex items-center gap-3 border-b pb-4">
                                            <i className="fas fa-trophy text-yellow-500"></i> Historic Milestones
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {celeb.milestones.map((item, i) => (
                                                <div key={i} className="flex gap-6 items-center p-4 rounded-2xl bg-white shadow-sm border border-gray-100 transition-all hover:border-primary-red/10">
                                                    <div className="bg-slate-900 text-white font-black px-4 py-1.5 rounded-lg text-sm italic tracking-tighter leading-none">{item.year}</div>
                                                    <div className="text-sm font-black text-slate-700 pt-0.5 italic tracking-tight uppercase leading-snug line-clamp-2">{item.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {activeSection === 'Articles' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 border-l-4 border-primary-red pl-4">Latest Articles on {celeb.name}</h2>
                                {celebArticles.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6">
                                        {celebArticles.map(article => (
                                            <Link key={article._id} href={`/latest-news/${article.slug || article._id}`} className="flex gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group no-underline">
                                                <div className="w-32 md:w-48 aspect-[16/10] flex-shrink-0 rounded-xl overflow-hidden">
                                                    <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                </div>
                                                <div className="flex-1 py-1">
                                                    <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-primary-red transition-colors uppercase italic leading-tight mb-2">{article.title}</h3>
                                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 font-medium">{article.excerpt}</p>
                                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <span>{article.date}</span>
                                                        <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                                                        <span className="text-primary-red">{article.category}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-gray-50 rounded-3xl">
                                        <i className="fas fa-newspaper text-gray-200 text-6xl mb-4"></i>
                                        <p className="font-black uppercase text-gray-400 tracking-widest text-xs">No articles published yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'Photos' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 border-l-4 border-primary-red pl-4">Official Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {(celeb.photos?.filter(p => p).length ? celeb.photos.filter(p => p) : []).map((p, idx) => (
                                        <div 
                                            key={`photo-${idx}`} 
                                            className="rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-xl transition-all group cursor-zoom-in relative"
                                            onClick={() => {
                                                const img = galleryImages.find(img => img.src === p);
                                                setSelectedImage(img);
                                            }}
                                        >
                                            <img src={p} className="w-full h-full object-cover object-[center_top] group-hover:scale-110 transition-transform duration-700" alt="" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <i className="fas fa-search-plus text-white text-xl"></i>
                                            </div>
                                        </div>
                                    ))}
                                    {celebMovies.map((m, idx) => (
                                        <div 
                                            key={`movie-photo-${idx}`} 
                                            className="rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-xl transition-all group relative cursor-zoom-in"
                                            onClick={() => {
                                                const img = galleryImages.find(img => img.src === m.image);
                                                setSelectedImage(img);
                                            }}
                                        >
                                            <img src={m.image} className="w-full h-full object-cover object-[center_top] group-hover:scale-110 transition-transform duration-700" alt="" />
                                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm z-10">Movie Still</div>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <i className="fas fa-search-plus text-white text-xl"></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'Videos' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 border-l-4 border-primary-red pl-4">Official Videos & Interviews</h2>
                                {celeb.videos?.filter(v => v).length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {celeb.videos.filter(v => v).map((url, idx) => (
                                            <div key={idx} className="aspect-video rounded-3xl overflow-hidden bg-black shadow-xl">
                                                <iframe 
                                                    className="w-full h-full"
                                                    src={url.includes('youtube.com') || url.includes('youtu.be') ? url.replace('watch?v=', 'embed/').split('&')[0] : url} 
                                                    title={`Video ${idx}`}
                                                    frameBorder="0" 
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-gray-50 rounded-3xl">
                                        <i className="fas fa-video text-gray-200 text-6xl mb-4"></i>
                                        <p className="font-black uppercase text-gray-400 tracking-widest text-xs">No videos available</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'Filmography' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 border-l-4 border-primary-red pl-4">Full Filmography</h2>
                                {celebMovies.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {celebMovies.map(movie => {
                                            const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
                                            return (
                                                <Link key={movie._id} href={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`} className="group no-underline shrink-0 block">
                                                    <div className="aspect-[2/3] rounded-2xl overflow-hidden relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
                                                        <img src={movie.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                                            <span className="text-primary-red text-[10px] font-black uppercase tracking-tighter mb-1 block italic">
                                                                { (movie.isReleaseDateConfirmed && movie.releaseDate) ? new Date(movie.releaseDate).getFullYear() : (movie.year || 'TBA') }
                                                            </span>
                                                            <h4 className="text-white text-xs font-black uppercase tracking-tighter italic leading-none line-clamp-2">{movie.title}</h4>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-gray-50 rounded-3xl">
                                        <i className="fas fa-film text-gray-200 text-6xl mb-4"></i>
                                        <p className="font-black uppercase text-gray-400 tracking-widest text-xs">Filmography data not linked</p>
                                    </div>
                                )}
                            </div>
                        )}



                        <div className=" border-gray-100">
                             <CommentSection 
                                itemId={celeb._id}
                                itemType="celeb"
                                comments={celeb.comments}
                                onAdd={addCelebComment}
                                onLike={likeCelebComment}
                                onUpdate={updateCelebComment}
                                onDelete={deleteCelebComment}
                            />
                        </div>



                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-[35%] xl:w-[35%] relative">
                        <div className="sticky top-[140px] h-[calc(100vh-160px)] flex flex-col">
                            {/* Recent News */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-full overflow-hidden">
                                <h3 className="text-xs font-black text-primary-red uppercase tracking-widest mb-6 flex items-center gap-2 italic shrink-0">
                                    <span className="w-2.5 h-2.5 bg-primary-red rounded-full animate-pulse"></span> Recent Buzz
                                </h3>
                                <div className="space-y-8 overflow-y-auto flex-1 pr-2 no-scrollbar">
                                    {news.slice(0, 10).map(item => (
                                        <Link key={item._id} href={`/latest-news/${item.slug || item._id}`} className="flex gap-4 group no-underline items-center">
                                            <div className="w-24 h-24 lg:w-28 lg:h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-md relative">
                                                <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <h4 className="text-xs lg:text-[13px] font-black text-slate-900 leading-[1.3] line-clamp-3 group-hover:text-primary-red transition-colors uppercase italic">{item.title}</h4>
                                                <div className="mt-2 text-[9px] text-gray-400 font-black uppercase tracking-widest italic flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-primary-red rounded-full"></span> News Alert
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

            <ImageModal 
                isOpen={!!selectedImage} 
                onClose={() => setSelectedImage(null)} 
                imageSrc={selectedImage?.src} 
                altText={selectedImage?.title} 
                onNext={handleNext}
                onPrev={handlePrev}
            />

            <UserAuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
};

export default CelebDetail;
