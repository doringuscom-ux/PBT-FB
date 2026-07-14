import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { submitInquiry, getSettings } from '../api';

const InquiryPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'WhatsApp',
        message: 'Requested to join WhatsApp group'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        // Only show on home page
        if (window.location.pathname !== '/') return;

        // Check if already submitted (if so, never show again)
        const submittedAt = localStorage.getItem('pbt_popup_submitted_at');
        if (submittedAt) {
            return;
        }

        // Check settings to see if it's enabled
        getSettings().then(res => {
            if (res.data.whatsappPopupEnabled !== false) { // Default to true if undefined
                setIsOpen(true);
            }
        }).catch(err => {
            console.error("Error checking popup status:", err);
            setIsOpen(true); // Fallback
        });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await submitInquiry(formData);
            // On success, hide forever
            localStorage.setItem('pbt_popup_submitted_at', Date.now().toString());
            setStatus({ type: 'success', message: 'Thank you! We will contact you soon.' });
            
            // Close after 2 seconds
            setTimeout(() => {
                setIsOpen(false);
            }, 2000);
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.message || 'Something went wrong. Please try again.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = async () => {
        // Silent submit if we have name and at least one contact method
        if (formData.name && (formData.email || formData.phone)) {
            try {
                // Silent submission in background
                submitInquiry(formData);
                localStorage.setItem('pbt_popup_submitted_at', Date.now().toString());
            } catch (err) {
                console.error("Silent submit failed:", err);
            }
        }
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Join WhatsApp Group">
            <div className="flex flex-col md:flex-row -m-6 min-h-[400px]">
                {/* Left Side Branding */}
                <div className="hidden md:flex md:w-2/5 bg-slate-900 relative overflow-hidden items-center justify-center p-8 text-center border-r border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-50"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-xl border border-white/10 shadow-xl shadow-green-500/20">
                            <i className="fab fa-whatsapp text-3xl text-green-500"></i>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">WhatsApp News</h4>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-widest">Get the latest news updates directly on your phone.</p>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="w-full md:w-3/5 p-8 lg:p-10 bg-white">
                    <div className="max-w-md mx-auto space-y-6">
                        <header className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Join Our <span className="text-green-500">WhatsApp</span></h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Fill this form to join our official WhatsApp group and get all news updates.</p>
                        </header>

                        {status.message && (
                            <div className={`p-4 rounded-xl text-xs font-black animate-in slide-in-from-top-2 flex items-center gap-3 border ${
                                status.type === 'success' 
                                ? 'bg-green-50 text-green-600 border-green-100' 
                                : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                                <i className={`fas fa-${status.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Full Name</label>
                                <div className="relative">
                                    <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                                    <input 
                                        name="name"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-red/5 focus:bg-white focus:border-primary-red transition-all text-sm font-bold text-slate-900" 
                                        placeholder="Your Name" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Email Address</label>
                                <div className="relative">
                                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                                    <input 
                                        name="email"
                                        type="email"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-red/5 focus:bg-white focus:border-primary-red transition-all text-sm font-bold text-slate-900" 
                                        placeholder="your@email.com (Optional)" 
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-focus-within:text-primary-red">Phone Number</label>
                                <div className="relative">
                                    <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-red text-xs"></i>
                                    <input 
                                        name="phone"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary-red/5 focus:bg-white focus:border-primary-red transition-all text-sm font-bold text-slate-900" 
                                        placeholder="Phone Number (Optional)" 
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 px-1">* Provide either email or phone</p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-green-600 hover:shadow-2xl hover:shadow-green-500/20 transition-all hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest text-[11px] mt-4 disabled:opacity-70 flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Submitting...
                                    </>
                                ) : (
                                    <>
                                        Join Group <i className="fas fa-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default InquiryPopup;
