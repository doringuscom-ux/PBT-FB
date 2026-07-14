import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { slugify } from '../utils/slugify';

const INDUSTRIES = ["Bollywood", "Hollywood", "Tollywood", "Kollywood", "Mollywood", "Sandalwood", "South Indian", "Haryanvi", "Bhojpuri", "Pollywood"];

const ManageUpcoming = () => {
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
    title: '', image: '', rating: '', genre: '', year: new Date().getFullYear().toString(), 
    overview: '', director: '', runtime: '', certification: '', 
    performance: { day1: '', weekend: '', status: 'Upcoming' }, industry: 'Bollywood',
    fullStory: '', trailerUrl: '', likes: 0, releaseDate: '', isReleaseDateConfirmed: true, estimatedRelease: '', cast: [], slug: '', photos: [], coverImage: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('Info'); // 'Info', 'Content', 'Media', 'Cast'
  const [imageSource, setImageSource] = useState('url'); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const selectedMovie = movies.find(m => m._id === selectedMovieId);

  const upcomingMovies = movies.filter(m => {
    const today = new Date();
    // A movie is NOT upcoming if it's already released
    const isConfirmedPast = m.isReleaseDateConfirmed && m.releaseDate && new Date(m.releaseDate) <= today;
    const isExplicitlyReleased = m.performance?.status === 'Released' || m.performance?.status === 'Blockbuster' || m.performance?.status === 'Hit';
    
    if (isConfirmedPast || isExplicitlyReleased) return false;
    
    // Otherwise, check if it's marked as Upcoming OR has a future date OR is unconfirmed (TBA)
    return m.performance?.status === 'Upcoming' || 
           m.isReleaseDateConfirmed === false || 
           (m.releaseDate && new Date(m.releaseDate) > today);
  });

  const filteredMovies = upcomingMovies
    .filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      }
      if (sortBy === 'oldest') {
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        return new Date(a.releaseDate) - new Date(b.releaseDate);
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    const fieldsToExclude = ['comments', 'createdBy', '_id', 'createdAt', 'updatedAt', '__v', 'userRatings', 'averageRating', 'totalRatings'];

    Object.keys(formData).forEach(key => {
        if (!fieldsToExclude.includes(key)) {
            if (key === 'performance' || key === 'cast' || key === 'photos') {
                data.append(key, JSON.stringify(formData[key]));
            } else if (key !== 'image' || imageSource === 'url') {
                data.append(key, formData[key]);
            }
        }
    });

    if (imageSource === 'file' && selectedFile) {
        data.append('image', selectedFile);
    }

    if (editingIndex !== null) {
      await updateMovie(upcomingMovies[editingIndex]._id, data);
    } else {
      await addMovie(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      title: '', image: '', rating: '', genre: '', year: new Date().getFullYear().toString(), 
      overview: '', director: '', runtime: '', certification: '', 
      performance: { day1: '', weekend: '', status: 'Upcoming' }, industry: 'Bollywood',
      fullStory: '', trailerUrl: '', likes: 0, releaseDate: '', isReleaseDateConfirmed: true, estimatedRelease: '', cast: [], slug: '', photos: []
    });
    setSelectedFile(null);
    setImageSource('url');
    setShowForm(false);
    setEditingIndex(null);
    setActiveFormTab('Info');
  };

  const handleEdit = (id) => {
    const movie = movies.find(m => m._id === id);
    const upIdx = upcomingMovies.findIndex(m => m._id === id);
    setEditingIndex(upIdx);
    setFormData({
      ...movie,
      performance: movie.performance || { day1: '', weekend: '', status: 'Upcoming' },
      cast: movie.cast || [],
      photos: Array.isArray(movie.photos) ? movie.photos : (typeof movie.photos === 'string' ? JSON.parse(movie.photos) : []),
      coverImage: movie.coverImage || ''
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
                <Link to="/admin/movies" className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Released</Link>
                <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white text-primary-red shadow-sm">Upcoming</button>
            </div>
            <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                <i className="fas fa-calendar-alt text-primary-red"></i> Upcoming Calendar
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage future movie releases</p>
          </div>
          <div className="flex flex-wrap w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Search upcoming..." 
                className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setShowForm(true); setEditingIndex(null); }}
              className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary-red transition-all flex items-center gap-2 shadow-lg shadow-primary-red/20"
            >
              <i className="fas fa-plus"></i> <span className="text-xs uppercase tracking-widest">Post Upcoming</span>
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingIndex !== null ? 'Update Upcoming Movie' : 'Schedule New Movie'}
      >
        <div className="flex border-b mb-6 overflow-x-auto no-scrollbar">
            {['Info', 'Content', 'Media', 'Cast'].map(tab => (
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
                        placeholder="carry-on-jatta-3" className="p-3 border rounded-xl bg-yellow-50 focus:ring-2 focus:ring-primary-red/20 outline-none font-bold italic"
                        value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Genre</label>
                    <input 
                        placeholder="Action, Comedy, Drama" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none" required
                        value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Year</label>
                        <input 
                            placeholder="2025" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none" required type="number"
                            value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Expected Rating</label>
                        <input 
                            placeholder="8.5" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none" type="number" step="0.1"
                            value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Industry</label>
                    <select 
                        className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none font-bold text-sm"
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
                        <input 
                            placeholder="Enter industry..." className="p-2 border rounded-lg mt-1 text-sm outline-none px-3"
                            value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                        />
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Director</label>
                    <input 
                        placeholder="Director Name" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none"
                        value={formData.director} onChange={e => setFormData({...formData, director: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Runtime</label>
                    <input 
                        placeholder="2h 30m" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none"
                        value={formData.runtime} onChange={e => setFormData({...formData, runtime: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Certification</label>
                    <input 
                        placeholder="U/A, A" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none"
                        value={formData.certification} onChange={e => setFormData({...formData, certification: e.target.value})}
                    />
                </div>
            </div>
          )}

          {activeFormTab === 'Content' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-primary-red/5 p-6 rounded-2xl border border-primary-red/10">
                    <h4 className="text-[10px] font-black uppercase text-primary-red mb-4 tracking-widest flex items-center gap-2">
                        <i className="fas fa-clock"></i> Release Schedule
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 bg-slate-900 rounded-xl p-4 flex items-center justify-between mb-2">
                          <label className="text-[10px] font-black text-white uppercase tracking-widest">Release Date Confirmed?</label>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, isReleaseDateConfirmed: !formData.isReleaseDateConfirmed})}
                            className={`w-12 h-6 rounded-full transition-all relative ${formData.isReleaseDateConfirmed ? 'bg-green-500' : 'bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isReleaseDateConfirmed ? 'right-1' : 'left-1'}`}></div>
                          </button>
                        </div>

                        {formData.isReleaseDateConfirmed ? (
                          <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-primary-red/60 uppercase ml-1">Release Date</label>
                              <input 
                                  type="date" required
                                  className="p-3 border border-primary-red/20 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary-red/20"
                                  value={formData.releaseDate ? new Date(formData.releaseDate).toISOString().split('T')[0] : ''} 
                                  onChange={e => setFormData({...formData, releaseDate: e.target.value})}
                              />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-primary-red/60 uppercase ml-1">Estimated Release (e.g. Mid 2026)</label>
                              <input 
                                  placeholder="Late 2026, Diwali 2027..."
                                  className="p-3 border border-primary-red/20 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary-red/20"
                                  value={formData.estimatedRelease || ''} 
                                  onChange={e => setFormData({...formData, estimatedRelease: e.target.value})}
                              />
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-primary-red/60 uppercase ml-1">Calendar Status</label>
                            <input 
                                placeholder="Coming Soon, Post Production..." className="p-3 border border-primary-red/20 rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary-red/20"
                                value={formData.performance?.status} onChange={e => setFormData({...formData, performance: {...formData.performance, status: e.target.value}})}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Synopsis (Short Overview)</label>
                    <textarea 
                        className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none min-h-[100px]"
                        value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Full Story / Highlights</label>
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
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Main Banner Movie Poster (2:3 aspect)</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setImageSource('url')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${imageSource === 'url' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-500'}`}>URL</button>
                        <button type="button" onClick={() => setImageSource('file')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${imageSource === 'file' ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-500'}`}>Upload</button>
                    </div>
                    {imageSource === 'url' ? (
                        <input placeholder="Poster URL" className="p-3 border rounded-xl w-full" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                    ) : (
                        <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="w-full text-xs font-bold" />
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hero Cover Image (16:9 aspect)</label>
                    <input 
                        placeholder="Cover Image URL (Shows as background)" 
                        className="p-3 border rounded-xl outline-none" 
                        value={formData.coverImage} 
                        onChange={e => setFormData({...formData, coverImage: e.target.value})} 
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Official Trailer (YouTube URL)</label>
                    <input placeholder="https://youtube.com/..." className="p-3 border rounded-xl outline-none" value={formData.trailerUrl} onChange={e => setFormData({...formData, trailerUrl: e.target.value})} />
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Additional Photos Grid</h4>
                        <button type="button" onClick={() => setFormData({...formData, photos: [...formData.photos, '']})} className="bg-slate-800 text-white p-2 rounded-lg text-xs hover:bg-black transition-colors">
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.photos?.map((photo, pIdx) => (
                            <div key={pIdx} className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                                <input 
                                    placeholder="Photo URL" className="flex-1 p-2 border rounded-lg text-xs" 
                                    value={photo} 
                                    onChange={e => {
                                        const newPhotos = [...formData.photos];
                                        newPhotos[pIdx] = e.target.value;
                                        setFormData({...formData, photos: newPhotos});
                                    }}
                                />
                                <button type="button" onClick={() => setFormData({...formData, photos: formData.photos.filter((_, i) => i !== pIdx)})} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><i className="fas fa-trash"></i></button>
                            </div>
                        ))}
                    </div>
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
            <button type="submit" className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-green-700 transition-all">
                {editingIndex !== null ? 'Sync Update' : 'Schedule Release'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-500 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Table Section */}
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
                        <button onClick={() => handleEdit(movie._id)} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"><i className="fas fa-edit text-xs"></i></button>
                        <button onClick={() => deleteMovie(movie._id)} className="w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all"><i className="fas fa-trash text-xs"></i></button>
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

export default ManageUpcoming;
