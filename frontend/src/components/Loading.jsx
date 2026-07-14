"use client";
import React from 'react';

const Loading = ({ fullScreen = true, progress = 0 }) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center bg-slate-950 z-[2000] overflow-hidden ${fullScreen ? 'fixed inset-0 w-screen h-screen' : 'w-full py-24 rounded-[3rem] my-8'}`}
      style={{ backgroundColor: '#020617', color: 'white', fontFamily: 'sans-serif', ...(fullScreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } : {}) }}
    >
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-red blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-gold blur-[100px] rounded-full opacity-60"></div>
      </div>
      
      <div className="relative group">
        {/* Cinematic Scan Line Animation */}
        <div className="absolute -inset-4 border border-accent-gold/20 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-gold/40 via-accent-gold/10 to-transparent h-1/2 w-full animate-scan"></div>
        </div>

        {/* Logo with Soft Pulse */}
        <div className="relative px-12 py-8 bg-black/40 backdrop-blur-md rounded-2xl border border-accent-gold/10 shadow-2xl animate-pulse-gentle" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
           <img 
              src="/Logo1.png" 
              alt="Loading Logo" 
              className="h-24 md:h-32 w-auto mix-blend-screen filter drop-shadow-[0_0_30px_rgba(255,193,7,0.5)] drop-shadow-[0_0_15px_rgba(211,47,47,0.4)]" 
              style={{ maxHeight: '100px', width: 'auto', margin: '0 auto' }}
           />
        </div>

        {/* corner accents */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-accent-gold rounded-tl-lg opacity-70"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-accent-gold rounded-br-lg opacity-70"></div>
      </div>

      {/* Loading Progress & Text */}
      <div className="mt-16 flex flex-col items-center gap-6 relative z-10">
        <div className="flex flex-col items-center text-center">
            <h2 className="text-sm md:text-base font-black text-white uppercase tracking-[0.6em] mb-2 animate-shimmer" style={{ letterSpacing: '0.6em', textTransform: 'uppercase', fontSize: '14px', margin: '16px 0 8px 0' }}>
                Initializing <span className="text-accent-gold drop-shadow-[0_0_8px_rgba(255,193,7,0.4)]" style={{ color: '#fbbf24' }}>Cinematic</span> Experience
            </h2>
            <p className="text-[10px] md:text-xs font-medium text-white/40 uppercase tracking-[0.4em] font-mono flex items-center gap-3">
                <span className="w-8 h-[1px] bg-white/20"></span>
                Syncing with global vaults
                <span className="w-8 h-[1px] bg-white/20"></span>
            </p>
        </div>

        {/* Premium Progress Bar */}
        <div className="flex flex-col items-center gap-4">
            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
                <div 
                    className="absolute inset-0 bg-gradient-to-r from-primary-red to-accent-gold transition-all duration-500 ease-out origin-left shadow-[0_0_15px_rgba(255,193,7,0.4)]"
                    style={{ width: `${progress}%` }}
                ></div>
                <div className="absolute inset-0 bg-white/20 w-1/4 animate-loading-shimmer"></div>
            </div>
            <div className="text-2xl font-mono font-black text-accent-gold tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,193,7,0.5)]">
                {progress}%
            </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        @keyframes loading-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 4s ease-in-out infinite;
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
        .animate-loading-shimmer {
          animation: loading-shimmer 1.5s linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;
