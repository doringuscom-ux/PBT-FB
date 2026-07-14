import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { slugify } from '../utils/slugify';

const ManageCelebs = () => {
  const { user, celebs, addCeleb, updateCeleb, deleteCeleb, deleteCelebComment, updateCelebComment, autoGenerateCelebSEO } = useData();

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
    name: '', image: '', role: '', bio: '', 
    fullBio: '', 
    milestones: [{ year: '', text: '' }],
    stats: { fanBase: '', movieCount: '', nominations: '' },
    birthDate: '',
    birthPlace: '',
    photos: [''],
    videos: [''],
    industry: 'Bollywood',
    category: 'Actor',
    slug: '',
    bonusFollowers: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [imageSource, setImageSource] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [selectedCelebId, setSelectedCelebId] = useState(null);
  const selectedCeleb = celebs.find(c => c._id === selectedCelebId);

  const filteredCelebs = celebs.filter(celeb => 
    celeb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    celeb.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    celeb.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Manual validation to bypass native required issues when fields are in hidden tabs
    if (!formData.name || !formData.role || !formData.bio || (imageSource === 'url' && !formData.image) || (imageSource === 'file' && !selectedFile && !editingIndex)) {
        alert("Please fill in all required fields (Name, Role, Image, Short Bio Quote) across all tabs before saving.");
        return;
    }

    const data = new FormData();
    const fieldsToExclude = ['comments', 'createdBy', '_id', 'createdAt', 'updatedAt', '__v', 'followers'];

    Object.keys(formData).forEach(key => {
        if (!fieldsToExclude.includes(key)) {
            if (['milestones', 'stats', 'photos', 'videos'].includes(key)) {
                data.append(key, JSON.stringify(formData[key]));
            } else if (key !== 'image' || imageSource === 'url') {
                // Ensure slug is sent as a trimmed string
                const value = key === 'slug' && formData[key] ? formData[key].trim() : formData[key];
                data.append(key, value);
            }
        }
    });

    if (imageSource === 'file' && selectedFile) {
        data.append('image', selectedFile);
    }

    if (editingIndex !== null) {
      await updateCeleb(editingIndex, data);
    } else {
      await addCeleb(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
        name: '', image: '', role: '', bio: '', 
        fullBio: '', 
        milestones: [{ year: '', text: '' }],
        stats: { fanBase: '', movieCount: '', nominations: '' },
        birthDate: '',
        birthPlace: '',
        photos: [''],
        videos: [''],
        industry: 'Bollywood',
        category: 'Actor',
        slug: '',
        bonusFollowers: 0
    });
    setSelectedFile(null);
    setImageSource('url');
    setShowForm(false);
    setActiveTab('basic');
    setEditingIndex(null);
  };

  const handleEdit = (celeb) => {
    setEditingIndex(celeb._id);
    setFormData({
      ...celeb,
      milestones: celeb.milestones?.length ? celeb.milestones : [{ year: '', text: '' }],
      stats: celeb.stats || { fanBase: '', movieCount: '', nominations: '' },
      birthDate: celeb.birthDate || '',
      birthPlace: celeb.birthPlace || '',
      photos: celeb.photos?.length ? celeb.photos : [''],
      videos: celeb.videos?.length ? celeb.videos : [''],
      industry: celeb.industry || 'Bollywood',
      category: celeb.category || 'Actor',
      bonusFollowers: celeb.bonusFollowers || 0
    });
    setActiveTab('basic');
    setShowForm(true);
  };

  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const handleAutoSEO = async () => {
    if (!window.confirm("Are you sure you want to auto-generate SEO for ALL celebrities? This will overwrite existing Meta Titles and Descriptions for their profile pages.")) return;
    
    setIsSeoLoading(true);
    const res = await autoGenerateCelebSEO();
    setIsSeoLoading(false);
    
    if (res.success) {
      alert(res.message);
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="sticky top-0 z-30 bg-gray-100/80 backdrop-blur-md pb-4 pt-2 -mt-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-text-dark">Manage Celebrities</h2>
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Search by name or role..." 
                className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAutoSEO}
              disabled={isSeoLoading}
              className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-purple-500/20 text-xs border border-purple-400/30 ${isSeoLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <i className={`fas ${isSeoLoading ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i> 
              <span className="hidden sm:inline">{isSeoLoading ? 'Processing...' : 'Auto SEO'}</span>
            </button>
            <button 
              onClick={() => { 
                setShowForm(true); 
                setActiveTab('basic');
                setEditingIndex(null); 
                setFormData({ 
                  name: '', image: '', role: '', bio: '', 
                  fullBio: '', 
                  milestones: [{ year: '', text: '' }],
                  stats: { fanBase: '', movieCount: '', nominations: '' },
                  birthDate: '',
                  birthPlace: '',
                  photos: [''],
                  videos: [''],
                  industry: 'Business',
                  category: 'Entrepreneur',
                  slug: '',
                  bonusFollowers: 0
                }); 
              }}
              className="bg-slate-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-black/5 text-xs border border-blue-400/30"
            >
              <i className="fas fa-briefcase"></i> <span className="hidden sm:inline">Add Business Leader</span>
            </button>
            <button 
              onClick={() => { 
                setShowForm(true); 
                setActiveTab('basic');
                setEditingIndex(null); 
                setFormData({ 
                  name: '', image: '', role: '', bio: '', 
                  fullBio: '', 
                  milestones: [{ year: '', text: '' }],
                  stats: { fanBase: '', movieCount: '', nominations: '' },
                  birthDate: '',
                  birthPlace: '',
                  photos: [''],
                  videos: [''],
                  industry: 'Sports',
                  category: 'Athlete',
                  slug: '',
                  bonusFollowers: 0
                }); 
              }}
              className="bg-slate-900 text-yellow-400 px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-black/20 text-xs border border-yellow-400/30"
            >
              <i className="fas fa-running"></i> <span className="hidden sm:inline">Add Sports Star</span>
            </button>
            <button 
              onClick={() => { 
                setShowForm(true); 
                setActiveTab('basic');
                setEditingIndex(null); 
                setFormData({ 
                  name: '', image: '', role: '', bio: '', 
                  fullBio: '', 
                  milestones: [{ year: '', text: '' }],
                  stats: { fanBase: '', movieCount: '', nominations: '' },
                  birthDate: '',
                  birthPlace: '',
                  photos: [''],
                  videos: [''],
                  industry: 'Pollywood',
                  category: 'Actor',
                  slug: '',
                  bonusFollowers: 0
                }); 
              }}
              className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary-red transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-red/20 text-xs"
            >
              <i className="fas fa-plus"></i> <span className="hidden sm:inline">Add Cinema Star</span>
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingIndex !== null ? 'Edit Celebrity' : 'Add New Celebrity'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex border-b overflow-x-auto hide-scrollbar">
             <button type="button" onClick={() => setActiveTab('basic')} className={`px-4 py-3 whitespace-nowrap outline-none flex items-center gap-2 transition-all ${activeTab === 'basic' ? 'border-b-2 border-primary-red font-bold text-primary-red' : 'text-gray-500 hover:text-gray-800 font-medium'}`}><i className="fas fa-user-circle"></i> Basic Info</button>
             <button type="button" onClick={() => setActiveTab('bio')} className={`px-4 py-3 whitespace-nowrap outline-none flex items-center gap-2 transition-all ${activeTab === 'bio' ? 'border-b-2 border-primary-red font-bold text-primary-red' : 'text-gray-500 hover:text-gray-800 font-medium'}`}><i className="fas fa-id-card"></i> Biography</button>
             <button type="button" onClick={() => setActiveTab('media')} className={`px-4 py-3 whitespace-nowrap outline-none flex items-center gap-2 transition-all ${activeTab === 'media' ? 'border-b-2 border-primary-red font-bold text-primary-red' : 'text-gray-500 hover:text-gray-800 font-medium'}`}><i className="fas fa-photo-video"></i> Media Gallery</button>
             <button type="button" onClick={() => setActiveTab('stats')} className={`px-4 py-3 whitespace-nowrap outline-none flex items-center gap-2 transition-all ${activeTab === 'stats' ? 'border-b-2 border-primary-red font-bold text-primary-red' : 'text-gray-500 hover:text-gray-800 font-medium'}`}><i className="fas fa-chart-line"></i> Timeline & Stats</button>
          </div>

          <div className="p-2 min-h-[400px] max-h-[60vh] overflow-y-auto">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name <span className="text-red-500">*</span></label>
                  <input 
                    placeholder="Enter full name" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all" 
                    value={formData.name} 
                    onChange={e => {
                        const newName = e.target.value;
                        const newSlug = formData.industry ? `${slugify(formData.industry)}/${slugify(newName)}` : slugify(newName);
                        const currentNameSlug = formData.industry ? `${slugify(formData.industry)}/${slugify(formData.name)}` : slugify(formData.name);
                        if (!formData.slug || formData.slug === currentNameSlug) {
                            setFormData({...formData, name: newName, slug: newSlug});
                        } else {
                            setFormData({...formData, name: newName});
                        }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    {formData.industry === 'Sports' ? 'Position / Sport' : formData.industry === 'Business' ? 'Designation / Company' : 'Role'} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    placeholder={formData.industry === 'Sports' ? 'e.g. Cricketer, Kabaddi Player' : formData.industry === 'Business' ? 'e.g. CEO, Founder' : 'e.g. Singer, Actor'} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all" 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug</label>
                  <input 
                    placeholder="e.g. sidhu-moose-wala" className="w-full p-2.5 bg-yellow-50/50 border border-yellow-200 rounded-lg focus:bg-yellow-50 focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all font-mono text-sm"
                    value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">Leave blank to auto-generate from name.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Industry</label>
                  <input 
                    placeholder="e.g. Pollywood" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all"
                    value={formData.industry} 
                    onChange={e => {
                      const newInd = e.target.value;
                      const newSlug = newInd ? `${slugify(newInd)}/${slugify(formData.name)}` : slugify(formData.name);
                      const currentIndSlug = formData.industry ? `${slugify(formData.industry)}/${slugify(formData.name)}` : slugify(formData.name);
                      
                      if (!formData.slug || formData.slug === currentIndSlug) {
                          setFormData({...formData, industry: newInd, slug: newSlug});
                      } else {
                          setFormData({...formData, industry: newInd});
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <input 
                    placeholder="e.g. Actor" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Birth Date</label>
                  <input 
                    placeholder="e.g. Jan 06, 1984" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all"
                    value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Birth Place</label>
                  <input 
                    placeholder="e.g. Punjab, India" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all"
                    value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})}
                  />
                </div>
              </div>
            )}

            {activeTab === 'bio' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Main Card Image <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 mb-3">
                    <button 
                      type="button"
                      onClick={() => setImageSource('url')}
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${imageSource === 'url' ? 'bg-primary-red text-white shadow-md shadow-primary-red/20' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    >
                      Use Image URL
                    </button>
                    <button 
                      type="button"
                      onClick={() => setImageSource('file')}
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${imageSource === 'file' ? 'bg-primary-red text-white shadow-md shadow-primary-red/20' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    >
                      Upload File
                    </button>
                  </div>
                  
                  {imageSource === 'url' ? (
                    <input 
                      placeholder="Paste cover image URL..." className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all text-sm" 
                      value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                    />
                  ) : (
                    <div className="flex flex-col gap-2 p-5 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-primary-red/50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setSelectedFile(e.target.files[0])}
                        className="text-xs font-medium text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-primary-red hover:file:bg-red-100 file:cursor-pointer cursor-pointer"
                      />
                      {selectedFile && <div className="flex items-center gap-2 mt-1"><i className="fas fa-check-circle text-green-500"></i><span className="text-xs font-bold text-green-600 uppercase tracking-widest">Selected: {selectedFile.name}</span></div>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Bio Quote <span className="text-red-500">*</span></label>
                  <textarea 
                    placeholder="A brief, engaging quote or summary about the celebrity..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all resize-none h-20 text-sm" 
                    value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">Appears on the main celebrity card and top of profile.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Biography (Rich Text)</label>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <ReactQuill 
                      theme="snow"
                      value={formData.fullBio}
                      onChange={value => setFormData({...formData, fullBio: value})}
                      modules={quillModules}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Photo Gallery</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Gallery URLs</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, photos: [...formData.photos, '']})}
                      className="bg-white border border-gray-300 text-gray-700 hover:text-primary-red hover:border-primary-red px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <i className="fas fa-plus"></i> Add Photo
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.photos.map((p, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <span className="w-6 text-center text-xs font-bold text-gray-400">{idx + 1}</span>
                        <input 
                          placeholder="https://example.com/image.jpg" className="p-2 bg-transparent flex-1 text-sm outline-none"
                          value={p} onChange={e => {
                            const newPhotos = [...formData.photos];
                            newPhotos[idx] = e.target.value;
                            setFormData({...formData, photos: newPhotos});
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newPhotos = formData.photos.filter((_, i) => i !== idx);
                            setFormData({...formData, photos: newPhotos.length ? newPhotos : ['']});
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Video Collection</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">YouTube URLs</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, videos: [...formData.videos, '']})}
                      className="bg-white border border-gray-300 text-gray-700 hover:text-primary-red hover:border-primary-red px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <i className="fas fa-plus"></i> Add Video
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.videos.map((v, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <span className="w-6 text-center text-xs font-bold text-gray-400">{idx + 1}</span>
                        <input 
                          placeholder="https://youtube.com/watch?v=..." className="p-2 bg-transparent flex-1 text-sm outline-none"
                          value={v} onChange={e => {
                            const newVideos = [...formData.videos];
                            newVideos[idx] = e.target.value;
                            setFormData({...formData, videos: newVideos});
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newVideos = formData.videos.filter((_, i) => i !== idx);
                            setFormData({...formData, videos: newVideos.length ? newVideos : ['']});
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 mb-4">Quick Stats Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fan Base</label>
                      <div className="relative">
                        <i className="fas fa-users absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input 
                          placeholder="e.g. 1.2M" className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all text-sm font-bold"
                          value={formData.stats?.fanBase || ''} onChange={e => setFormData({...formData, stats: {...formData.stats, fanBase: e.target.value}})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        {formData.industry === 'Sports' ? 'Total Matches' : formData.industry === 'Business' ? 'Companies / Ventures' : 'Total Movies'}
                      </label>
                      <div className="relative">
                        <i className={`fas ${formData.industry === 'Sports' ? 'fa-running' : formData.industry === 'Business' ? 'fa-building' : 'fa-film'} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`}></i>
                        <input 
                          placeholder={formData.industry === 'Sports' ? 'e.g. 150 Matches' : formData.industry === 'Business' ? 'e.g. 12 Ventures' : 'e.g. 42'} className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all text-sm font-bold"
                          value={formData.stats?.movieCount || ''} onChange={e => setFormData({...formData, stats: {...formData.stats, movieCount: e.target.value}})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        {formData.industry === 'Sports' ? 'Trophies / Awards' : formData.industry === 'Business' ? 'Awards / Recognitions' : 'Nominations / Awards'}
                      </label>
                      <div className="relative">
                        <i className={`fas ${formData.industry === 'Sports' ? 'fa-trophy' : formData.industry === 'Business' ? 'fa-crown' : 'fa-award'} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`}></i>
                        <input 
                          placeholder={formData.industry === 'Sports' ? 'e.g. 2 World Cups' : formData.industry === 'Business' ? 'e.g. Forbes 30u30' : 'e.g. 98'} className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all text-sm font-bold"
                          value={formData.stats?.nominations || ''} onChange={e => setFormData({...formData, stats: {...formData.stats, nominations: e.target.value}})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-green-600 uppercase mb-1">Bonus Followers</label>
                      <div className="relative">
                        <i className="fas fa-arrow-trend-up absolute left-3 top-1/2 -translate-y-1/2 text-green-500"></i>
                        <input 
                          type="number"
                          placeholder="Boost" className="w-full pl-9 pr-3 py-2.5 bg-green-50 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-sm font-bold text-green-700 shadow-inner"
                          value={formData.bonusFollowers} onChange={e => setFormData({...formData, bonusFollowers: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Timeline / Milestones</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Key Events</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (user?.role === 'sub-admin' && formData.milestones.length >= 10) {
                            alert("Sub-admins can only add a maximum of 10 milestones. Please contact an Admin to add more.");
                            return;
                        }
                        setFormData({...formData, milestones: [...formData.milestones, { year: '', text: '' }]});
                      }}
                      className="bg-white border border-gray-300 text-gray-700 hover:text-primary-red hover:border-primary-red px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <i className="fas fa-plus"></i> Add Milestone
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.milestones.map((m, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group">
                        <div className="w-24">
                          <input 
                            placeholder="Year" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:bg-white focus:border-primary-red"
                            value={m.year} onChange={e => {
                              const newMilestones = [...formData.milestones];
                              newMilestones[idx].year = e.target.value;
                              setFormData({...formData, milestones: newMilestones});
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <textarea 
                            placeholder="Describe the milestone or achievement..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:bg-white focus:border-primary-red resize-none h-16"
                            value={m.text} onChange={e => {
                              const newMilestones = [...formData.milestones];
                              newMilestones[idx].text = e.target.value;
                              setFormData({...formData, milestones: newMilestones});
                            }}
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newMilestones = formData.milestones.filter((_, i) => i !== idx);
                            setFormData({...formData, milestones: newMilestones.length ? newMilestones : [{ year: '', text: '' }]});
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
              {editingIndex !== null ? 'Editing Record' : 'New Record'}
            </div>
            <div className="flex gap-3 pr-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all text-sm">Cancel</button>
              <button type="submit" className="bg-primary-red text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-red/30 hover:bg-secondary-red hover:shadow-primary-red/50 transition-all flex items-center gap-2 text-sm">
                <i className="fas fa-check-circle"></i> Save Celeb
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={showComments} 
        onClose={() => { setShowComments(false); setSelectedCelebId(null); }} 
        title={`Comments: ${selectedCeleb?.name}`}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {selectedCeleb?.comments?.length > 0 ? (
            [...selectedCeleb.comments]
              .sort((a, b) => (b.likes || 0) - (a.likes || 0))
              .map((comment, index) => (
              <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800 text-xs">{comment.user}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Likes:</span>
                    <input 
                      type="number" 
                      value={comment.likes || 0} 
                      onChange={(e) => updateCelebComment(selectedCeleb._id, comment._id, { likes: parseInt(e.target.value) || 0 })}
                      className="w-16 p-1 border rounded text-xs font-bold outline-none focus:ring-1 focus:ring-primary-red/50"
                    />
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    await deleteCelebComment(selectedCeleb._id, comment._id);
                  }}
                  className="text-red-500 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Comment"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No comments found</div>
          )}
        </div>
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCelebs.map((celeb) => (
          <div key={celeb._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="flex p-4 gap-4">
              <img src={celeb.image} className="w-16 h-16 rounded-full object-cover border-2 border-primary-red" alt="" />
              <div className="flex-1">
                <div className="p-0">
                    <h4 className="font-bold text-sm mb-1 line-clamp-1">{celeb.name}</h4>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{celeb.category}</p>
                        {user?.role === 'admin' && (
                            <div className="text-right">
                                <p className="text-[9px] font-black text-primary-red uppercase tracking-tighter">BY: {celeb.createdBy?.fullName || celeb.createdBy?.username || 'SYSTEM'}</p>
                                <p className="text-[8px] font-bold text-gray-400">EMP ID: {celeb.createdBy?.employeeId || 'N/A'}</p>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-primary-red text-xs font-bold">{celeb.role}</p>
                <p className="text-gray-400 text-[10px] mt-1 font-bold">Added: {celeb.createdAt ? new Date(celeb.createdAt).toLocaleDateString() : 'Legacy'}</p>
                <div className="flex gap-2 mt-2 items-center">
                  <button onClick={() => handleEdit(celeb)} className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
                  <button onClick={() => deleteCeleb(celeb._id)} className="text-red-600 text-xs font-bold hover:underline">Delete</button>
                  <button 
                    onClick={() => { setSelectedCelebId(celeb._id); setShowComments(true); }}
                    className="ml-auto text-gray-600 hover:bg-gray-100 p-1 rounded relative"
                    title="Manage Comments"
                  >
                    <i className="fas fa-comments"></i>
                    {celeb.comments?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-red text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-article-text">
                        {celeb.comments.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCelebs;
