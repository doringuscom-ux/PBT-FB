import React, { useEffect } from 'react';

const Disclaimer = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <div className="bg-slate-900 pt-20 pb-24 relative overflow-hidden shadow-2xl shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-red/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div className="page-container relative z-20 flex flex-col items-center text-center">
                    <span className="text-primary-red text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 mb-6 inline-block shadow-[0_0_15px_rgba(239,68,68,0.2)]">Legal</span>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg mb-6 leading-tight">
                        <span className="text-primary-red">Disclaimer</span>
                    </h1>
                </div>
            </div>

            <main className="page-container -mt-10 relative z-30 pb-20">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-700 leading-relaxed max-w-4xl mx-auto prose prose-slate">
                    <p className="mb-6 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-xl font-bold text-slate-900 mb-4">1. General Information</h2>
                    <p className="mb-6">
                        The information contained on the PB Tadka website (the "Service") is for general information purposes only. PB Tadka assumes no responsibility for errors or omissions in the contents on the Service.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">2. External Links Disclaimer</h2>
                    <p className="mb-6">
                        The PB Tadka website may contain links to external websites that are not provided or maintained by or in any way affiliated with PB Tadka. Please note that the PB Tadka does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">3. Professional Disclaimer</h2>
                    <p className="mb-6">
                        The entertainment, news, and other information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of professional advice.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">4. Embedded Content & YouTube Videos</h2>
                    <p className="mb-6">
                        This website may feature embedded videos and content that are hosted on third-party platforms such as YouTube. We do not host any of these videos on our own servers. All videos embedded on this site are the property of their respective owners and creators. We embed this content strictly for informational and entertainment purposes, adhering to the standard embed functionalities provided by platforms like YouTube. If you are the owner of any content and wish to have it removed, please contact us or the respective hosting platform directly.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">5. Fair Use Notice</h2>
                    <p className="mb-6">
                        This site may contain copyrighted material the use of which has not always been specifically authorized by the copyright owner. We believe this constitutes a 'fair use' of any such copyrighted material as provided for in section 107 of the US Copyright Law.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
                    <p className="mb-6">
                        If you have any questions about this Disclaimer, please contact us.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Disclaimer;
