import React, { useEffect } from 'react';

const AboutUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <div className="bg-slate-900 pt-20 pb-24 relative overflow-hidden shadow-2xl shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-red/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div className="page-container relative z-20 flex flex-col items-center text-center">
                    <span className="text-primary-red text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 mb-6 inline-block shadow-[0_0_15px_rgba(239,68,68,0.2)]">Learn More</span>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg mb-6 leading-tight">
                        About <span className="text-primary-red">Us</span>
                    </h1>
                </div>
            </div>

            <main className="page-container -mt-10 relative z-30 pb-20">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-700 leading-relaxed max-w-4xl mx-auto prose prose-slate">
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Welcome to PB Tadka</h2>
                    <p className="mb-4">
                        Welcome to PB Tadka, your number one source for all things entertainment, news, and celebrity updates. We're dedicated to providing you the very best content, with an emphasis on quality, accuracy, and engagement.
                    </p>
                    <p className="mb-4">
                        Founded with a passion for delivering timely and engaging stories, PB Tadka has come a long way from its beginnings. When we first started out, our passion for entertainment drove us to start our own business, providing a unique perspective on the world of movies, news, and pop culture.
                    </p>
                    <p className="mb-4">
                        We hope you enjoy our content as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                    </p>
                    <p className="font-bold text-slate-900 mt-8">
                        Sincerely,<br />
                        The PB Tadka Team
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AboutUs;
