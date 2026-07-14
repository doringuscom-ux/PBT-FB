import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { slugify } from '../utils/slugify';

const ManageNews = () => {
  const { user, celebs, movies, news, addNews, updateNews, deleteNews, deleteComment, updateComment } = useData();

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
  const [formData, setFormData] = useState({ title: '', image: '', category: '', excerpt: '', date: '', fullStory: '', author: 'Editor Team', likes: 0, slug: '', relatedMovie: '', relatedCelebrities: [] });
  const [imageSource, setImageSource] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showComments, setShowComments] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [movieSearchTerm, setMovieSearchTerm] = useState('');
  const [showMovieResults, setShowMovieResults] = useState(false);
  const [celebSearchTerm, setCelebSearchTerm] = useState('');
  const [showCelebResults, setShowCelebResults] = useState(false);
  const selectedArticle = news.find(n => n._id === selectedArticleId);

  const filteredNews = news
    .filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      if (sortBy === 'oldest') return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    const fieldsToExclude = ['comments', 'createdBy', '_id', 'createdAt', 'updatedAt', '__v'];
    
    Object.keys(formData).forEach(key => {
        if (!fieldsToExclude.includes(key)) {
            if (key !== 'image' || imageSource === 'url') {
                const value = formData[key];
                if (Array.isArray(value)) {
                    // Correct way to append arrays to FormData
                    value.forEach(val => {
                        if (val) data.append(key, val);
                    });
                } else {
                    data.append(key, value);
                }
            }
        }
    });

    if (imageSource === 'file' && selectedFile) {
        data.append('image', selectedFile);
    }

    if (editingIndex !== null) {
      await updateNews(formData._id, data);
      setEditingIndex(null);
    } else {
      await addNews(data);
    }
    setFormData({ title: '', image: '', category: '', excerpt: '', date: '', fullStory: '', author: 'Editor Team', likes: 0, slug: '', relatedMovie: '', relatedCelebrities: [] });
    setSelectedFile(null);
    setImageSource('url');
    setShowForm(false);
    setMovieSearchTerm('');
    setCelebSearchTerm('');
  };

  const handleEdit = (article) => {
    setEditingIndex(article._id);
    const sanitizedArticle = {
        ...article,
        relatedCelebrities: article.relatedCelebrities?.map(c => c._id || c) || []
    };
    setFormData(sanitizedArticle);
    setShowForm(true);
    if (article.relatedMovie) {
        const movie = movies.find(m => m._id === (article.relatedMovie._id || article.relatedMovie));
        if (movie) setMovieSearchTerm(movie.title);
    } else {
        setMovieSearchTerm('');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="sticky top-0 z-30 bg-gray-100/80 backdrop-blur-md pb-4 pt-2 -mt-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-text-dark">Manage News Articles</h2>
          <div className="flex flex-wrap w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64 flex gap-2">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder="Search headlines..." 
                  className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-gray-800 text-white px-3 py-2 rounded-lg font-bold hover:bg-black transition-all text-sm">
                Search
              </button>
            </div>
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20 bg-white font-semibold text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
              <button 
                onClick={() => { setShowForm(true); setEditingIndex(null); setFormData({ title: '', image: '', category: '', excerpt: '', date: '', fullStory: '', author: 'Editor Team', likes: 0, slug: '', relatedMovie: '', relatedCelebrities: [] }); setMovieSearchTerm(''); setCelebSearchTerm(''); }}
                className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary-red transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-red/20"
              >
                <i className="fas fa-plus"></i> <span className="hidden sm:inline">Add News</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingIndex !== null ? 'Edit Article' : 'Add New Article'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            placeholder="Headline" className="p-2 border rounded md:col-span-2" required
            value={formData.title} 
            onChange={e => {
              const newTitle = e.target.value;
              const newSlug = formData.category ? `${slugify(formData.category)}/${slugify(newTitle)}` : slugify(newTitle);
              // Only auto-update slug if it's currently empty or matches the previous title's slug
              const currentTitleSlug = formData.category ? `${slugify(formData.category)}/${slugify(formData.title)}` : slugify(formData.title);
              if (!formData.slug || formData.slug === currentTitleSlug) {
                setFormData({...formData, title: newTitle, slug: newSlug});
              } else {
                setFormData({...formData, title: newTitle});
              }
            }}
          />
          <div className="md:col-span-2 space-y-2">
            <div className="flex gap-4 mb-2">
              <button 
                type="button"
                onClick={() => setImageSource('url')}
                className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${imageSource === 'url' ? 'bg-primary-red text-white shadow-lg shadow-primary-red/20' : 'bg-gray-100 text-gray-500'}`}
              >
                Image URL
              </button>
              <button 
                type="button"
                onClick={() => setImageSource('file')}
                className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${imageSource === 'file' ? 'bg-primary-red text-white shadow-lg shadow-primary-red/20' : 'bg-gray-100 text-gray-500'}`}
              >
                Upload File
              </button>
            </div>
            
            {imageSource === 'url' ? (
              <input 
                placeholder="Image URL" className="p-2 border rounded w-full" required
                value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
              />
            ) : (
              <div className="flex flex-col gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  className="text-xs font-medium text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-red file:text-white hover:file:bg-secondary-red"
                  required={!editingIndex}
                />
                {selectedFile && <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Selected: {selectedFile.name}</p>}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <select 
              className="p-2 border rounded bg-white font-semibold" required
              value={formData.category} 
              onChange={e => {
                const newCat = e.target.value;
                const newSlug = newCat ? `${slugify(newCat)}/${slugify(formData.title)}` : slugify(formData.title);
                const currentCatSlug = formData.category ? `${slugify(formData.category)}/${slugify(formData.title)}` : slugify(formData.title);
                
                if (!formData.slug || formData.slug === currentCatSlug) {
                    setFormData({...formData, category: newCat, slug: newSlug});
                } else {
                    setFormData({...formData, category: newCat});
                }
              }}
            >
              <option value="">Select Category</option>
              <option value="EXCLUSIVE">EXCLUSIVE</option>
              <option value="BREAKING NEWS">BREAKING NEWS</option>
              <option value="MOVIES">MOVIES</option>
              <option value="CELEBS">CELEBS</option>
              <option value="MUSIC">MUSIC</option>
              <option value="SPORTS">SPORTS</option>
              <option value="BOX OFFICE">BOX OFFICE</option>
              <option value="LIFESTYLE">LIFESTYLE</option>
              <option value="TRENDING">TRENDING</option>
              <option value="INTERVIEWS">INTERVIEWS</option>
              <option value="REVIEWS">REVIEWS</option>
            </select>
            <button 
              type="button"
              onClick={() => setFormData({...formData, category: 'BREAKING NEWS'})}
              className="text-[10px] font-bold text-primary-red hover:underline text-left w-fit uppercase"
            >
              + Tag as Breaking News
            </button>
          </div>

          <input 
            placeholder="URL Slug (e.g. carry-on-jatta)" className="p-2 border rounded bg-yellow-50 font-bold"
            value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
          />
          <input 
            placeholder="Author" className="p-2 border rounded"
            value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}
          />
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Like Counter (Override)</label>
            <input 
              type="number"
              placeholder="Likes" className="p-2 border rounded bg-slate-50 font-bold"
              value={formData.likes} onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
            />
          </div>
          <div className="flex flex-col gap-1 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Related Movie (Search & Link)</label>
            <div className="relative">
                <input 
                    type="text"
                    placeholder="Search movie name..."
                    className="w-full p-2 border rounded bg-white font-semibold"
                    value={movieSearchTerm}
                    onChange={(e) => {
                        setMovieSearchTerm(e.target.value);
                        setShowMovieResults(true);
                    }}
                    onFocus={() => setShowMovieResults(true)}
                />
                {showMovieResults && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto no-scrollbar border-primary-red/20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div 
                            className="p-2 text-xs font-bold text-gray-400 hover:bg-gray-50 cursor-pointer border-b border-gray-50 italic"
                            onClick={() => {
                                setFormData({...formData, relatedMovie: ''});
                                setMovieSearchTerm('');
                                setShowMovieResults(false);
                            }}
                        >
                            None / General News
                        </div>
                        {movies
                            .filter(m => m.title.toLowerCase().includes(movieSearchTerm.toLowerCase()))
                            .sort((a,b) => a.title.localeCompare(b.title))
                            .map(m => (
                                <div 
                                    key={m._id}
                                    className="p-3 text-sm font-bold text-slate-700 hover:bg-primary-red hover:text-white cursor-pointer transition-colors flex items-center justify-between"
                                    onClick={() => {
                                        setFormData({...formData, relatedMovie: m._id});
                                        setMovieSearchTerm(m.title);
                                        setShowMovieResults(false);
                                    }}
                                >
                                    <span>{m.title}</span>
                                    <span className="text-[9px] opacity-60 italic">{m.industry}</span>
                                </div>
                            ))
                        }
                        {movies.filter(m => m.title.toLowerCase().includes(movieSearchTerm.toLowerCase())).length === 0 && (
                            <div className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No movies found</div>
                        )}
                    </div>
                )}
            </div>
            {formData.relatedMovie && (
                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">
                    <i className="fas fa-link mr-1"></i> Linked to Movie ID: {formData.relatedMovie?._id || formData.relatedMovie}
                </p>
            )}
          </div>

          <div className="flex flex-col gap-1 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Related Celebrities (Multi-Select)</label>
            <div className="relative">
                <input 
                    type="text"
                    placeholder="Search celebrity name..."
                    className="w-full p-2 border rounded bg-white font-semibold"
                    value={celebSearchTerm}
                    onChange={(e) => {
                        setCelebSearchTerm(e.target.value);
                        setShowCelebResults(true);
                    }}
                    onFocus={() => setShowCelebResults(true)}
                />
                {showCelebResults && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto no-scrollbar border-yellow-400/20 animate-in fade-in slide-in-from-top-2 duration-200">
                        {celebs
                            .filter(c => c.name.toLowerCase().includes(celebSearchTerm.toLowerCase()))
                            .sort((a,b) => a.name.localeCompare(b.name))
                            .map(c => (
                                <div 
                                    key={c._id}
                                    className={`p-3 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${formData.relatedCelebrities?.includes(c._id) ? 'bg-yellow-50 text-yellow-700' : 'text-slate-700 hover:bg-yellow-400 hover:text-white'}`}
                                    onClick={() => {
                                        const current = formData.relatedCelebrities || [];
                                        if (current.includes(c._id)) {
                                            setFormData({...formData, relatedCelebrities: current.filter(id => id !== c._id)});
                                        } else {
                                            setFormData({...formData, relatedCelebrities: [...current, c._id]});
                                        }
                                        setShowCelebResults(false);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <img src={c.image} className="w-6 h-6 rounded-full object-cover" alt="" />
                                        <span>{c.name}</span>
                                    </div>
                                    <span className="text-[9px] opacity-60 italic">{c.industry}</span>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {formData.relatedCelebrities?.map(id => {
                    const celeb = celebs.find(c => c._id === id);
                    return celeb ? (
                        <div key={id} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">
                            {celeb.name}
                            <button type="button" onClick={() => setFormData({...formData, relatedCelebrities: formData.relatedCelebrities.filter(cid => cid !== id)})} className="hover:text-red-500">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ) : null;
                })}
            </div>
          </div>
          <textarea 
            placeholder="Short Excerpt" className="p-2 border rounded md:col-span-2 h-20" required
            value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
          />
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Full Content (Rich Text)</label>
            <ReactQuill 
              theme="snow"
              value={formData.fullStory}
              onChange={value => setFormData({...formData, fullStory: value})}
              modules={quillModules}
              className="bg-white rounded border border-gray-200"
            />
          </div>
          <div className="md:col-span-2 flex gap-2 pt-4">
            <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all">Save Changes</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={showComments} 
        onClose={() => { setShowComments(false); setSelectedArticleId(null); }} 
        title={`Comments: ${selectedArticle?.title}`}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {selectedArticle?.comments?.length > 0 ? (
            [...selectedArticle.comments]
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
                      onChange={(e) => updateComment(selectedArticle._id, comment._id, { likes: parseInt(e.target.value) || 0 })}
                      className="w-16 p-1 border rounded text-xs font-bold outline-none focus:ring-1 focus:ring-primary-red/50"
                    />
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    await deleteComment(selectedArticle._id, comment._id);
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

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-bold text-text-gray uppercase">Article</th>
              <th className="p-4 text-sm font-bold text-text-gray uppercase">Category</th>
              {user?.role === 'admin' && <th className="p-4 text-sm font-bold text-text-gray uppercase">Author</th>}
              <th className="p-4 text-sm font-bold text-text-gray uppercase">Date</th>
              <th className="p-4 text-sm font-bold text-text-gray uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredNews.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={item.image} className="w-16 h-10 object-cover rounded" alt="" />
                    <span className="font-bold text-text-dark text-sm max-w-xs line-clamp-1">{item.title}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-primary-red text-white text-[10px] px-2 py-1 rounded-full font-bold">{item.category}</span>
                </td>
                {user?.role === 'admin' && (
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary-red uppercase tracking-widest">{item.createdBy?.fullName || item.createdBy?.username || 'System'}</span>
                      <span className="text-[10px] font-bold text-gray-400">ID: {item.createdBy?.employeeId || 'N/A'}</span>
                    </div>
                  </td>
                )}
                <td className="p-4 text-xs text-text-gray">
                  {new Date(item.createdAt || item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedArticleId(item._id); setShowComments(true); }} 
                      className="text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center relative"
                      title="Manage Comments"
                    >
                      <i className="fas fa-comments"></i>
                      {item.comments?.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary-red text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {item.comments.length}
                        </span>
                      )}
                    </button>
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:bg-blue-50 w-8 h-8 rounded-full"><i className="fas fa-edit"></i></button>
                    <button onClick={() => deleteNews(item._id)} className="text-red-600 hover:bg-red-50 w-8 h-8 rounded-full"><i className="fas fa-trash"></i></button>
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

export default ManageNews;
