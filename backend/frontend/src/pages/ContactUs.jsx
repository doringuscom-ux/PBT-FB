import React, { useEffect } from 'react';

const ContactUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            {/* Cinematic Header Block */}
            <div className="bg-slate-900 pt-20 pb-24 relative overflow-hidden shadow-2xl shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-red/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div className="page-container relative z-20 flex flex-col items-center text-center">
                    <span className="text-primary-red text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 mb-6 inline-block shadow-[0_0_15px_rgba(239,68,68,0.2)]">Get In Touch</span>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg mb-6 leading-tight">
                        Contact <span className="text-primary-red">PB Tadka</span>
                    </h1>
                    
                    <p className="text-slate-400 text-sm md:text-base font-bold uppercase tracking-widest mt-2 max-w-2xl mx-auto leading-relaxed">
                        Have a story tip, business inquiry, or just want to say hello? We are always listening.
                    </p>
                </div>
            </div>

            {/* Contact Details Grid */}
            <main className="page-container -mt-10 relative z-30 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    
                    {/* Email Card */}
                    <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                            <i className="fas fa-envelope-open-text text-3xl text-primary-red"></i>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Email</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6">Send us an email anytime.</p>
                        <a href="mailto:contact@pbtadka.com" className="text-lg font-bold text-primary-red hover:underline decoration-2 underline-offset-4 line-clamp-1">pbtadka.com@gmail.com</a>
                    </div>
                    
                    {/* Phone Card */}
                    <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                            <i className="fas fa-mobile-alt text-4xl text-blue-500"></i>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Phone Number</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6">Call us for direct assistance.</p>
                        <a href="tel:+919876543210" className="text-lg font-bold text-blue-600 hover:underline decoration-2 underline-offset-4">+91 9041266297</a>
                    </div>

                    {/* WhatsApp Card */}
                    <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                            <i className="fab fa-whatsapp text-4xl text-green-500"></i>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">WhatsApp</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6">Message us on WhatsApp.</p>
                        <a href="https://wa.me/9041266297" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-green-600 hover:underline decoration-2 underline-offset-4">+91 9041266297</a>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ContactUs;
