import React, { useState, useEffect } from 'react';
import { getInquiries, deleteInquiry, updateInquiry, getSettings, updateSetting } from '../api';
import Modal from '../components/Modal';

const ManageInquiries = ({ mode = 'promotions' }) => {
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isPopupEnabled, setIsPopupEnabled] = useState(true);

    useEffect(() => {
        if (mode === 'whatsapp') {
            getSettings().then(res => {
                setIsPopupEnabled(res.data.whatsappPopupEnabled ?? true);
            }).catch(err => console.error("Error fetching settings:", err));
        }
    }, [mode]);

    const togglePopup = async () => {
        try {
            const newValue = !isPopupEnabled;
            await updateSetting('whatsappPopupEnabled', newValue);
            setIsPopupEnabled(newValue);
        } catch (err) {
            alert('Failed to update setting: ' + err.message);
        }
    };

    const fetchInquiries = async () => {
        try {
            const res = await getInquiries();
            setInquiries(res.data);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    useEffect(() => {
        if (mode === 'whatsapp') {
            setFilteredInquiries(inquiries.filter(i => i.type === 'WhatsApp'));
        } else {
            setFilteredInquiries(inquiries.filter(i => i.type !== 'WhatsApp'));
        }
    }, [inquiries, mode]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            await deleteInquiry(id);
            setInquiries(inquiries.filter(i => i._id !== id));
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    const toggleReadStatus = async (inquiry) => {
        try {
            const newStatus = !inquiry.isRead;
            const res = await updateInquiry(inquiry._id, { isRead: newStatus });
            setInquiries(inquiries.map(i => i._id === inquiry._id ? res.data : i));
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const handleViewMessage = (inquiry) => {
        setSelectedInquiry(inquiry);
        setShowModal(true);
        // Auto-mark as read if viewing
        if (!inquiry.isRead) {
            toggleReadStatus(inquiry);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
             <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-red rounded-full animate-spin"></div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading leads...</p>
             </div>
        </div>
    );

    const title = mode === 'whatsapp' ? 'WhatsApp Leads' : 'Promotion Inquiries';
    const subTitle = mode === 'whatsapp' ? 'Users who want to join your WhatsApp updates group.' : 'Manage users who want to advertise or post news.';
    const accentColor = mode === 'whatsapp' ? 'text-green-500' : 'text-primary-red';
    const accentBg = mode === 'whatsapp' ? 'bg-green-500/10' : 'bg-primary-red/10';
    const accentIcon = mode === 'whatsapp' ? 'fab fa-whatsapp' : 'fas fa-users-viewfinder';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{title.split(' ')[0]} <span className={accentColor}>{title.split(' ')[1]}</span></h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subTitle}</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    {mode === 'whatsapp' && (
                        <div 
                            onClick={togglePopup}
                            className="bg-white border border-slate-100 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-4 cursor-pointer hover:border-slate-300 transition-all active:scale-95"
                            title="Enable or disable the WhatsApp popup on the main site"
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Popup Status</span>
                                <span className={`text-xl font-black ${isPopupEnabled ? 'text-green-500' : 'text-slate-400'}`}>
                                    {isPopupEnabled ? 'ENABLED' : 'DISABLED'}
                                </span>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPopupEnabled ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-100 text-slate-400'}`}>
                                <i className={`fas fa-power-off`}></i>
                            </div>
                        </div>
                    )}
                    <div className="bg-white border border-slate-100 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Counts</span>
                            <span className="text-xl font-black text-slate-900">{filteredInquiries.length}</span>
                        </div>
                        <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center ${accentColor}`}>
                            <i className={accentIcon}></i>
                        </div>
                    </div>
                </div>
            </header>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest">
                    Error: {error}
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 italic w-8">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 italic">User Details</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 italic">Category</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 italic">Submitted On</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 italic text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInquiries.length > 0 ? filteredInquiries.map((inquiry) => (
                                <tr key={inquiry._id} className={`transition-colors group ${inquiry.isRead ? 'opacity-70 bg-slate-50/20' : 'bg-white font-bold'}`}>
                                    <td className="p-6 text-center">
                                        <div className={`w-3 h-3 rounded-full mx-auto shadow-sm ${inquiry.isRead ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} title={inquiry.isRead ? 'Read' : 'Unread'}></div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase shadow-lg ${inquiry.isRead ? 'bg-slate-400' : 'bg-slate-900 group-hover:bg-primary-red transition-colors'}`}>
                                                {inquiry.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`uppercase tracking-tight italic ${inquiry.isRead ? 'text-slate-500' : 'text-slate-900'}`}>{inquiry.name}</span>
                                                <span className="text-xs font-bold text-slate-400">{inquiry.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                            inquiry.type === 'WhatsApp' ? 'bg-green-100 text-green-700' :
                                            inquiry.type === 'Advertising' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {inquiry.type}
                                        </span>
                                    </td>
                                    <td className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {new Date(inquiry.createdAt).toLocaleDateString(undefined, { 
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleViewMessage(inquiry)}
                                                className="w-10 h-10 rounded-xl bg-slate-900 text-white hover:bg-black transition-all flex items-center justify-center shadow-lg shadow-slate-200"
                                                title="Read Message"
                                            >
                                                <i className="fas fa-eye text-xs"></i>
                                            </button>
                                            <button 
                                                onClick={() => toggleReadStatus(inquiry)}
                                                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${inquiry.isRead ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-green-100 text-green-600 hover:bg-green-600 hover:text-white shadow-lg shadow-green-100'}`}
                                                title={inquiry.isRead ? "Mark as Unread" : "Mark as Read"}
                                            >
                                                <i className={`fas ${inquiry.isRead ? 'fa-undo' : 'fa-check'} text-xs`}></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(inquiry._id)}
                                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash-alt text-xs"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20 text-slate-400">
                                            <i className="fas fa-envelope-open-text text-5xl"></i>
                                            <p className="font-black uppercase tracking-[0.3em] text-xs">No inquiries found in this category</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Viewer Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`Message from ${selectedInquiry?.name}`}
            >
                {selectedInquiry && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                                <p className="font-black text-slate-900 uppercase italic">{selectedInquiry.type}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Received</span>
                                <p className="font-bold text-slate-900">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                <p className="font-bold text-blue-600">{selectedInquiry.email}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                                <p className="font-bold text-slate-900">{selectedInquiry.phone}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-4">Message Content</span>
                            <p className="text-lg font-medium leading-relaxed italic">
                                "{selectedInquiry.message || 'No specific message content provided.'}"
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Close View
                            </button>
                            <a 
                                href={`https://wa.me/${(selectedInquiry.phone || '').replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all text-center flex items-center justify-center gap-2"
                            >
                                <i className="fab fa-whatsapp"></i> Reply on WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ManageInquiries;
