import React, { useState } from 'react';
import { submitInquiry } from '../api';

const SubmitContent = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'News',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const categories = [
        { id: 'News', name: 'Exclusive News', icon: 'fa-newspaper', color: 'from-blue-600 to-blue-400' },
        { id: 'Movie', name: 'Movie Promotion', icon: 'fa-film', color: 'from-purple-600 to-purple-400' },
        { id: 'Advertising', name: 'Brand Ads', icon: 'fa-ad', color: 'from-green-600 to-green-400' },
        { id: 'Other', name: 'Other Inquiry', icon: 'fa-comment-alt', color: 'from-slate-600 to-slate-400' }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await submitInquiry(formData);
            setStatus({ type: 'success', message: 'Successfully submitted! Our team will contact you soon.' });
            setFormData({ name: '', email: '', phone: '', type: 'News', message: '' });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to submit. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-red/10 to-transparent pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[10%] left-[-10%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="page-container relative z-10 pt-12 md:pt-20">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center space-y-6 mb-16 px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-bounce">
                        <span className="w-2 h-2 rounded-full bg-accent-gold"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold">Partner With Us</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                        Submit Your <span className="inline-block px-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-yellow-200">Exclusive</span> Content
                    </h1>
                    <p className="text-slate-400 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                        Have high-quality news, a movie to promote, or want to advertise your brand on <span className="inline-block px-1 mr-1.5 text-white font-bold italic">PB TADKA?</span> Fill the form below and let's work together.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                    {/* Benefits Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl space-y-8">
                            <h3 className="text-xl font-black uppercase tracking-tight italic">Why Collaborate?</h3>

                            <div className="space-y-6">
                                {[
                                    { title: 'Huge Audience', desc: 'Reach millions of cinema lovers across the globe.', icon: 'fa-users' },
                                    { title: 'Instant Impact', desc: 'Your content goes live to our active news feed.', icon: 'fa-bolt' },
                                    { title: 'Social Reach', desc: 'Content synced across all our social platforms.', icon: 'fa-share-alt' }
                                ].map((benefit, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent-gold group-hover:text-black transition-all duration-300">
                                            <i className={`fas ${benefit.icon}`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white uppercase text-xs tracking-widest">{benefit.title}</h4>
                                            <p className="text-slate-500 text-[11px] font-medium leading-relaxed mt-1">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Join our WhatsApp</p>
                                    <a
                                        href="https://wa.me/919041266297"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 no-underline"
                                    >
                                        <i className="fab fa-whatsapp text-sm"></i> Connect Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[40px] p-8 md:p-12 text-slate-900 shadow-2xl relative overflow-hidden">
                            {/* Form Header */}
                            <div className="mb-10 space-y-2">
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Submission Form</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">General turn-around time is 1-2 hours.</p>
                            </div>

                            {status.message && (
                                <div className={`mb-8 p-4 rounded-2xl text-xs font-black flex items-center gap-3 border animate-in slide-in-from-top-4 ${status.type === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                    <i className={`fas fa-${status.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <input
                                        name="name" required value={formData.name} onChange={handleChange}
                                        placeholder="Enter your name"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/10 transition-all font-bold text-sm"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        name="email" type="email" required value={formData.email} onChange={handleChange}
                                        placeholder="your@email.com"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/10 transition-all font-bold text-sm"
                                    />
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                                    <input
                                        name="phone" required value={formData.phone} onChange={handleChange}
                                        placeholder="+91 00000 00000"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/10 transition-all font-bold text-sm"
                                    />
                                </div>

                                {/* Category Select */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Content Category</label>
                                    <select
                                        name="type" value={formData.type} onChange={handleChange}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-accent-gold transition-all font-black text-xs uppercase tracking-widest"
                                    >
                                        <option value="News">Exclusive News Submission</option>
                                        <option value="Movie">Movie Promotion Inquiry</option>
                                        <option value="Advertising">Advertising & Sponsorship</option>
                                        <option value="Other">Other Collaboration</option>
                                    </select>
                                </div>

                                {/* Message Input */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Describe Your Content</label>
                                    <textarea
                                        name="message" required value={formData.message} onChange={handleChange}
                                        placeholder="Please provide details about what you want to upload or promote..."
                                        rows="5"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/10 transition-all font-bold text-sm resize-none"
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit" disabled={isLoading}
                                        className="w-full py-5 bg-slate-900 hover:bg-accent-gold hover:text-black text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <i className="fas fa-circle-notch fa-spin"></i> Processing...
                                            </>
                                        ) : (
                                            <>
                                                Submit Request <i className="fas fa-paper-plane"></i>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitContent;
