import React, { useState, useEffect } from 'react';
import api from '../api';
import SEOModal from '../components/SEOModal';

const SEOManager = () => {
    const [stats, setStats] = useState({ totalPages: 0, seoCompleted: 0, seoMissing: 0 });
    const [seoEntries, setSeoEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, DONE, MISSING
    const [showModal, setShowModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await api.post('/seo/auto-generate');
            alert(res.data.message);
            fetchEntries();
            fetchStats();
        } catch (err) {
            alert('Automation failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSyncImages = async () => {
        if (!window.confirm('This will move all external images (Google links) to Cloudinary. It may take a minute. Continue?')) return;
        setIsSyncing(true);
        try {
            const res = await api.post('/seo/sync-images');
            alert(res.data.message);
        } catch (err) {
            alert('Sync failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/seo/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching SEO stats:", err);
        }
    };

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/seo');
            setSeoEntries(res.data);
        } catch (err) {
            console.error("Error fetching SEO entries:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchEntries();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this SEO record?')) return;
        try {
            await api.delete(`/seo/${id}`);
            fetchEntries();
            fetchStats();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setShowModal(true);
    };

    const handleAddCustom = () => {
        setEditingEntry(null);
        setShowModal(true);
    };

    const filteredEntries = seoEntries.filter(entry => {
        const matchesSearch = entry.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">SEO Dashboard</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage metadata for services and static pages.</p>
                </div>
                <div className="flex gap-3">
                     <button 
                        className={`bg-purple-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-purple-200 flex items-center gap-2 hover:bg-purple-700 transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
                        onClick={handleAutoGenerate}
                        disabled={isGenerating}
                    >
                         <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i> {isGenerating ? 'Generating...' : 'Auto SEO Services'}
                    </button>
                    <button 
                        className={`bg-amber-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-200 flex items-center gap-2 hover:bg-amber-600 transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
                        onClick={handleSyncImages}
                        disabled={isSyncing}
                        title="Move all external image links to Cloudinary for better performance"
                    >
                         <i className={`fas ${isSyncing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i> {isSyncing ? 'Syncing...' : 'Sync All Media'}
                    </button>
                    <button 
                        className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-cyan-200 flex items-center gap-2 hover:bg-cyan-600 transition-all"
                        onClick={handleAddCustom}
                    >
                        <i className="fas fa-plus"></i> Custom URL
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Pages" count={stats.totalPages} color="bg-slate-900" />
                <StatCard title="SEO Completed" count={stats.seoCompleted} color="bg-green-600" />
                <StatCard title="SEO Missing" count={stats.seoMissing} color="bg-red-600" />
            </div>

            {/* Filters & Controls */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input 
                            type="text" 
                            placeholder="Search URL or Title..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Status Tabs */}
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['ALL', 'DONE', 'MISSING'].map(s => (
                            <button 
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Entries Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-50">
                    <table className="w-full text-left text-[10px] font-black uppercase tracking-widest">
                        <thead className="bg-slate-900 text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Page URL</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Robots</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-10 text-center text-slate-300">Loading SEO Entries...</td></tr>
                            ) : filteredEntries.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-slate-300">No records found</td></tr>
                            ) : filteredEntries.map((entry) => (
                                <tr key={entry._id} className="hover:bg-slate-50/50 group transition-colors">
                                    <td className="px-6 py-4 text-slate-900 font-bold">{entry.url}</td>
                                    <td className="px-6 py-4 text-slate-400 truncate max-w-[200px]">{entry.title || '---'}</td>
                                    <td className="px-6 py-4 text-slate-400 truncate max-w-[300px]">{entry.description || '---'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[8px]">{entry.robots}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a 
                                                href={entry.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-slate-400 hover:text-primary-red hover:scale-125 transition-all"
                                                title="View Live Page"
                                            >
                                                <i className="fas fa-external-link-alt"></i>
                                            </a>
                                            <button onClick={() => handleEdit(entry)} className="text-cyan-500 hover:scale-125 transition-transform" title="Edit Metadata"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDelete(entry._id)} className="text-red-500 hover:scale-125 transition-transform" title="Delete Record"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SEOModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                entry={editingEntry}
                onRefresh={() => { fetchEntries(); fetchStats(); }}
            />
        </div>
    );
};

const StatCard = ({ title, count, color }) => (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-primary-red/10 transition-all">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{title}</h4>
        <span className={`text-6xl font-black italic tracking-tighter ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform`}>
            {count}
        </span>
    </div>
);

export default SEOManager;
