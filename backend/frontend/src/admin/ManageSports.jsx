import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { slugify } from '../utils/slugify';

const ManageSports = () => {
  const { user, news, addNews, updateNews, deleteNews } = useData();

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
  const [formData, setFormData] = useState({ title: '', image: '', category: 'SPORTS', excerpt: '', date: '', fullStory: '', author: 'Sports Desk', slug: '' });
  const [imageSource, setImageSource] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Only show sports news
  const sportsNews = news.filter(item => item.category?.toUpperCase() === 'SPORTS');
  const filteredSports = sportsNews
    .filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
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
                data.append(key, formData[key]);
            }
        }
    });
    
    // Force category
    data.set('category', 'SPORTS');

    if (imageSource === 'file' && selectedFile) {
        data.append('image', selectedFile);
    }

    if (editingIndex !== null) {
      await updateNews(formData._id, data);
      setEditingIndex(null);
    } else {
      await addNews(data);
    }
    setFormData({ title: '', image: '', category: 'SPORTS', excerpt: '', date: '', fullStory: '', author: 'Sports Desk', slug: '' });
    setSelectedFile(null);
    setImageSource('url');
    setShowForm(false);
  };

  const handleEdit = (article) => {
    setEditingIndex(article._id);
    setFormData(article);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', image: '', category: 'SPORTS', excerpt: '', date: '', fullStory: '', author: 'Sports Desk', slug: '' });
    setEditingIndex(null);
    setSelectedFile(null);
    setImageSource('url');
    setShowForm(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="sticky top-0 z-30 bg-gray-100/80 backdrop-blur-md pb-4 pt-2 -mt-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-xl font-black text-text-dark flex items-center gap-2 tracking-tighter uppercase italic">
              <i className="fas fa-trophy text-primary-red"></i> Sports Management
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Exclusive control for Sports Desk</p>
          </div>
          <div className="flex flex-wrap w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64 flex gap-2">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  placeholder="Search sports..." 
                  className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="bg-gray-800 text-white px-3 py-2 rounded-lg font-bold hover:bg-black transition-all text-xs"
                onClick={() => {}} // Live filters already, this is for visual
              >
                Search
              </button>
            </div>
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-red/20 bg-white font-bold text-xs uppercase tracking-wider"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
              <button 
                onClick={resetForm}
                className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary-red transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-red/20"
              >
                <i className="fas fa-plus"></i> <span className="hidden sm:inline text-xs uppercase tracking-widest">Post sports News</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingIndex !== null ? 'Edit Sports Story' : 'New Sports Story'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            placeholder="Match Headline" className="p-3 border rounded-xl md:col-span-2 font-bold focus:ring-2 focus:ring-primary-red/20 outline-none" required
            value={formData.title} 
            onChange={e => {
                const newTitle = e.target.value;
                const newSlug = `sports/${slugify(newTitle)}`;
                if (!formData.slug || formData.slug === `sports/${slugify(formData.title)}`) {
                    setFormData({...formData, title: newTitle, slug: newSlug});
                } else {
                    setFormData({...formData, title: newTitle});
                }
            }}
          />
          <input 
            placeholder="URL Slug (e.g. ipl-final-match)" className="p-3 border rounded-xl md:col-span-2 bg-yellow-50 font-bold focus:ring-2 focus:ring-primary-red/20 outline-none"
            value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
          />
          <div className="md:col-span-2 space-y-3">
            <div className="flex gap-4 mb-2">
              <button 
                type="button"
                onClick={() => setImageSource('url')}
                className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${imageSource === 'url' ? 'bg-primary-red text-white shadow-xl shadow-primary-red/20' : 'bg-gray-100 text-gray-500'}`}
              >
                Featured URL
              </button>
              <button 
                type="button"
                onClick={() => setImageSource('file')}
                className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${imageSource === 'file' ? 'bg-primary-red text-white shadow-xl shadow-primary-red/20' : 'bg-gray-100 text-gray-500'}`}
              >
                Upload Photo
              </button>
            </div>
            
            {imageSource === 'url' ? (
              <input 
                placeholder="Featured Image URL" className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-primary-red/20 outline-none font-bold text-sm" required
                value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
              />
            ) : (
              <div className="flex flex-col gap-3 p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  className="text-xs font-black text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary-red file:text-white hover:file:bg-secondary-red file:uppercase file:tracking-widest cursor-pointer"
                  required={!editingIndex}
                />
                {selectedFile && <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] flex items-center gap-2"><i className="fas fa-check-circle"></i> {selectedFile.name}</p>}
              </div>
            )}
          </div>
          <input 
             value="SPORTS" disabled className="p-3 border rounded-xl bg-gray-50 text-gray-400 font-black cursor-not-allowed"
          />
          <input 
            placeholder="Published Date" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none"
            value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
          />
          <input 
            placeholder="Author / Reporter" className="p-3 border rounded-xl focus:ring-2 focus:ring-primary-red/20 outline-none"
            value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})}
          />
          <textarea 
            placeholder="Highlights Summary (Excerpt)" className="p-3 border rounded-xl md:col-span-2 h-20 focus:ring-2 focus:ring-primary-red/20 outline-none font-medium" required
            value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
          />
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase text-gray-400 mb-3 tracking-widest pl-1">Full Match Report (Rich Text)</label>
            <ReactQuill 
              theme="snow"
              value={formData.fullStory}
              onChange={value => setFormData({...formData, fullStory: value})}
              modules={quillModules}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            />
          </div>
          <div className="md:col-span-2 flex gap-3 pt-6">
            <button type="submit" className="bg-primary-red text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-secondary-red transition-all uppercase tracking-widest text-xs">Publish Story</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-10 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-xs">Cancel</button>
          </div>
        </form>
      </Modal>

      <div className="overflow-x-auto border-2 border-gray-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Feed / Story</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Details</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSports.length === 0 ? (
                <tr>
                    <td colSpan="3" className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest">Empty Stadium</td>
                </tr>
            ) : filteredSports.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-5">
                    <div className="relative w-24 h-16 rounded-2xl overflow-hidden shadow-md">
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-black text-text-dark text-sm uppercase tracking-tighter italic line-clamp-1">{item.title}</span>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{item.author} • {new Date(item.createdAt || item.date).toLocaleDateString()}</span>
                            {user?.role === 'admin' && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black text-primary-red uppercase">Created By: {item.createdBy?.fullName || item.createdBy?.username || 'System'}</span>
                                    <span className="text-[9px] font-bold text-gray-300">({item.createdBy?.employeeId || 'N/A'})</span>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-1">
                      <span className="bg-primary-red/10 text-primary-red text-[9px] px-3 py-1 rounded-full font-black w-fit border border-primary-red/20 uppercase tracking-widest">SPORTS</span>
                      <p className="text-[10px] text-gray-400 line-clamp-1 font-medium">{item.excerpt}</p>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(item)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm"><i className="fas fa-edit"></i></button>
                    <button onClick={() => deleteNews(item._id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm"><i className="fas fa-trash"></i></button>
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

export default ManageSports;
