import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center bg-white px-6 py-20 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-red/10 to-transparent"></div>
      
      {/* Massive Geometric 404 */}
      <div className="relative mb-8 select-none">
        <div className="text-[150px] md:text-[250px] font-black leading-none text-gray-100 flex items-center justify-center tracking-tighter">
          4<span className="text-primary-red/20">0</span>4
        </div>
        
        {/* Overlapping Status Label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-md px-8 py-3 rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(235,32,38,0.15)] transform -rotate-1 translate-y-4">
            <span className="text-primary-red text-xl md:text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <span className="w-3 h-3 bg-primary-red rounded-full animate-pulse shadow-[0_0_10px_rgba(235,32,38,0.5)]"></span>
              Signal Lost
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-xl text-center z-10">
        <h1 className="text-2xl md:text-4xl font-black text-text-dark mb-6 tracking-tight uppercase">
          Transmission Interrupted
        </h1>
        
        <p className="text-gray-400 font-medium mb-12 text-sm md:text-base leading-relaxed uppercase tracking-wide">
          The page you are looking for has been taken off-air or moved to a different frequency. 
          Please return to the main broadcast.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/')}
            className="group relative bg-primary-red text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary-red/20 transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Go to Home Base</span>
            <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            className="px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] text-text-dark hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
          >
            Previous Channel
          </button>
        </div>
      </div>

      {/* Modern Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.01] bg-gradient-to-b from-transparent via-black to-transparent bg-[length:100%_4px] animate-scanline"></div>
    </div>
  );
};

export default NotFound;
