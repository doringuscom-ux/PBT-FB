import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
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
                        Privacy <span className="text-primary-red">Policy</span>
                    </h1>
                </div>
            </div>

            <main className="page-container -mt-10 relative z-30 pb-20">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-700 leading-relaxed max-w-4xl mx-auto prose prose-slate">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                    <p className="mb-6">
                        We collect information from you when you register on our site, subscribe to our newsletter, respond to a survey, or fill out a form. 
                        When ordering or registering on our site, as appropriate, you may be asked to enter your name, e-mail address, mailing address, or phone number. You may, however, visit our site anonymously.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
                    <p className="mb-4">Any of the information we collect from you may be used in one of the following ways:</p>
                    <ul className="list-disc pl-6 mb-6">
                        <li>To personalize your experience (your information helps us to better respond to your individual needs)</li>
                        <li>To improve our website (we continually strive to improve our website offerings based on the information and feedback we receive from you)</li>
                        <li>To send periodic emails</li>
                    </ul>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">3. Use of Cookies</h2>
                    <p className="mb-6">
                        Yes. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enables the sites or service providers systems to recognize your browser and capture and remember certain information.
                        We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">4. Third-Party Links</h2>
                    <p className="mb-6">
                        Occasionally, at our discretion, we may include or offer third-party products or services on our website. These third-party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">5. Google AdSense</h2>
                    <p className="mb-6">
                        Some of the ads may be served by Google. Google's use of the DART cookie enables it to serve ads to Users based on their visit to our Site and other sites on the Internet. DART uses "non personally identifiable information" and does NOT track personal information about you, such as your name, email address, physical address, etc. You may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy at http://www.google.com/privacy_ads.html
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">6. Embedded Content (YouTube)</h2>
                    <p className="mb-6">
                        Articles on this site may include embedded content (e.g., YouTube videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.
                        These websites (such as YouTube) may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website. We do not host any of these videos on our servers.
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mb-4">7. Consent</h2>
                    <p className="mb-6">
                        By using our site, you consent to our website's privacy policy.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
