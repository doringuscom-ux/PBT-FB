import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { slugify } from '../utils/slugify';

const INDUSTRIES = ["Bollywood", "Hollywood", "Tollywood", "Kollywood", "Mollywood", "Sandalwood", "South Indian", "Haryanvi", "Bhojpuri", "Pollywood"];

const ManageMovies = () => {
  const { user, movies, celebs, addMovie, updateMovie, deleteMovie, deleteMovieComment, updateMovieComment } = useData();

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  };

  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', image: '', coverImage: '', rating: '', genre: '', year: new Date().getFullYear().toString(), 
    overview: '', director: '', runtime: '', certification: '', 
    performance: { 
        budget: '', day1: '', weekend: '', week1: '', indiaNet: '', indiaGross: '', overseas: '', worldwide: '', verdict: '', screens: '', status: 'Released' 
    }, industry: 'Bollywood',
    fullStory: '', trailerUrl: '', trailerVideo: null, likes: 0, releaseDate: new Date().toISOString().split('T')[0], cast: [], slug: '', photos: [], youtubeLinks: [], watchNowUrl: '', isWatchNowRedirect: false
  });

  const [showForm, setShowForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('Info'); 
  const [imageSource, setImageSource] = useState('url'); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [trailerSource, setTrailerSource] = useState('url');
  const [trailerFile, setTrailerFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const selectedMovie = movies.find(m => m._id === selectedMovieId);
  
  // New state for trailer selection
  const { videos } = useData();
  const [trailerSearchTerm, setTrailerSearchTerm] = useState('');
  const [showTrailerDropdown, setShowTrailerDropdown] = useState(false);

  // Released movies only (confirmed past dates or explicit released status)
  const releasedMovies = movies.filter(m => {
    const today = new Date();
    const isConfirmedPast = m.isReleaseDateConfirmed && m.releaseDate && new Date(m.releaseDate) <= today;
    const isExplicitlyReleased = m.performance?.status === 'Released' || m.performance?.status === 'Blockbuster' || m.performance?.status === 'Hit';
    return isConfirmedPast || isExplicitlyReleased;
  });

  const filteredMovies = releasedMovies
    .filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const fieldsToExclude = ['comments', 'createdBy', '_id', 'createdAt', 'updatedAt', '__v', 'userRatings', 'averageRating', 'totalRatings'];

    Object.keys(formData).forEach(key => {
        if (!fieldsToExclude.includes(key)) {
            if (key === 'performance' || key === 'cast' || key === 'photos' || key === 'youtubeLinks') {
                data.append(key, JSON.stringify(formData[key]));
            } else if (key === 'image') {
                if (imageSource === 'url') data.append('image', formData[key]);
            } else if (key === 'trailerUrl') {
                if (trailerSource === 'url' || trailerSource === 'link') {
                    data.append('trailerUrl', formData[key]);
                }
            } else {
                data.append(key, formData[key]);
            }
        }
    });

    if (imageSource === 'file' && selectedFile) {
        data.append('image', selectedFile);
    }
    if (trailerSource === 'file' && trailerFile) {
        data.append('trailer', trailerFile);
    }

    if (editingIndex !== null) {
      await updateMovie(releasedMovies[editingIndex]._id, data);
    } else {
      await addMovie(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      title: '', image: '', coverImage: '', rating: '', genre: '', year: new Date().getFullYear().toString(), 
      overview: '', director: '', runtime: '', certification: '', 
      performance: { budget: '', day1: '', weekend: '', week1: '', indiaNet: '', indiaGross: '', overseas: '', worldwide: '', verdict: '', screens: '', status: 'Released' }, industry: 'Bollywood',
      fullStory: '', trailerUrl: '', trailerVideo: null, likes: 0, releaseDate: new Date().toISOString().split('T')[0], cast: [], slug: '', photos: [], youtubeLinks: [], watchNowUrl: '', isWatchNowRedirect: false
    });
    setSelectedFile(null);
    setImageSource('url');
    setTrailerFile(null);
    setTrailerSource('url');
    setShowForm(false);
    setEditingIndex(null);
    setActiveFormTab('Info');
  };

  const handleEdit = (id) => {
    const movie = movies.find(m => m._id === id);
    const relIdx = releasedMovies.findIndex(m => m._id === id);
    setEditingIndex(relIdx);
    setFormData({
      ...movie,
      performance: movie.performance || { budget: '', day1: '', weekend: '', week1: '', indiaNet: '', indiaGross: '', overseas: '', worldwide: '', verdict: '', screens: '', status: 'Released' },
      cast: movie.cast || [],
      photos: Array.isArray(movie.photos) ? movie.photos : (typeof movie.photos === 'string' ? JSON.parse(movie.photos) : []),
      coverImage: movie.coverImage || '',
      trailerVideo: movie.trailerVideo?._id || movie.trailerVideo || null,
      watchNowUrl: movie.watchNowUrl || '',
      isWatchNowRedirect: movie.isWatchNowRedirect || false,
      youtubeLinks: Array.isArray(movie.youtubeLinks) ? movie.youtubeLinks : []
    });
    setIsCustomIndustry(movie.industry && !INDUSTRIES.includes(movie.industry));
    setShowForm(true);
    setActiveFormTab('Info');
  };

  const [castCelebSearch, setCastCelebSearch] = useState('');
  const [activeCelebSearchIdx, setActiveCelebSearchIdx] = useState(null);

  return (
    <div className="space-y-6 relative">
      <div className="sticky top-0 z-30 bg-gray-100/80 backdrop-blur-md pb-4 pt-2 -mt-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-2">
                <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white text-primary-red shadow-sm">Released</button>
                <Link to="/admin/upcoming" className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Upcoming</Link>
            </div>
            <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                <i className="fas fa-video text-primary-red"></i> Released Movies
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage film library</p>
          </div>
          <div className="flex flex-wrap w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Search movies..." 
                className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setShowForm(true); setEditingIndex(null); }}
              className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary-red transition-all flex items-center gap-2 shadow-lg shadow-primary-red/20"
            >
              <i className="fas fa-plus"></i> <span className="text-xs uppercase tracking-widest">Post Movie</span>
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingIndex !== null ? 'Update Movie Data' : 'Post New Movie'}
      >
        <div className="flex border-b mb-6 overflow-x-auto no-scrollbar">
            {['Info', 'Story', 'Media', 'Stats', 'Cast'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveFormTab(tab)}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeFormTab === tab ? 'border-b-2 border-primary-red text-primary-red' : 'text-gray-400 hover:text-slate-600'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeFormTab === 'Info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Title</label>
                    <input 
                        placeholder="Movie Title" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none font-bold" required
                        value={formData.title} 
                        onChange={e => {
                            const newTitle = e.target.value;
                            const newSlug = formData.industry ? `${slugify(formData.industry)}/${slugify(newTitle)}` : slugify(newTitle);
                            const currentTitleSlug = formData.industry ? `${slugify(formData.industry)}/${slugify(formData.title)}` : slugify(formData.title);
                            if (!formData.slug || formData.slug === currentTitleSlug) {
                                setFormData({...formData, title: newTitle, slug: newSlug});
                            } else {
                                setFormData({...formData, title: newTitle});
                            }
                        }}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">URL Slug</label>
                    <input 
                        placeholder="slug-name-here" className="p-3 border rounded-xl bg-yellow-50 focus:ring-2 focus:ring-primary-red/20 outline-none font-bold italic"
                        value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                    />
                </div>
                <input 
                    placeholder="Genre" className="p-3 border rounded-xl outline-none" required
                    value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                    <input 
                        placeholder="Year" className="p-3 border rounded-xl outline-none" required type="number"
                        value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}
                    />
                    <input 
                        placeholder="Rating" className="p-3 border rounded-xl outline-none" type="number" step="0.1" required
                        value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}
                    />
                </div>
                <select 
                    className="p-3 border rounded-xl outline-none font-bold text-sm"
                    value={isCustomIndustry ? 'Custom' : formData.industry} 
                    onChange={e => {
                        const newInd = e.target.value;
                        if (newInd === 'Custom') { 
                            setIsCustomIndustry(true); 
                            setFormData({...formData, industry: ''}); 
                        } else { 
                            setIsCustomIndustry(false); 
                            const newSlug = `${slugify(newInd)}/${slugify(formData.title)}`;
                            const currentSlug = formData.industry ? `${slugify(formData.industry)}/${slugify(formData.title)}` : slugify(formData.title);
                            
                            if (!formData.slug || formData.slug === currentSlug) {
                                setFormData({...formData, industry: newInd, slug: newSlug}); 
                            } else {
                                setFormData({...formData, industry: newInd}); 
                            }
                        }
                    }}
                >
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    <option value="Custom">Custom...</option>
                </select>
                {isCustomIndustry && (
                    <input placeholder="Enter industry..." className="p-2 border rounded-lg mt-1 outline-none px-3" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
                )}
                <input placeholder="Director" className="p-3 border rounded-xl" value={formData.director} onChange={e => setFormData({...formData, director: e.target.value})} />
                <input placeholder="Runtime" className="p-3 border rounded-xl" value={formData.runtime} onChange={e => setFormData({...formData, runtime: e.target.value})} />
                <input placeholder="Certification" className="p-3 border rounded-xl" value={formData.certification} onChange={e => setFormData({...formData, certification: e.target.value})} />
            </div>
          )}

          {activeFormTab === 'Story' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <textarea 
                    placeholder="Synopsis" className="p-3 border rounded-xl w-full min-h-[100px] outline-none"
                    value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})}
                />
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Full Article / Highlights</label>
                    <ReactQuill 
                        theme="snow"
                        value={formData.fullStory}
                        onChange={val => setFormData({...formData, fullStory: val})}
                        modules={quillModules}
                        className="bg-white rounded-xl border overflow-hidden"
                    />
                </div>
            </div>
          )}

          {activeFormTab === 'Media' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Movie Poster (2:3)</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setImageSource('url')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${imageSource === 'url' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-500'}`}>URL</button>
                        <button type="button" onClick={() => setImageSource('file')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${imageSource === 'file' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-500'}`}>Upload</button>
                    </div>
                    {imageSource === 'url' ? (
                        <input placeholder="Poster URL" className="p-3 border rounded-xl w-full" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                    ) : (
                        <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="w-full text-xs" />
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Cover Image (16:9)</label>
                    <input placeholder="Cover Image URL" className="p-3 border rounded-xl" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} />
                </div>
                
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1 italic tracking-widest">Trailer / Promotional Video</label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                        <button type="button" onClick={() => setTrailerSource('url')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trailerSource === 'url' ? 'bg-white text-primary-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>URL</button>
                        <button type="button" onClick={() => setTrailerSource('link')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trailerSource === 'link' ? 'bg-white text-primary-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Link Vault</button>
                        <button type="button" onClick={() => setTrailerSource('file')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trailerSource === 'file' ? 'bg-white text-primary-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Upload</button>
                    </div>
                    
                    {trailerSource === 'link' && (
                        <div className="relative animate-in zoom-in-95 duration-200">
                             <div className="relative group/search">
                                <input 
                                    type="text"
                                    className={`w-full p-4 border rounded-2xl text-xs font-bold outline-none transition-all pr-12 
                                        ${showTrailerDropdown ? 'ring-2 ring-primary-red/20 border-primary-red shadow-xl' : 'bg-slate-50 border-gray-200'}`}
                                    placeholder="Search trailer vault..."
                                    value={showTrailerDropdown ? trailerSearchTerm : (videos.find(v => v._id === formData.trailerVideo)?.title || 'No video linked')}
                                    onFocus={() => { setShowTrailerDropdown(true); setTrailerSearchTerm(''); }}
                                    onChange={e => setTrailerSearchTerm(e.target.value)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {formData.trailerVideo && !showTrailerDropdown && <i className="fas fa-link text-primary-red animate-pulse"></i>}
                                    <i className="fas fa-chevron-down text-slate-300 text-[10px]"></i>
                                </div>

                                {showTrailerDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowTrailerDropdown(false)}></div>
                                        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] max-h-72 overflow-y-auto animate-in slide-in-from-top-4 duration-300 custom-scrollbar p-2">
                                            <div className="p-3 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-dashed mb-1">Select from Trailer Vault</div>
                                            {videos
                                                .filter(v => v.title.toLowerCase().includes(trailerSearchTerm.toLowerCase()))
                                                .map(v => (
                                                    <button 
                                                        key={v._id}
                                                        type="button"
                                                        className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-4 rounded-2xl transition-all group/v"
                                                        onClick={() => {
                                                            setFormData({ ...formData, trailerVideo: v._id, trailerUrl: v.videoUrl });
                                                            setShowTrailerDropdown(false);
                                                        }}
                                                    >
                                                        <div className="w-16 aspect-video rounded-lg overflow-hidden border shadow-sm group-hover/v:border-primary-red transition-colors shrink-0">
                                                            <img src={v.image} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-black text-slate-900 truncate group-hover/v:text-primary-red">{v.title}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{v.industry} • {v.category}</p>
                                                        </div>
                                                        <i className="fas fa-plus-circle text-slate-200 group-hover/v:text-primary-red transition-colors"></i>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </>
                                )}
                             </div>
                        </div>
                    )}

                    {trailerSource === 'url' && (
                        <input placeholder="Trailer/YouTube URL" className="p-3 border rounded-xl w-full font-bold text-sm bg-slate-50" value={formData.trailerUrl} onChange={e => setFormData({...formData, trailerUrl: e.target.value})} />
                    )}
                    {trailerSource === 'file' && (
                        <input type="file" accept="video/*" onChange={e => setTrailerFile(e.target.files[0])} className="w-full text-xs p-2 border rounded-xl bg-slate-50" />
                    )}
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-4">Watch Now Button Action</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Action URL</label>
                            <input 
                                placeholder="https://youtube.com/... or https://other-site.com" 
                                className="p-3 border rounded-xl" 
                                value={formData.watchNowUrl} 
                                onChange={e => setFormData({...formData, watchNowUrl: e.target.value})} 
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Action Type</label>
                            <select 
                                className="p-3 border rounded-xl"
                                value={formData.isWatchNowRedirect ? "redirect" : "youtube"}
                                onChange={e => setFormData({...formData, isWatchNowRedirect: e.target.value === "redirect"})}
                            >
                                <option value="youtube">Play in Trailer Popup</option>
                                <option value="redirect">Redirect to Link</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-2 font-medium">Leave URL blank to default to Trailer Video if available.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2">
                            <i className="fab fa-youtube text-red-600"></i> YouTube Ribbon Links
                        </label>
                        <button type="button" onClick={() => setFormData({...formData, youtubeLinks: [...formData.youtubeLinks, { title: '', url: '' }]})} className="bg-red-600 text-white p-2 rounded-lg text-xs"><i className="fas fa-plus"></i></button>
                    </div>
                    <div className="space-y-3">
                        {formData.youtubeLinks?.map((link, lIdx) => (
                            <div key={lIdx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-dashed relative group">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <input placeholder="Video Title (e.g. Teaser 1)" className="p-2 border rounded-lg text-[10px] font-bold" value={link.title} onChange={e => { const nL = [...formData.youtubeLinks]; nL[lIdx].title = e.target.value; setFormData({...formData, youtubeLinks: nL}); }} />
                                    <input placeholder="YouTube URL" className="p-2 border rounded-lg text-[10px]" value={link.url} onChange={e => { const nL = [...formData.youtubeLinks]; nL[lIdx].url = e.target.value; setFormData({...formData, youtubeLinks: nL}); }} />
                                </div>
                                <button type="button" onClick={() => setFormData({...formData, youtubeLinks: formData.youtubeLinks.filter((_, i) => i !== lIdx)})} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center shadow-md"><i className="fas fa-times"></i></button>
                            </div>
                        ))}
                        {formData.youtubeLinks?.length === 0 && (
                            <p className="text-center py-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest italic">No ribbon links added</p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase text-gray-400">Photos Gallery</label>
                        <button type="button" onClick={() => setFormData({...formData, photos: [...formData.photos, '']})} className="bg-slate-800 text-white p-2 rounded-lg text-xs"><i className="fas fa-plus"></i></button>
                    </div>
                    <div className="space-y-3">
                        {formData.photos?.map((photo, pIdx) => (
                            <div key={pIdx} className="flex gap-2">
                                <input placeholder="Photo URL" className="flex-1 p-2 border rounded-lg text-xs" value={photo} onChange={e => { const nP = [...formData.photos]; nP[pIdx] = e.target.value; setFormData({...formData, photos: nP}); }} />
                                <button type="button" onClick={() => setFormData({...formData, photos: formData.photos.filter((_, i) => i !== pIdx)})} className="text-red-500 p-2"><i className="fas fa-trash"></i></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {activeFormTab === 'Stats' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Budget (in Cr/Lakhs)</label>
                        <input type="number" placeholder="Budget" className="p-3 border rounded-xl outline-none" value={formData.performance?.budget} onChange={e => setFormData({...formData, performance: {...formData.performance, budget: e.target.value}})} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Day 1 Collection</label>
                        <input type="number" placeholder="Day 1" className="p-3 border rounded-xl" value={formData.performance?.day1} onChange={e => setFormData({...formData, performance: {...formData.performance, day1: e.target.value}})} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Opening Weekend</label>
                        <input type="number" placeholder="Weekend" className="p-3 border rounded-xl" value={formData.performance?.weekend} onChange={e => setFormData({...formData, performance: {...formData.performance, weekend: e.target.value}})} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">First Week</label>
                        <input type="number" placeholder="First Week" className="p-3 border rounded-xl" value={formData.performance?.week1} onChange={e => setFormData({...formData, performance: {...formData.performance, week1: e.target.value}})} />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">India Net</label>
                        <input type="number" placeholder="India Net" className="p-3 border rounded-xl" value={formData.performance?.indiaNet} onChange={e => setFormData({...formData, performance: {...formData.performance, indiaNet: e.target.value}})} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">India Gross</label>
                        <input type="number" placeholder="India Gross" className="p-3 border rounded-xl" value={formData.performance?.indiaGross} onChange={e => setFormData({...formData, performance: {...formData.performance, indiaGross: e.target.value}})} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Overseas</label>
                        <input type="number" placeholder="Overseas" className="p-3 border rounded-xl" value={formData.performance?.overseas} onChange={e => setFormData({...formData, performance: {...formData.performance, overseas: e.target.value}})} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1 flex justify-between">Worldwide <button type="button" onClick={() => {
                            const gross = parseFloat(formData.performance?.indiaGross || 0);
                            const overseas = parseFloat(formData.performance?.overseas || 0);
                            setFormData({...formData, performance: {...formData.performance, worldwide: (gross + overseas).toString()}});
                        }} className="text-primary-red hover:text-red-700">Auto Sum</button></label>
                        <input type="number" placeholder="Worldwide" className="p-3 border rounded-xl ring-2 ring-primary-red/10" value={formData.performance?.worldwide} onChange={e => setFormData({...formData, performance: {...formData.performance, worldwide: e.target.value}})} />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Movie Status</label>
                        <select className="p-3 border rounded-xl outline-none text-sm font-bold" value={formData.performance?.status} onChange={e => setFormData({...formData, performance: {...formData.performance, status: e.target.value}})}>
                            <option value="Released">Released</option>
                            <option value="Hit">Hit</option>
                            <option value="Flop">Flop</option>
                            <option value="Average">Average</option>
                            <option value="Blockbuster">Blockbuster</option>
                            <option value="Super Hit">Super Hit</option>
                            <option value="Disaster">Disaster</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Final Verdict</label>
                        <select className="p-3 border rounded-xl outline-none text-sm font-bold" value={formData.performance?.verdict} onChange={e => setFormData({...formData, performance: {...formData.performance, verdict: e.target.value}})}>
                            <option value="">Select Verdict</option>
                            <option value="Blockbuster">Blockbuster</option>
                            <option value="Super Hit">Super Hit</option>
                            <option value="Hit">Hit</option>
                            <option value="Average">Average</option>
                            <option value="Flop">Flop</option>
                            <option value="Disaster">Disaster</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Screens Count</label>
                        <input type="number" placeholder="Screens" className="p-3 border rounded-xl" value={formData.performance?.screens} onChange={e => setFormData({...formData, performance: {...formData.performance, screens: e.target.value}})} />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Release Date</label>
                    <input type="date" className="p-3 border rounded-xl" value={formData.releaseDate ? new Date(formData.releaseDate).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, releaseDate: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Initial Likes</label>
                    <input type="number" className="p-3 border rounded-xl font-bold" value={formData.likes} onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})} />
                </div>
            </div>
          )}

          {activeFormTab === 'Cast' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cast & Crew Members</h4>
                        <button type="button" onClick={() => setFormData({...formData, cast: [...formData.cast, { name: '', role: 'Actor', image: '' }]})} className="bg-primary-red text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-transform"><i className="fas fa-plus"></i></button>
                    </div>
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar border-t pt-4">
                        {formData.cast?.map((member, cIdx) => (
                            <div key={cIdx} className="bg-white p-4 rounded-xl border space-y-3 relative">
                                {/* Searchable Celebrity Selector */}
                                <div className="flex flex-col gap-1 relative">
                                    <label className="text-[9px] font-black uppercase text-slate-400">Search & Link Celebrity</label>
                                    <div className="relative group">
                                        <input 
                                            type="text"
                                            className={`w-full p-3 border rounded-xl text-xs font-bold outline-none transition-all pr-10 
                                                ${activeCelebSearchIdx === cIdx ? 'ring-2 ring-primary-red/20 border-primary-red shadow-lg' : 'bg-slate-50 border-gray-200'}`}
                                            placeholder="Type to search celebrities..."
                                            autoComplete="off"
                                            value={activeCelebSearchIdx === cIdx ? castCelebSearch : (member.name || '')}
                                            onFocus={() => { setActiveCelebSearchIdx(cIdx); setCastCelebSearch(''); }}
                                            onChange={e => setCastCelebSearch(e.target.value)}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                                            <i className={`fas ${member.celebrity ? 'fa-link text-primary-red' : 'fa-search'}`}></i>
                                        </div>

                                        {activeCelebSearchIdx === cIdx && (
                                            <>
                                                <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setActiveCelebSearchIdx(null)}></div>
                                                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                                                    <button 
                                                        type="button" 
                                                        className="w-full text-left p-3 hover:bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b border-dashed tracking-widest flex items-center gap-2"
                                                        onClick={() => {
                                                            const nC = [...formData.cast];
                                                            nC[cIdx].celebrity = null;
                                                            setFormData({...formData, cast: nC});
                                                            setActiveCelebSearchIdx(null);
                                                        }}
                                                    >
                                                        <i className="fas fa-times-circle"></i> Use Manual Entry Only
                                                    </button>
                                                    {celebs
                                                        .filter(c => c.name.toLowerCase().includes(castCelebSearch.toLowerCase()))
                                                        .sort((a,b) => a.name.localeCompare(b.name))
                                                        .map(c => (
                                                            <button 
                                                                key={c._id}
                                                                type="button"
                                                                className="w-full text-left p-2.5 hover:bg-primary-red/5 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-all group/opt"
                                                                onClick={() => {
                                                                    const nC = [...formData.cast];
                                                                    nC[cIdx] = { 
                                                                        ...nC[cIdx], 
                                                                        celebrity: c._id, 
                                                                        name: c.name, 
                                                                        image: c.image 
                                                                    };
                                                                    setFormData({...formData, cast: nC});
                                                                    setActiveCelebSearchIdx(null);
                                                                }}
                                                            >
                                                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                                                                    <img src={c.image} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[11px] font-black text-slate-900 leading-none mb-1 truncate group-hover/opt:text-primary-red">{c.name}</p>
                                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{c.role}</p>
                                                                </div>
                                                                <i className="fas fa-plus text-slate-200 text-[10px] mr-2 transition-colors group-hover/opt:text-primary-red"></i>
                                                            </button>
                                                        ))
                                                    }
                                                    {celebs.filter(c => c.name.toLowerCase().includes(castCelebSearch.toLowerCase())).length === 0 && (
                                                        <div className="p-8 text-center">
                                                            <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">No results found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[8px] font-black uppercase text-slate-300 ml-1">Display Name</label>
                                        <input placeholder="Name" className="p-2 border rounded-lg text-xs font-bold" value={member.name} onChange={e => { const nC = [...formData.cast]; nC[cIdx].name = e.target.value; setFormData({...formData, cast: nC}); }} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[8px] font-black uppercase text-slate-300 ml-1">Character Role</label>
                                        <input placeholder="Role" className="p-2 border rounded-lg text-xs" value={member.role} onChange={e => { const nC = [...formData.cast]; nC[cIdx].role = e.target.value; setFormData({...formData, cast: nC}); }} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="text-[8px] font-black uppercase text-slate-300 ml-1">Photo URL</label>
                                        <input placeholder="Photo URL" className="p-2 border rounded-lg text-xs" value={member.image} onChange={e => { const nC = [...formData.cast]; nC[cIdx].image = e.target.value; setFormData({...formData, cast: nC}); }} />
                                    </div>
                                    <button type="button" onClick={() => setFormData({...formData, cast: formData.cast.filter((_, i) => i !== cIdx)})} className="self-end text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t">
            <button type="submit" className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-green-700 transition-all">Submit Movie</button>
            <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-500 px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 transition-all">Cancel</button>
          </div>
        </form>
      </Modal>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Movie</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Author</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Date</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filteredMovies.map(movie => (
              <tr key={movie._id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <img src={movie.image} className="w-12 h-16 object-cover rounded-lg shadow-sm border" alt="" />
                    <div className="flex flex-col">
                        <span className="font-black text-slate-900 uppercase tracking-tighter leading-tight">{movie.title}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase italic">{movie.genre}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                    <div className="inline-block bg-primary-red text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm">
                        {movie.industry}
                    </div>
                </td>
                <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black text-primary-red uppercase leading-none">{movie.createdBy?.fullName || 'SYSTEM'}</span>
                        <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase">ID: {movie.createdBy?.employeeId || 'N/A'}</span>
                    </div>
                </td>
                <td className="p-4 text-center">
                    <span className="text-gray-500 font-bold uppercase text-[11px]">
                        {new Date(movie.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </td>
                <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(movie._id)} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-all"><i className="fas fa-edit text-xs"></i></button>
                        <button onClick={() => deleteMovie(movie._id)} className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center transition-all"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageMovies;
