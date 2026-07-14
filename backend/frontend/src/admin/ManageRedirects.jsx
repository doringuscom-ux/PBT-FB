import React, { useState, useEffect } from 'react';
import api from '../api';

const ManageRedirects = () => {
    const [redirects, setRedirects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({ id: null, fromPath: '', toUrl: '', isActive: true });
    const [isEditing, setIsEditing] = useState(false);

    

    useEffect(() => {
        fetchRedirects();
    }, []);

    const fetchRedirects = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/redirects');
            setRedirects(res.data);
        } catch (err) {
            console.error('Error fetching redirects:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/redirects/${formData.id}`, formData);
                alert('Redirect updated successfully!');
            } else {
                await api.post('/redirects', formData);
                alert('Redirect added successfully!');
            }
            resetForm();
            fetchRedirects();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.msg || err.message));
        }
    };

    const handleEdit = (redirect) => {
        setIsEditing(true);
        setFormData({
            id: redirect._id,
            fromPath: redirect.fromPath,
            toUrl: redirect.toUrl,
            isActive: redirect.isActive
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this redirect?')) return;
        try {
            await api.delete(`/redirects/${id}`);
            fetchRedirects();
        } catch (err) {
            alert('Error deleting redirect: ' + err.message);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ id: null, fromPath: '', toUrl: '', isActive: true });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Manage Redirects</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Control custom URL redirections dynamically.</p>
            </div>

            {/* Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">{isEditing ? 'Edit Redirect' : 'Add New Redirect'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">From Path (Relative or Full URL)</label>
                            <input 
                                type="text" 
                                name="fromPath" 
                                value={formData.fromPath} 
                                onChange={(e) => {
                                    let val = e.target.value;
                                    // If user pastes a full URL of the same site, we can keep it as is
                                    // but we should warn them or normalize it.
                                    // For now, we just update the state.
                                    setFormData(prev => ({ ...prev, fromPath: val }));
                                }}
                                onBlur={(e) => {
                                    let val = e.target.value.trim();
                                    if (val.startsWith('http')) {
                                        try {
                                            const url = new URL(val);
                                            // If it's a full URL, we extract the pathname to make it cleaner
                                            // but only if it's the same domain or if we want to be safe.
                                            // The GlobalRedirector now handles both, so this is just for UI cleanliness.
                                            if (window.confirm('You entered a full URL. Convert it to a relative path (' + url.pathname + ')?')) {
                                                setFormData(prev => ({ ...prev, fromPath: url.pathname }));
                                            }
                                        } catch (err) {
                                            // ignore invalid urls
                                        }
                                    } else if (val && !val.startsWith('/')) {
                                        setFormData(prev => ({ ...prev, fromPath: '/' + val }));
                                    }
                                }}
                                placeholder="/old-page or https://pbtadka.com/old-page" 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-medium text-sm"
                            />
                            <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">Tip: Use relative paths like /news/kkr for best results.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">To URL (Destination)</label>
                            <input 
                                type="url" 
                                name="toUrl" 
                                value={formData.toUrl} 
                                onChange={handleInputChange} 
                                placeholder="https://pbtadka.com/new-page" 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary-red/10 outline-none font-medium text-sm"
                            />
                            <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">Enter the full destination URL.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="isActive" 
                            name="isActive" 
                            checked={formData.isActive} 
                            onChange={handleInputChange} 
                            className="w-4 h-4 text-primary-red rounded focus:ring-primary-red"
                        />
                        <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Is Active</label>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="bg-primary-red text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all">
                            {isEditing ? 'Update Redirect' : 'Add Redirect'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-all">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Existing Redirects</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-50">
                    <table className="w-full text-left text-[10px] font-black uppercase tracking-widest">
                        <thead className="bg-slate-900 text-slate-400">
                            <tr>
                                <th className="px-6 py-4">From Path</th>
                                <th className="px-6 py-4">To URL</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan="4" className="p-10 text-center text-slate-300">Loading Redirects...</td></tr>
                            ) : redirects.length === 0 ? (
                                <tr><td colSpan="4" className="p-10 text-center text-slate-300">No redirects found</td></tr>
                            ) : redirects.map((redirect) => (
                                <tr key={redirect._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-slate-900 font-bold">{redirect.fromPath}</td>
                                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={redirect.toUrl}>{redirect.toUrl}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[8px] ${redirect.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {redirect.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(redirect)} className="text-cyan-500 hover:scale-125 transition-transform"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDelete(redirect._id)} className="text-red-500 hover:scale-125 transition-transform"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageRedirects;
