import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from './Modal';

const SEOModal = ({ isOpen, onClose, entry, onRefresh }) => {
    const [formData, setFormData] = useState({
        url: '',
        title: '',
        description: '',
        keywords: '',
        canonical: '',
        robots: 'index, follow',
        isAuto: false
    });
    const [isLoading, setIsLoading] = useState(false);

    

    useEffect(() => {
        if (entry) {
            setFormData(entry);
        } else {
            setFormData({
                url: '',
                title: '',
                description: '',
                keywords: '',
                canonical: '',
                robots: 'index, follow',
                isAuto: false
            });
        }
    }, [entry, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Block Admin pages from SEO
        if (formData.url.toLowerCase().startsWith('/admin')) {
            alert('Cannot create SEO entries for Admin pages.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/seo', formData);
            onRefresh();
            onClose();
        } catch (err) {
            alert('Save failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={entry ? 'Edit SEO Entry' : 'Add New SEO Entry'}>
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Page URL (slug)</label>
                        <input 
                            name="url" 
                            placeholder="e.g. /news/cat/slug"
                            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-bold text-sm"
                            required
                            value={formData.url}
                            onChange={handleChange}
                            disabled={!!entry}
                        />
                        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest pl-1 italic">The exact path shown in the browser address bar.</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Meta Title</label>
                        <input 
                            name="title" 
                            placeholder="The page title shown in browser tab"
                            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-bold text-sm"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Meta Description</label>
                        <textarea 
                            name="description" 
                            placeholder="A short summary for search engines (Max 160 chars recommended)"
                            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-bold text-sm h-32 resize-none"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Meta Keywords</label>
                        <input 
                            name="keywords" 
                            placeholder="Keyword1, Key word 2, Keyword 3..."
                            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-bold text-sm"
                            value={formData.keywords}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Canonical URL</label>
                        <input 
                            name="canonical" 
                            placeholder="e.g. https://pbtadka.com/about"
                            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-bold text-sm"
                            value={formData.canonical}
                            onChange={handleChange}
                        />
                        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest pl-1 italic">The preferred version of this page for search engines.</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Robots Tag</label>
                        <select 
                            name="robots"
                            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-bold text-sm appearance-none"
                            value={formData.robots}
                            onChange={handleChange}
                        >
                            <option value="index, follow">index, follow (Default)</option>
                            <option value="noindex, follow">noindex, follow</option>
                            <option value="index, nofollow">index, nofollow</option>
                            <option value="noindex, nofollow">noindex, nofollow</option>
                        </select>
                        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest pl-1 italic">Controls how search engines crawl and index this page.</p>
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-50">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 bg-cyan-500 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-cyan-100 hover:bg-cyan-600 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Record'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 bg-slate-100 text-slate-400 p-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SEOModal;
