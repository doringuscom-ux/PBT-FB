import React, { useEffect } from 'react';

const ImageModal = ({ isOpen, onClose, imageSrc, altText, onNext, onPrev }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle keys to close and navigate
  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-all z-[10001] group"
      >
        <i className="fas fa-times text-xl group-hover:rotate-90 transition-transform"></i>
      </button>

      {/* Navigation Buttons */}
      {onPrev && (
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white bg-white/5 hover:bg-white/20 w-14 h-14 rounded-full flex items-center justify-center transition-all z-[10001] group border border-white/10"
        >
          <i className="fas fa-chevron-left text-2xl group-hover:-translate-x-1 transition-transform"></i>
        </button>
      )}

      {onNext && (
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white bg-white/5 hover:bg-white/20 w-14 h-14 rounded-full flex items-center justify-center transition-all z-[10001] group border border-white/10"
        >
          <i className="fas fa-chevron-right text-2xl group-hover:translate-x-1 transition-transform"></i>
        </button>
      )}

      <div 
        className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageSrc} 
          alt={altText || 'Full View'} 
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
        />
        {altText && (
            <div className="mt-8 text-center text-white font-black uppercase tracking-[0.2em] italic px-4 bg-white/5 backdrop-blur-md py-3 rounded-xl border border-white/10 max-w-lg">
                {altText}
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
