import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../api';
import Modal from '../components/Modal';
import { slugify } from '../utils/slugify';

const ManageVideos = () => {
    const { user, videos, addVideo, updateVideo, deleteVideo, deleteVideoComment, updateVideoComment } = useData();

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        videoUrl: '', 
        videoType: 'youtube', // 'youtube' or 'upload'
        views: '', 
        time: '',
        image: '', // Thumbnail URL for YouTube
        description: '',
        publishedAt: 'March 2026',
        likes: 0,
        slug: ''
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbSource, setThumbSource] = useState('url'); // 'url' or 'file'
    const [thumbFile, setThumbFile] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const selectedVideo = videos.find(v => v._id === selectedVideoId);

    const filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        const fieldsToExclude = ['comments', 'createdBy', '_id', 'createdAt', 'updatedAt', '__v'];

        Object.keys(formData).forEach(key => {
            if (!fieldsToExclude.includes(key)) {
                if (key !== 'image' || thumbSource === 'url') {
                    data.append(key, formData[key]);
                }
            }
        });

        if (formData.videoType === 'upload') {
            if (videoFile) data.append('video', videoFile);
        }

        if (thumbSource === 'file' && thumbFile) {
            data.append('thumbnail', thumbFile);
        }

        try {
            if (editingId) {
                await updateVideo(editingId, data);
            } else {
                await addVideo(data);
            }
            resetForm();
        } catch (err) {
            alert('Error saving video');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ 
            title: '', videoUrl: '', videoType: 'youtube', views: '', time: '', image: '',
            description: '', publishedAt: 'March 2026', likes: 0, slug: ''
        });
        setVideoFile(null);
        setThumbFile(null);
        setThumbSource('url');
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (video) => {
        setEditingId(video._id);
        setFormData({
            title: video.title,
            videoUrl: video.videoUrl,
            videoType: video.videoType,
            views: video.views,
            time: video.time,
            image: video.image,
            description: video.description || '',
            publishedAt: video.publishedAt || 'March 2026',
            likes: video.likes || 0,
            slug: video.slug || ''
        });
        setShowForm(true);
    };

    const baseUrl = API_BASE_URL;

    return (
        <div className="space-y-6 relative">
            <div className="sticky top-0 z-30 bg-gray-100/80 backdrop-blur-md pb-4 pt-2 -mt-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-text-dark">Manage Videos</h2>
                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-64">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input 
                                type="text" 
                                placeholder="Search video titles..." 
                                className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => { setShowForm(true); setEditingId(null); setFormData(prev => ({ ...prev, slug: '' })); }}
                            className="bg-primary-red text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary-red transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-red/20"
                        >
                            <i className="fas fa-plus"></i> <span className="hidden sm:inline">Add Video</span>
                        </button>
                    </div>
                </div>
            </div>

            <Modal 
                isOpen={showForm} 
                onClose={resetForm} 
                title={editingId ? 'Edit Video' : 'Add New Video'}
            >
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        placeholder="Video Title" className="p-2 border rounded md:col-span-2" required
                        value={formData.title} 
                        onChange={e => {
                            const newTitle = e.target.value;
                            const newSlug = formData.category ? `${slugify(formData.category)}/${slugify(newTitle)}` : slugify(newTitle);
                            const currentTitleSlug = formData.category ? `${slugify(formData.category)}/${slugify(formData.title)}` : slugify(formData.title);
                            if (!formData.slug || formData.slug === currentTitleSlug) {
                                setFormData({...formData, title: newTitle, slug: newSlug});
                            } else {
                                setFormData({...formData, title: newTitle});
                            }
                        }}
                    />
                    <input 
                        placeholder="URL Slug (e.g. trailer-carry-on-jatta)" className="p-2 border rounded md:col-span-2 bg-yellow-50 font-bold px-3"
                        value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                    />
                    
                    <div className="md:col-span-2 flex gap-4 p-2 bg-white rounded border border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" name="vtype" value="youtube" 
                                checked={formData.videoType === 'youtube'} 
                                onChange={() => setFormData({...formData, videoType: 'youtube'})}
                            />
                            <span className="text-sm font-bold">YouTube Link</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" name="vtype" value="upload" 
                                checked={formData.videoType === 'upload'} 
                                onChange={() => setFormData({...formData, videoType: 'upload'})}
                            />
                            <span className="text-sm font-bold">File Upload</span>
                            </label>
                    </div>

                    {formData.videoType === 'youtube' ? (
                        <>
                            <input 
                                placeholder="YouTube URL" className="p-2 border rounded md:col-span-2" required
                                value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                            />
                            
                            <div className="md:col-span-2 space-y-2">
                                <div className="flex gap-4 mb-2">
                                    <button 
                                        type="button"
                                        onClick={() => setThumbSource('url')}
                                        className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${thumbSource === 'url' ? 'bg-primary-red text-white shadow-lg shadow-primary-red/20' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        Thumb URL
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setThumbSource('file')}
                                        className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${thumbSource === 'file' ? 'bg-primary-red text-white shadow-lg shadow-primary-red/20' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        Upload File
                                    </button>
                                </div>
                                
                                {thumbSource === 'url' ? (
                                    <input 
                                        placeholder="Thumbnail Image URL" className="p-2 border rounded w-full" required
                                        value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                                    />
                                ) : (
                                    <div className="flex flex-col gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={e => setThumbFile(e.target.files[0])}
                                            className="text-xs font-medium text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-red file:text-white hover:file:bg-secondary-red"
                                            required={!editingId}
                                        />
                                        {thumbFile && <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Selected: {thumbFile.name}</p>}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="md:col-span-2 space-y-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Select Video File (MP4)</span>
                            <input 
                                type="file" accept="video/*" 
                                className="p-2 border rounded w-full bg-white" 
                                onChange={e => setVideoFile(e.target.files[0])}
                                required={!editingId}
                            />
                            <span className="text-xs font-bold text-gray-500 uppercase block mt-2">Select Thumbnail Image</span>
                            <input 
                                type="file" accept="image/*" 
                                className="p-2 border rounded w-full bg-white" 
                                onChange={e => setThumbFile(e.target.files[0])}
                                required={!editingId}
                            />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input 
                            placeholder="Industry (e.g. Bollywood)" className="p-2 border rounded w-1/2"
                            value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                        />
                        <input 
                            placeholder="Category (e.g. Trailer)" className="p-2 border rounded w-1/2"
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
                        />
                    </div>
                    <div className="flex gap-2">
                        <input 
                            placeholder="Views (e.g. 1.2M)" className="p-2 border rounded w-1/2" required
                            value={formData.views} onChange={e => setFormData({...formData, views: e.target.value})}
                        />
                        <input 
                            placeholder="Duration (e.g. 3:45)" className="p-2 border rounded w-1/2" required
                            value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-1/2">
                            <input 
                                placeholder="Published Date" className="p-2 border rounded w-full"
                                value={formData.publishedAt} onChange={e => setFormData({...formData, publishedAt: e.target.value})}
                            />
                        </div>
                        <div className="w-1/2 flex flex-col gap-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Like Override</label>
                            <input 
                                type="number"
                                placeholder="Likes" className="p-2 border rounded w-full bg-slate-50 font-bold"
                                value={formData.likes} onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Video Description (Rich Text)</label>
                        <ReactQuill 
                            theme="snow"
                            value={formData.description}
                            onChange={value => setFormData({...formData, description: value})}
                            modules={quillModules}
                            className="bg-white rounded border border-gray-200"
                        />
                    </div>

                    <div className="md:col-span-2 flex gap-2 pt-4">
                        <button 
                            type="submit" disabled={loading}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Saving...' : 'Save Video'}
                        </button>
                        <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                    </div>
                </form>
            </Modal>

            <Modal 
                isOpen={showComments} 
                onClose={() => { setShowComments(false); setSelectedVideoId(null); }} 
                title={`Comments: ${selectedVideo?.title}`}
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {selectedVideo?.comments?.length > 0 ? (
                    [...selectedVideo.comments]
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
                            onChange={(e) => updateVideoComment(selectedVideo._id, comment._id, { likes: parseInt(e.target.value) || 0 })}
                            className="w-16 p-1 border rounded text-xs font-bold outline-none focus:ring-1 focus:ring-primary-red/50"
                            />
                        </div>
                        </div>
                        <button 
                        onClick={async () => {
                            await deleteVideoComment(selectedVideo._id, comment._id);
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                    <div key={video._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <div className="relative h-40">
                            <img 
                                src={video.image.startsWith('/uploads/') ? `${baseUrl}${video.image}` : video.image} 
                                className="w-full h-full object-cover" alt="" 
                            />
                            <div className="absolute top-2 left-2 flex gap-1">
                                <span className="bg-primary-red text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase">
                                    {video.industry}
                                </span>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${video.videoType === 'youtube' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                    {video.videoType}
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fas fa-play text-white text-3xl"></i>
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-sm mb-1 line-clamp-1">{video.title}</h4>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{video.category}</p>
                                {user?.role === 'admin' && (
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-primary-red uppercase tracking-tighter">BY: {video.createdBy?.fullName || video.createdBy?.username || 'SYSTEM'}</p>
                                        <p className="text-[8px] font-bold text-gray-400">EMP ID: {video.createdBy?.employeeId || 'N/A'}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-text-gray font-bold">{video.views} views • {video.likes || 0} likes</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1">{video.time} duration</span>
                            </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setSelectedVideoId(video._id); setShowComments(true); }}
                                        className="text-gray-600 hover:bg-gray-100 p-1 rounded relative"
                                        title="Manage Comments"
                                    >
                                        <i className="fas fa-comments"></i>
                                        {video.comments?.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-primary-red text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-article-text">
                                                {video.comments.length}
                                            </span>
                                        )}
                                    </button>
                                    <button onClick={() => handleEdit(video)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => deleteVideo(video._id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><i className="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageVideos;
