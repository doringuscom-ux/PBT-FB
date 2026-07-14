import React, { useState, useEffect } from 'react';
import * as api from '../api';
import { useData } from '../context/DataContext';
import { Navigate } from 'react-router-dom';

const ManageSubscribers = () => {
    const { user } = useData();
    const [subscribers, setSubscribers] = useState([]);
    const [stats, setStats] = useState({ total: 0, recentLogs: [], successCount: 0, failCount: 0 });
    const [emailLogs, setEmailLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'logs'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'sub-admin')) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subsRes, statsRes, logsRes] = await Promise.all([
                api.getSubscribersList(),
                api.getSubStats(),
                api.getEmailLogs()
            ]);
            setSubscribers(subsRes.data);
            setStats(statsRes.data);
            setEmailLogs(logsRes.data);
        } catch (err) {
            console.error("Failed to fetch subscriber data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSub = async (id) => {
        if (window.confirm('Are you sure you want to remove this subscriber? 他们将不再收到邮件通知。')) {
            try {
                await api.deleteSubscriber(id);
                fetchData();
                alert('Subscriber removed successfully.');
            } catch (err) {
                alert('Failed to delete subscriber.');
            }
        }
    };

    const filteredSubs = subscribers.filter(s => 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLogs = emailLogs.filter(l => 
        l.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.postTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || (user.role !== 'admin' && user.role !== 'sub-admin')) {
        return <Navigate to="/admin/login" replace />;
    }

    if (loading) return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Loading Subscribers Data...</div>;

    return (
        <div className="space-y-6">
            {/* Header & Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-500/10 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center text-xl">
                        <i className="fas fa-users"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Subscribers</p>
                        <h3 className="text-2xl font-black text-slate-800">{stats.total}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-green-500/10 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center text-xl">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Emails Delivered</p>
                        <h3 className="text-2xl font-black text-slate-800">{stats.successCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-red-500/10 text-red-600 w-12 h-12 rounded-xl flex items-center justify-center text-xl">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Failed Deliveries</p>
                        <h3 className="text-2xl font-black text-slate-800">{stats.failCount}</h3>
                    </div>
                </div>
            </div>

            {/* Navigation & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('list')}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-primary-red shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Subscribers List
                    </button>
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-white text-primary-red shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Email Tracking Logs
                    </button>
                </div>
                <div className="relative w-full md:w-80">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input 
                        type="text" 
                        placeholder={activeTab === 'list' ? "Search by email..." : "Search by email or post..."}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-semibold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {activeTab === 'list' ? (
                /* Subscribers Table */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined On</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubs.length > 0 ? filteredSubs.map((sub) => (
                                <tr key={sub._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary-red/10 text-primary-red rounded-full flex items-center justify-center text-xs font-bold">
                                                {sub.email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-700">{sub.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-500">
                                        {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDeleteSub(sub._id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Remove Subscriber"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="p-10 text-center text-slate-400 italic">No subscribers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Logs Table */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Info</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <span className="font-bold text-slate-700">{log.recipientEmail}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-primary-red uppercase tracking-tighter">{log.postType}</span>
                                            <span className="text-sm font-bold text-slate-600 line-clamp-1">{log.postTitle}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {log.status}
                                        </span>
                                        {log.error && <p className="text-[9px] text-red-400 mt-1 line-clamp-1" title={log.error}>{log.error}</p>}
                                    </td>
                                    <td className="p-4 text-xs font-medium text-slate-400">
                                        {new Date(log.sentAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-400 italic">No email logs found yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageSubscribers;
