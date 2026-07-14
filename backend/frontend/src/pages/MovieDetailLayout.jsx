import React, { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import CountdownTimer from '../components/CountdownTimer';
import CommentSection from '../components/CommentSection';
import ImageModal from '../components/ImageModal';
import UserAuthModal from '../components/UserAuthModal';

const MovieDetailLayout = ({ movie: propMovie, sidebarNews }) => {
    const { movies, news, rateMovie, deleteMovieRating, user, addMovieComment, likeMovieComment, updateMovieComment, deleteMovieComment } = useData();
    
    // Always use the latest movie data from context to ensure real-time rating updates show immediately
    const movie = movies.find(m => m._id === propMovie._id) || propMovie;

    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.scrollToTab || 'Timeline');
    const [reviewText, setReviewText] = useState(movie.myReview || '');
    const [tempRating, setTempRating] = useState(movie.myRating || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [, forceUpdate] = React.useState({});

    // Sync review text if movie updates
    React.useEffect(() => {
        if (movie.myReview) setReviewText(movie.myReview);
        if (movie.myRating) setTempRating(movie.myRating);
    }, [movie.myReview, movie.myRating]);

    // Smooth scroll to content if navigating from Box Office
    React.useEffect(() => {
        if (location.state?.scrollToTab) {
            const tabsElement = document.getElementById('movie-tabs-nav');
            if (tabsElement) {
                tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [location.state]);

    const [vote, setVote] = useState(null); 
    const [showPlayer, setShowPlayer] = useState(false);
    const [watchScore, setWatchScore] = useState(64);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showFullPlayer, setShowFullPlayer] = useState(false);
    const isUpcoming = movie.releaseDate && new Date(movie.releaseDate) > new Date();
    const tabs = ['Timeline', 'Cast & Crew', 'Photos', 'Articles'];
    if (!isUpcoming) {
        tabs.splice(2, 0, 'Box Office', 'Movie Review');
    }

    const movieArticles = news.filter(article => 
        (article.relatedMovie?._id === movie._id) || (article.relatedMovie === movie._id)
    );

    // Auto-generate a stable 3-digit base number for ratings so it always looks populated
    const baseRatings = movie._id ? (parseInt(movie._id.toString().slice(-4), 16) % 900) + 100 : 345;
    const displayTotalRatings = baseRatings + (movie.totalRatings || 0);
 
    const splitText = (text) => {
        if (!text) return { first: '', second: '' };
        const parts = text.trim().split(' ');
        if (parts.length > 1) {
            return { first: parts[0], second: text.slice(parts[0].length).trim() };
        }
        return { first: text, second: '' };
    };
 
    const { first: titleFirst, second: titleSecond } = splitText(movie.title);

    const handleVote = (type) => {
        if (vote === type) return;
        setVote(type);
        setWatchScore(prev => type === 'watch' ? prev + 1 : prev - 1);
    };

    const handleShare = async () => {
        const shareData = {
            title: `${movie.title} - PBTadka`,
            text: `Check out ${movie.title} on PBTadka!`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };
    const getSuggestions = () => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Exclude current movie from suggestions
        const otherMovies = movies.filter(m => m._id !== movie._id);
        
        // Tier 1: Movies from the last 30 days
        const freshMovies = otherMovies.filter(m => {
            const date = new Date(m.createdAt || m.releaseDate);
            return date >= oneMonthAgo;
        });

        // Pick up to 6 random fresh movies
        let suggested = [...freshMovies].sort(() => 0.5 - Math.random()).slice(0, 6);
        
        // Tier 2 Fallback: If less than 6 fresh movies, fill with older ones
        if (suggested.length < 6) {
            const olderMovies = otherMovies.filter(m => !freshMovies.some(fm => fm._id === m._id));
            const fillCount = 6 - suggested.length;
            const extra = [...olderMovies].sort(() => 0.5 - Math.random()).slice(0, fillCount);
            suggested = [...suggested, ...extra];
        }
        
        // Final shuffle 
        return suggested.sort(() => 0.5 - Math.random());
    };

    const suggestedMovies = getSuggestions();

    // Combined Gallery for Modal
    const galleryImages = [
        ...(movie.photos?.length > 0 ? movie.photos : [movie.image, movie.coverImage || movie.image]).map((p, i) => ({ 
            src: p, 
            title: `${movie.title} - Photo ${i + 1}` 
        }))
    ];

    const handleNext = () => {
        const currentIndex = galleryImages.findIndex(img => img.src === selectedImage?.src);
        if (currentIndex < galleryImages.length - 1) {
            setSelectedImage(galleryImages[currentIndex + 1]);
        } else {
            setSelectedImage(galleryImages[0]);
        }
    };

    const handlePrev = () => {
        const currentIndex = galleryImages.findIndex(img => img.src === selectedImage?.src);
        if (currentIndex > 0) {
            setSelectedImage(galleryImages[currentIndex - 1]);
        } else {
            setSelectedImage(galleryImages[galleryImages.length - 1]);
        }
    };

    return (
        <>
            <div className="bg-[#0a0e17] md:bg-[#f8f9fa] min-h-screen">
            {/* Custom Mobile Hero Header */}
            <div className="md:hidden relative w-full flex flex-col bg-[#0a0e17] text-white overflow-hidden pb-10">
                {/* Background Poster Blurred */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-xl opacity-20 scale-110"
                    style={{ backgroundImage: `url(${movie.coverImage || movie.image})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/40 via-[#0a0e17]/80 to-[#0a0e17] h-[70vh] top-[10vh]"></div>
                
                <div className="relative z-10 flex flex-col items-center px-5 pt-16">
                    {/* Poster */}
                    <div className="w-[55%] aspect-[2/3] rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/20 mb-6 group cursor-pointer" onClick={() => setSelectedImage({ src: movie.image, title: movie.title })}>
                        <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>

                    {/* Production House */}
                    
                    
                    {/* Now Streaming / Coming Soon */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-[2px] bg-yellow-400"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 italic">
                            {isUpcoming ? 'COMING SOON' : 'NOW STREAMING'}
                        </span>
                        <div className="w-8 h-[2px] bg-yellow-400"></div>
                    </div>

                    {/* Title */}
                    <h1 className="text-[2.5rem] font-black italic tracking-tighter uppercase leading-[0.9] text-center mb-4 drop-shadow-xl">
                        <span className="text-gray-100">{titleFirst}</span>
                        {titleSecond && <span className="text-yellow-400 ml-3">{titleSecond}</span>}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-8">
                        <i className="fas fa-star text-yellow-400 text-lg"></i>
                        <span className="text-xl font-black text-white">{(movie.averageRating || 0).toFixed(1)}</span>
                        <span className="text-[11px] text-gray-400">({displayTotalRatings} Ratings)</span>
                    </div>

                    {/* Info Badges */}
                    <div className="flex w-full items-center justify-between gap-2 mb-8">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-1 flex justify-center items-center gap-2 backdrop-blur-sm">
                            <i className="far fa-calendar-alt text-gray-400 text-[10px]"></i>
                            <span className="text-[9px] font-medium text-gray-300 whitespace-nowrap">
                                {(movie.isReleaseDateConfirmed && movie.releaseDate) ? 
                                    new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 
                                    (movie.estimatedRelease || 'TBA')}
                            </span>
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-1 flex justify-center items-center gap-2 backdrop-blur-sm">
                            <i className="fas fa-film text-gray-400 text-[10px]"></i>
                            <span className="text-[9px] font-medium text-gray-300 whitespace-nowrap">{movie.industry}</span>
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-1 flex justify-center items-center gap-2 backdrop-blur-sm">
                            <i className="fas fa-book-open text-gray-400 text-[10px]"></i>
                            <span className="text-[9px] font-medium text-gray-300 whitespace-nowrap">{movie.genre?.split(',')[0]}</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="w-full flex flex-col gap-4 mb-10">
                        <button 
                            onClick={() => {
                                if (movie.watchNowUrl) {
                                    if (movie.isWatchNowRedirect) {
                                        window.open(movie.watchNowUrl, '_blank');
                                    } else {
                                        setShowFullPlayer(true);
                                    }
                                } else if (movie.trailerUrl || movie.trailerVideo) {
                                    setShowFullPlayer(true);
                                }
                            }}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-4 rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                        >
                            <i className="fas fa-play text-sm"></i>
                            <span>Watch Now</span>
                        </button>
                        
                        <div className="flex gap-4">
                            <button className="flex-1 bg-transparent text-white border border-white/20 py-4 rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                <i className="fas fa-plus"></i>
                                <span>Watchlist</span>
                            </button>
                            <button onClick={handleShare} className="flex-1 bg-transparent text-white border border-white/20 py-4 rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                <i className="fas fa-share-alt"></i>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    {/* About Movie */}
                    <div className="w-full text-left flex flex-col gap-3">
                        <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">About Movie</h3>
                        <p className="text-gray-300 text-xs leading-relaxed font-medium">
                            {movie.overview}
                        </p>
                        <button onClick={() => {
                            const tabsElement = document.getElementById('movie-tabs-nav');
                            if (tabsElement) tabsElement.scrollIntoView({ behavior: 'smooth' });
                            setActiveTab('Timeline');
                        }} className="text-yellow-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 self-start mt-2 hover:opacity-80">
                            Read More <i className="fas fa-chevron-down"></i>
                        </button>
                    </div>
                    
                    {/* YouTube Links on Mobile */}
                    {movie.youtubeLinks?.length > 0 && (
                        <div className="w-full mt-10 flex flex-col gap-3">
                            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Official Videos</h3>
                            <div className="flex flex-col gap-3">
                                {movie.youtubeLinks.slice(0, 4).map((link, idx) => {
                                     let videoId = '';
                                     if (link.url.includes('v=')) {
                                         videoId = link.url.split('v=')[1].split('&')[0];
                                     } else if (link.url.includes('youtu.be/')) {
                                         videoId = link.url.split('youtu.be/')[1].split('?')[0];
                                     } else {
                                         videoId = link.url.split('/').pop().split('?')[0];
                                     }
                                     const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                     return (
                                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white/5 border border-white/10 p-2.5 rounded-2xl no-underline">
                                            <div className="w-24 aspect-video rounded-xl overflow-hidden shrink-0 relative">
                                                <img src={thumbUrl} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <i className="fas fa-play text-[10px] text-white"></i>
                                                </div>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[11px] font-bold text-gray-200 truncate">{link.title || 'Watch Video'}</span>
                                            </div>
                                        </a>
                                     );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unified Hero Header - Desktop Only */}
            <div className="hidden md:flex relative w-full min-h-[600px] md:h-[550px] flex-col justify-end overflow-hidden">
                <div 
                    className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${movie.coverImage ? 'scale-100 brightness-75' : 'scale-110 blur-xl brightness-50'}`}
                    style={{ backgroundImage: `url(${movie.coverImage || movie.image})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-black/20"></div>
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8f9fa] to-transparent z-[1]"></div>

                <div className="page-container relative h-full flex items-end pb-0 md:pb-12 z-10">
                    <div className="flex flex-col-reverse md:flex-row items-center md:items-end gap-0 md:gap-12 w-full pt-0 md:pt-0">
                        
                        {/* Countdown Sidebar (Middle/Bottom on Mobile - Integrated here for alignment) */}
                        {isUpcoming && (
                            <div className="flex md:hidden justify-center w-full my-6">
                                <div className="scale-90 md:scale-100 origin-center drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                    <CountdownTimer targetDate={movie.releaseDate} onComplete={() => forceUpdate({})} />
                                </div>
                            </div>
                        )}

                        {/* Floating Poster & Interaction */}
                        <div className="flex flex-col items-center md:items-start gap-0 shrink-0 z-20">
                            <div 
                                className="relative w-64 md:w-56 aspect-[2/3] rounded-sm overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-2 border-white/20 transform md:-translate-y-4 cursor-zoom-in group/poster"
                                onClick={() => setSelectedImage({ src: movie.image, title: movie.title })}
                            >
                                <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-105" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                                    <i className="fas fa-expand-alt text-white text-xl"></i>
                                </div>
                                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 cursor-pointer hover:bg-primary-red transition-colors z-10" onClick={(e) => { e.stopPropagation(); /* Add to list logic here */ }}>
                                    <i className="fas fa-plus text-lg"></i>
                                </div>
                            </div>

                            {/* Interaction: Voting (Upcoming) or Rating (Released) */}
                            {isUpcoming ? (
                                <div className="w-64 md:w-56 bg-white shadow-2xl flex items-stretch border-t-4 border-primary-red overflow-hidden transform md:-translate-y-4">
                                    <div className="bg-primary-red/5 px-4 flex flex-col items-center justify-center border-r border-gray-100 min-w-[50px]">
                                        <span className="text-2xl font-black text-primary-red italic">{watchScore}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col p-1.5 gap-1 justify-center">
                                        <button 
                                            onClick={() => handleVote('watch')}
                                            className={`flex items-center gap-2 text-[7px] md:text-[9px] font-black uppercase tracking-widest px-2 py-2 rounded transition-all whitespace-nowrap ${vote === 'watch' ? 'bg-green-500 text-white shadow-md' : 'hover:bg-green-50 text-green-600'}`}
                                        >
                                            <i className="fas fa-check-circle"></i> Will Watch
                                        </button>
                                        <button 
                                            onClick={() => handleVote('not')}
                                            className={`flex items-center gap-2 text-[7px] md:text-[9px] font-black uppercase tracking-widest px-2 py-2 rounded transition-all whitespace-nowrap ${vote === 'not' ? 'bg-red-500 text-white shadow-md' : 'hover:bg-red-50 text-red-500'}`}
                                        >
                                            <i className="fas fa-times-circle"></i> Not Interested
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-64 md:w-56 bg-slate-950 shadow-2xl p-3 border-t-4 border-primary-red transform md:-translate-y-4 rounded-b-2xl">
                                    <div className="flex flex-col">
                                        <div className="flex flex-col items-center justify-between gap-3 mt-auto">
                                            <div className="w-full flex flex-col items-center gap-1 bg-slate-900 px-3 py-3 rounded-xl border border-white/10 shadow-xl">
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Rate this movie</span>
                                                <div className="flex gap-3 text-lg">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button 
                                                            key={star}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setTempRating(star);
                                                                if (!user) {
                                                                    rateMovie(movie._id, star);
                                                                    // Optional: show a small toast or message
                                                                }
                                                            }}
                                                            className="hover:scale-125 transition-transform active:scale-95"
                                                        >
                                                            <i className={`fas fa-star ${star <= tempRating ? 'text-yellow-400' : 'text-white/10 hover:text-white/30'}`}></i>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {!user && tempRating > 0 && (
                                                <p className="text-[8px] font-black text-green-500 uppercase tracking-widest animate-pulse">Anonymous Rating Saved!</p>
                                            )}
                                        </div>
                                        <div className="w-full flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl border border-white/10 shadow-xl overflow-hidden relative group mt-3">
                                            {/* Background Glow */}
                                            <div className="absolute inset-0 bg-primary-red/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            
                                            <div className="relative z-10 flex flex-col">
                                                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.1em] leading-none mb-1 text-left">Community</span>
                                                <span className="text-[11px] font-black text-white uppercase tracking-tight leading-none text-left">
                                                    {displayTotalRatings} Ratings
                                                </span>
                                            </div>
                                            <div className="relative z-10 flex items-center gap-2">
                                                <i className="fas fa-star text-yellow-500 text-xs"></i>
                                                <span className="text-2xl font-black text-white italic tracking-tighter leading-none">{(movie.averageRating || 0).toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Mobile YouTube Links (Moved here to show after Rating) */}
                            {movie.youtubeLinks?.length > 0 && (
                                <div className="lg:hidden mt-6 flex flex-col gap-2 w-full max-w-sm mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <div className="w-8 h-8 rounded-full bg-primary-red flex items-center justify-center shadow-lg shadow-primary-red/20">
                                            <i className="fab fa-youtube text-white text-xs"></i>
                                        </div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Official Promos</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {movie.youtubeLinks.slice(0, 4).map((link, idx) => {
                                             let videoId = '';
                                             if (link.url.includes('v=')) {
                                                 videoId = link.url.split('v=')[1].split('&')[0];
                                             } else if (link.url.includes('youtu.be/')) {
                                                 videoId = link.url.split('youtu.be/')[1].split('?')[0];
                                             } else {
                                                 videoId = link.url.split('/').pop().split('?')[0];
                                             }
                                             const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                             return (
                                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl no-underline hover:bg-primary-red transition-all duration-300 group">
                                                    <div className="w-24 aspect-video rounded-xl overflow-hidden shrink-0 relative shadow-lg group-hover:ring-2 ring-white/50">
                                                        <img src={thumbUrl} className="w-full h-full object-cover" alt="" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                            <i className="fas fa-play text-[10px] text-white"></i>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[11px] font-black text-white italic truncate pr-2 leading-tight uppercase tracking-tight text-left">{link.title || 'Watch Video'}</span>
                                                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white/80 text-left">Play on YouTube</span>
                                                    </div>
                                                </a>
                                             );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Title & Info (Top on Mobile) */}
                        <div className="flex-1 w-full text-center md:text-left pb-0 md:pb-12">
                            <div className="flex flex-col items-center md:items-start gap-4 mb-6">
                                {/* Production House (Mobile Focus) */}
                                <div className="flex flex-col items-center md:items-start gap-1">
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:block w-8 h-[3px] bg-yellow-400"></div>
                                        <div className="md:hidden w-12 h-1 bg-yellow-400 rounded-full"></div>
                                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-yellow-400 italic">
                                            {isUpcoming ? 'COMING SOON' : 'NOW STREAMING'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Metallic Cinematic Title */}
                                <h1 className="text-5xl md:text-[4rem] font-black italic tracking-tighter uppercase leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                    <span className="text-white bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-300 to-gray-500">{titleFirst}</span>
                                    {titleSecond && <span className="text-yellow-400 bg-clip-text text-transparent bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700"> {titleSecond}</span>}
                                </h1>
                            </div>

                            {/* Meta Info Bar (Centered Dots for Mobile) */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-3 gap-x-4 text-white font-black uppercase tracking-widest text-[9px] md:text-xs mb-2 md:mb-8">
                                <span className="text-yellow-400">RELEASE DATE: <span className="text-white">
                                    {(movie.isReleaseDateConfirmed && movie.releaseDate) ? 
                                        new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 
                                        (movie.estimatedRelease || 'TBA')}
                                </span></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
                                <span className="text-yellow-400">{movie.industry}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
                                <span className="opacity-90">{movie.genre?.split(',')[0]}</span>
                            </div>

                            {/* Action Buttons (Desktop Only) */}
                            <div className="hidden md:flex flex-wrap items-center justify-start gap-4 px-0 mt-8">
                                <button 
                                    onClick={() => {
                                        if (movie.watchNowUrl) {
                                            if (movie.isWatchNowRedirect) {
                                                window.open(movie.watchNowUrl, '_blank');
                                            } else {
                                                setShowFullPlayer(true);
                                            }
                                        } else if (movie.trailerUrl || movie.trailerVideo) {
                                            setShowFullPlayer(true);
                                        }
                                    }}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-yellow-400/20 group"
                                >
                                    <i className="fas fa-play text-lg group-hover:animate-pulse"></i>
                                    <span>Watch Now</span>
                                </button>
                                <button className="bg-white/5 hover:bg-white/10 text-white border-2 border-white/20 px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 backdrop-blur-md">
                                    <i className="fas fa-plus"></i>
                                    <span>Watchlist</span>
                                </button>
                                <button onClick={handleShare} className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group">
                                    <i className="fas fa-share-alt group-hover:rotate-12"></i>
                                </button>
                            </div>

                        </div>

                        {/* Vertical YouTube Sidebar (Desktop Only) */}
                        {movie.youtubeLinks?.length > 0 && (
                            <div className="hidden lg:flex flex-col gap-3 absolute top-12 right-0 w-64 max-h-[400px] overflow-y-auto no-scrollbar pr-2 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <i className="fab fa-youtube text-primary-red text-xl"></i>
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Official Videos</span>
                                </div>
                                {movie.youtubeLinks.map((link, idx) => {
                                    let videoId = '';
                                    if (link.url.includes('v=')) {
                                        videoId = link.url.split('v=')[1].split('&')[0];
                                    } else if (link.url.includes('youtu.be/')) {
                                        videoId = link.url.split('youtu.be/')[1].split('?')[0];
                                    } else {
                                        videoId = link.url.split('/').pop().split('?')[0];
                                    }
                                    const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                    return (
                                        <a 
                                            key={idx} 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="group/vlink flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-3 rounded-2xl hover:bg-primary-red transition-all duration-300 no-underline shadow-2xl hover:-translate-x-3"
                                        >
                                            <div className="w-28 aspect-video rounded-xl overflow-hidden relative shrink-0 shadow-lg group-hover/vlink:ring-2 ring-white/50">
                                                <img src={thumbUrl} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/vlink:bg-black/10">
                                                    <i className="fas fa-play text-xs text-white"></i>
                                                </div>
                                            </div>
                                            <div className="flex flex-col min-w-0 pr-2">
                                                <span className="text-[11px] font-black text-white italic tracking-tight uppercase line-clamp-2 leading-tight mb-1">{link.title || `Video ${idx + 1}`}</span>
                                                <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest group-hover/vlink:text-white transition-colors">Play Video</span>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        {/* Countdown Sidebar (Desktop/Tablet - Top Right) */}
                        {isUpcoming && (
                            <div className={`hidden md:block absolute right-0 ${movie.youtubeLinks?.length > 0 ? 'top-[440px]' : 'top-12'}`}>
                                <CountdownTimer targetDate={movie.releaseDate} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div id="movie-tabs-nav" className="bg-white border-b sticky top-[64px] md:top-[74px] z-20 shadow-sm overflow-x-auto no-scrollbar">
                <div className="page-container flex">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-4 ${activeTab === tab ? 'border-primary-red text-primary-red bg-primary-red/5' : 'border-transparent text-gray-500 hover:text-slate-900'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <main className="page-container py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    <div className="lg:w-[65%] xl:w-[65%] space-y-12">
                        {activeTab === 'Timeline' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-10 w-1.5 bg-primary-red rounded-full"></div>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white md:text-slate-900 leading-none">
                                            The Story <span className="text-primary-red">Behind</span> {movie.title}
                                        </h2>
                                    </div>

                                    <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                            <i className="fas fa-quote-right text-9xl"></i>
                                        </div>

                                        <div className="relative z-10">
                                            <h3 className="text-[10px] font-black text-primary-red uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                                <span className="w-8 h-[2px] bg-primary-red/20"></span> Synopsis
                                            </h3>
                                            
                                            <div className="text-lg md:text-xl font-medium text-slate-700 leading-relaxed font-serif italic mb-4 border-l-4 border-slate-100 pl-8 py-2 whitespace-pre-wrap">
                                                {movie.overview}
                                            </div>

                                            {movie.fullStory && (
                                                <div className="mt-6 pt-6 border-t border-dashed border-gray-200 rich-text-content prose prose-slate max-w-none text-slate-600 font-medium" 
                                                     style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                     dangerouslySetInnerHTML={{ 
                                                         __html: (movie.fullStory || '').replace(/&nbsp;|\u00a0/g, ' ') 
                                                     }} 
                                                />
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {(movie.trailerUrl || movie.trailerVideo) && (
                                    <section id="official-trailer">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black uppercase italic text-white md:text-slate-900">Official Trailer</h3>
                                            {showPlayer && (
                                                <button 
                                                    onClick={() => setShowPlayer(false)}
                                                    className="text-primary-red font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity"
                                                >
                                                    <i className="fas fa-times"></i> Close Player
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="relative group aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-black">
                                            {!showPlayer ? (
                                                <div className="relative w-full h-full cursor-pointer" onClick={() => setShowPlayer(true)}>
                                                    <img src={movie.coverImage || movie.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 brightness-50" alt="" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-yellow-400 text-slate-950 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.4)] transition-transform hover:scale-110">
                                                            <i className="fas fa-play text-2xl md:text-3xl ml-1"></i>
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/40 to-transparent">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="px-2 py-0.5 bg-yellow-400 text-slate-950 text-[8px] font-black uppercase tracking-widest rounded">Exclusive</span>
                                                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{movie.title} • Official Trailer</span>
                                                        </div>
                                                        <h4 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter">Click to Play Trailer</h4>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full">
                                                    {(() => {
                                                        const url = movie.trailerVideo?.videoUrl || movie.trailerUrl;
                                                        if (url?.includes('youtube.com') || url?.includes('youtu.be')) {
                                                            const vid = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
                                                            return (
                                                                <iframe 
                                                                    src={`https://www.youtube.com/embed/${vid}?autoplay=1`} 
                                                                    className="w-full h-full" 
                                                                    allowFullScreen 
                                                                    allow="autoplay; encrypted-media"
                                                                ></iframe>
                                                            );
                                                        }
                                                        return (
                                                            <video 
                                                                src={url} 
                                                                controls 
                                                                autoPlay 
                                                                className="w-full h-full object-contain"
                                                            ></video>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {movie.cast?.length > 0 && (
                                    <section id="main-cast">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black uppercase italic text-white md:text-slate-900">Main Cast</h3>
                                            <button onClick={() => setActiveTab('Cast & Crew')} className="text-primary-red font-black uppercase text-[10px] tracking-widest group">Full Cast <i className="fas fa-chevron-right ml-1 transition-transform group-hover:translate-x-1"></i></button>
                                        </div>
                                        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 pt-2 -mt-2">
                                            {movie.cast.slice(0, 8).map((actor, idx) => (
                                                <Link 
                                                    key={idx} 
                                                    to={actor.celebrity ? `/celebrities/${actor.celebrity.slug || actor.celebrity._id || actor.celebrity}` : `/actor/${encodeURIComponent(actor.name)}`} 
                                                    className="group flex flex-col items-center gap-2 shrink-0 no-underline"
                                                >
                                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white shadow-lg overflow-hidden transition-all group-hover:scale-110 duration-500 relative ring-2 ring-transparent group-hover:ring-primary-red/20">
                                                        <img src={actor.image || 'https://res.cloudinary.com/dzvk7womv/image/upload/v1711287600/default_actor.jpg'} className="w-full h-full object-cover object-top" alt="" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-white md:text-slate-900 uppercase tracking-tight text-center max-w-[80px] truncate group-hover:text-primary-red transition-colors">{actor.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <section id="photos">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black uppercase italic text-white md:text-slate-900">Photos <span className="text-gray-300 ml-1">({galleryImages.length})</span></h3>
                                        <button onClick={() => setActiveTab('Photos')} className="text-primary-red font-black uppercase text-[10px] tracking-widest group">View All <i className="fas fa-chevron-right ml-1 transition-transform group-hover:translate-x-1"></i></button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {(movie.photos?.length > 0 ? movie.photos : [movie.image, movie.coverImage || movie.image]).slice(0, 4).map((p, i) => (
                                            <div 
                                                key={i} 
                                                className={`rounded-xl overflow-hidden aspect-[16/10] shadow-md border-2 border-white cursor-zoom-in group/thumb relative ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                                                onClick={() => {
                                                    const img = galleryImages.find(img => img.src === p);
                                                    setSelectedImage(img);
                                                }}
                                            >
                                                <img src={p} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-700" alt="" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                                    <i className="fas fa-search-plus text-white text-lg"></i>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="border-gray-100">
                                    <CommentSection 
                                        itemId={movie._id}
                                        comments={movie.comments}
                                        onAdd={addMovieComment}
                                        onLike={likeMovieComment}
                                        onUpdate={updateMovieComment}
                                        onDelete={deleteMovieComment}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'Cast & Crew' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white md:text-slate-900 mb-8">Main Cast & Production Crew</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-8 px-2">
                                {movie.cast?.map((actor, idx) => (
                                    <Link 
                                        key={idx} 
                                        to={actor.celebrity ? `/celebrities/${actor.celebrity.slug || actor.celebrity._id || actor.celebrity}` : `/actor/${encodeURIComponent(actor.name)}`} 
                                        className="group flex flex-col items-center gap-3 no-underline"
                                    >
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden transition-transform group-hover:scale-110 duration-500 relative">
                                                <img src={actor.image || 'https://res.cloudinary.com/dzvk7womv/image/upload/v1711287600/default_actor.jpg'} className="w-full h-full object-cover object-top" alt="" />
                                                <div className="absolute inset-0 bg-primary-red/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <i className="fas fa-link text-white text-xl"></i>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-[11px] font-black text-white md:text-slate-900 uppercase tracking-tight group-hover:text-primary-red transition-colors">{actor.name}</h4>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{actor.role || 'Actor'}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Box Office' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-10 w-1.5 bg-yellow-500 rounded-full"></div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                                        Box Office <span className="text-yellow-500">Report</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Financial Summary Card */}
                                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                            <i className="fas fa-chart-line text-8xl"></i>
                                        </div>
                                        <div className="relative z-10 space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Worldwide Collection</p>
                                                <h3 className="text-4xl md:text-5xl font-black text-yellow-400 italic tracking-tighter">
                                                    {movie.performance?.worldwide ? `₹${movie.performance.worldwide} Cr` : 'N/A'}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-8 border-t border-white/10 pt-6">
                                                <div>
                                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Budget</p>
                                                    <p className="text-lg font-black italic">₹{movie.performance?.budget || '0'} Cr</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Verdict</p>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        movie.performance?.verdict === 'Blockbuster' ? 'bg-green-500 text-white' : 
                                                        movie.performance?.verdict === 'Hit' ? 'bg-blue-500 text-white' : 
                                                        movie.performance?.verdict === 'Flop' ? 'bg-red-500 text-white' : 'bg-slate-700 text-white'
                                                    }`}>
                                                        {movie.performance?.verdict || 'Running'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Profit/Loss Badge */}
                                            {movie.performance?.worldwide && movie.performance?.budget && (
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest shadow-lg ${
                                                    parseFloat(movie.performance.worldwide) > parseFloat(movie.performance.budget) 
                                                    ? 'border-green-500/50 text-green-400 bg-green-500/10' 
                                                    : 'border-red-500/50 text-red-400 bg-red-500/10'
                                                }`}>
                                                    <i className={`fas ${parseFloat(movie.performance.worldwide) > parseFloat(movie.performance.budget) ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                                                    ROI: {Math.abs(((parseFloat(movie.performance.worldwide) - parseFloat(movie.performance.budget)) / parseFloat(movie.performance.budget)) * 100).toFixed(1)}%
                                                    {parseFloat(movie.performance.worldwide) > parseFloat(movie.performance.budget) ? ' Profit' : ' Recovery'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Screens & Release Data */}
                                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-red/5 flex items-center justify-center text-primary-red">
                                                <i className="fas fa-desktop text-xl"></i>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Screens Count</p>
                                                <h4 className="text-xl font-black italic uppercase text-slate-900">{movie.performance?.screens || 'N/A'} <span className="text-[10px] text-slate-400 lowercase italic ml-1">Worldwide</span></h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500">
                                                <i className="fas fa-calendar-alt text-xl"></i>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Release Date</p>
                                                <h4 className="text-xl font-black italic uppercase text-slate-900">
                                                    {
                                                        (movie.isReleaseDateConfirmed && movie.releaseDate) ? (
                                                            new Date(movie.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        ) : (
                                                            movie.estimatedRelease || 'TBA'
                                                        )
                                                    }
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Collection Breakdown Table */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                                    <div className="bg-slate-50 px-8 py-5 border-b border-gray-100">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <i className="fas fa-table text-primary-red"></i> Collection Breakdown
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <tbody className="divide-y divide-gray-50">
                                                {[
                                                    { label: 'Opening Day (Day 1)', value: movie.performance?.day1, highlight: true },
                                                    { label: 'Opening Weekend', value: movie.performance?.weekend },
                                                    { label: 'First Week', value: movie.performance?.week1 },
                                                    { label: 'India Net Collection', value: movie.performance?.indiaNet, highlight: true },
                                                    { label: 'India Gross Collection', value: movie.performance?.indiaGross },
                                                    { label: 'Overseas Collection', value: movie.performance?.overseas },
                                                ].map((row, idx) => (
                                                    <tr key={idx} className={`${row.highlight ? 'bg-yellow-50/30' : 'hover:bg-slate-50'} transition-colors`}>
                                                        <td className="px-8 py-5 text-sm font-black text-slate-600 uppercase tracking-tight">{row.label}</td>
                                                        <td className="px-8 py-5 text-right font-black text-slate-900 italic">
                                                            {row.value ? `₹${row.value} Cr` : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-slate-900 text-white">
                                                    <td className="px-8 py-6 text-sm font-black uppercase tracking-[0.2em]">Total Worldwide</td>
                                                    <td className="px-8 py-6 text-right text-2xl font-black italic text-yellow-400">
                                                        {movie.performance?.worldwide ? `₹${movie.performance.worldwide} Cr` : '-'}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Movie Review' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-1.5 bg-yellow-500 rounded-full"></div>
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                                            Movie <span className="text-yellow-500">Reviews</span>
                                        </h2>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const formElement = document.getElementById('review-form-section');
                                            if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg"
                                    >
                                        {movie.myReview ? 'Edit Your Review' : 'Write a Review'}
                                    </button>
                                </div>

                                <div id="review-form-section" className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <div className="shrink-0 space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Rating</p>
                                            <div className="flex gap-2 text-2xl">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button 
                                                        key={star}
                                                        onClick={() => setTempRating(star)}
                                                        className="hover:scale-125 transition-transform"
                                                    >
                                                        <i className={`fas fa-star ${star <= tempRating ? 'text-yellow-500' : 'text-slate-200'}`}></i>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full space-y-4">
                                            <textarea 
                                                placeholder="What did you think of this movie?"
                                                className="w-full p-5 border rounded-2xl text-sm outline-none focus:ring-4 focus:ring-yellow-400/20 resize-none h-32 font-medium"
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                            />
                                            <div className="flex justify-end">
                                                <button 
                                                    onClick={async () => {
                                                        if (!user) {
                                                            if (window.confirm('Login First to post a review! Would you like to sign in now?')) {
                                                                setShowAuthModal(true);
                                                            }
                                                            return;
                                                        }
                                                        if (tempRating === 0) return alert('Please select a rating!');
                                                        setIsSubmitting(true);
                                                        await rateMovie(movie._id, tempRating, reviewText);
                                                        setIsSubmitting(false);
                                                    }}
                                                    disabled={isSubmitting}
                                                    className="px-8 py-3 bg-yellow-400 text-slate-900 font-black uppercase text-[11px] tracking-[0.2em] rounded-xl hover:bg-yellow-500 transition shadow-xl shadow-yellow-400/20 disabled:opacity-50"
                                                >
                                                    {isSubmitting ? 'Processing...' : (movie.myRating ? 'Update Feedback' : 'Post My Review')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {movie.userRatings?.filter(r => r.review)?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                        {movie.userRatings
                                            .filter(r => r.review)
                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                            .map((r, idx) => (
                                            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                                    <i className="fas fa-quote-right text-6xl"></i>
                                                </div>
                                                <div className="relative z-10 space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black italic border-4 border-white shadow-md overflow-hidden">
                                                                {r.user?.username?.charAt(0).toUpperCase() || 'A'}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">{r.user?.fullName || r.user?.username || 'Anonymous'}</p>
                                                                <div className="flex gap-1 mt-1">
                                                                    {[1,2,3,4,5].map(star => (
                                                                        <i key={star} className={`fas fa-star text-[8px] ${star <= r.rating ? 'text-yellow-500' : 'text-slate-200'}`}></i>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            {(user && user.username === r.user?.username) && (
                                                                <button 
                                                                    onClick={async () => {
                                                                        if (window.confirm("Are you sure you want to delete your review?")) {
                                                                            await deleteMovieRating(movie._id);
                                                                            setReviewText('');
                                                                            setTempRating(0);
                                                                        }
                                                                    }}
                                                                    className="text-red-500 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                                                                    title="Delete Review"
                                                                >
                                                                    <i className="fas fa-trash-alt text-[10px]"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-base font-medium text-slate-600 leading-relaxed italic">
                                                        "{r.review}"
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                            <i className="fas fa-comment-slash text-slate-300 text-3xl"></i>
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic text-slate-400">No Reviews Yet</h3>
                                        <p className="text-slate-400 text-sm mt-2">Be the first to share your thoughts on this movie!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Photos' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-10 w-1.5 bg-primary-red rounded-full"></div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                                        Official Movie <span className="text-primary-red">Gallery</span>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {galleryImages.map((img, idx) => (
                                        <div 
                                            key={`gallery-full-${idx}`} 
                                            className="rounded-2xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-2xl transition-all group cursor-zoom-in relative border-4 border-white"
                                            onClick={() => setSelectedImage(img)}
                                        >
                                            <img src={img.src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                                    <i className="fas fa-search-plus text-xl"></i>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">{img.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Articles' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-10 w-1.5 bg-primary-red rounded-full"></div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                                        Related <span className="text-primary-red">Articles</span>
                                    </h2>
                                </div>
                                
                                {movieArticles.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                                        {movieArticles.map((article) => (
                                            <Link 
                                                key={article._id} 
                                                to={`/latest-news/${article.slug || article._id}`}
                                                className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col h-full no-underline"
                                            >
                                                <div className="aspect-video overflow-hidden relative">
                                                    <img src={article.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                                    <div className="absolute top-4 left-4">
                                                        <span className="bg-primary-red text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                                            {article.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-8 flex flex-col flex-1 justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(article.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{article.author || 'Editor Team'}</span>
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-red transition-colors leading-tight line-clamp-2">
                                                            {article.title}
                                                        </h3>
                                                        <p className="mt-4 text-sm text-slate-500 line-clamp-3 font-medium leading-relaxed">
                                                            {article.excerpt}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-red group-hover:gap-4 transition-all">
                                                        Read Full Article <i className="fas fa-arrow-right"></i>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                            <i className="fas fa-newspaper text-slate-200 text-3xl"></i>
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic text-slate-400">No Articles Yet</h3>
                                        <p className="text-slate-400 text-sm mt-2">Check back later for interviews, news, and exclusive updates about {movie.title}.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <aside className="lg:w-[35%] xl:w-[35%] relative">
                        <div className="sticky top-[140px] h-[calc(100vh-160px)] overflow-y-auto no-scrollbar pb-6 space-y-8 pr-2">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b flex items-center gap-2 italic">
                                    <span className="w-2.5 h-2.5 bg-primary-red rounded-full"></span> Suggested For You
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {suggestedMovies.map(m => {
                                        const isReleased = m.releaseDate && new Date(m.releaseDate) <= new Date();
                                        return (
                                            <Link key={m._id} to={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${m.slug || m._id}`} className="group flex flex-col gap-2 no-underline">
                                                <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-md border-2 border-white group-hover:border-primary-red transition-all duration-300 relative">
                                                    <img src={m.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                    <div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[8px] font-black text-white uppercase block text-center truncate">{m.title}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                                <Link to="/latest-movies" className="block w-full text-center mt-8 py-3 rounded-xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">View All Movies</Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>

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

        {/* Full Screen Trailer Modal */}
        {showFullPlayer && (movie.watchNowUrl || movie.trailerUrl || movie.trailerVideo) && (
            <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                {/* Background Click to Close */}
                <div className="absolute inset-0 z-0" onClick={() => setShowFullPlayer(false)}></div>
                
                <div className="w-full max-w-5xl aspect-video relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-4 border-white/10 bg-black rounded-[2rem] overflow-hidden flex flex-col">
                    {/* Player Header */}
                    <div className="bg-slate-900 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <i className="fab fa-youtube text-primary-red text-xl"></i>
                            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest italic">{movie.title} - Official Trailer</span>
                        </div>
                        <button 
                            onClick={() => setShowFullPlayer(false)}
                            className="text-white/40 hover:text-primary-red transition-colors text-sm uppercase font-black tracking-widest flex items-center gap-2"
                        >
                            <span>Close</span>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="flex-1 w-full bg-black">
                        {(() => {
                            const url = (!movie.isWatchNowRedirect && movie.watchNowUrl) ? movie.watchNowUrl : (movie.trailerVideo?.videoUrl || movie.trailerUrl);
                            if (url?.includes('youtube.com') || url?.includes('youtu.be')) {
                                const vid = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
                                return (
                                    <iframe 
                                        src={`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`} 
                                        className="w-full h-full" 
                                        allowFullScreen 
                                        allow="autoplay; encrypted-media"
                                    ></iframe>
                                );
                            }
                            return (
                                <video 
                                    src={url} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full object-contain"
                                ></video>
                            );
                        })()}
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default MovieDetailLayout;
