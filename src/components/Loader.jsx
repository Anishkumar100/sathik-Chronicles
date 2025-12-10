import React from 'react';
import sathikLoader from '../assets/sathikTongue.jpeg';

const Loader = () => {
  return (
    // Added bg-black/95 for a slight transparency feel
    <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center">
      
      {/* GLOWING EFFECT CONTAINER */}
      <div className="relative mb-6">
         {/* The Glow behind the image */}
         <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-40 rounded-full animate-pulse"></div>
         
         {/* The Spinning Tongue */}
         <img 
            src={sathikLoader} 
            alt="Loading..." 
            className="relative w-40 h-40 rounded-full border-4 border-yellow-500 animate-spin object-cover shadow-2xl"
         />
      </div>

      <h2 className="text-yellow-400 font-black text-3xl tracking-[0.2em] animate-pulse drop-shadow-lg">
        LOADING...
      </h2>

      {/* FAKE LOADING BAR */}
      <div className="w-64 h-3 bg-gray-800 rounded-full mt-6 border border-gray-600 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 animate-load-bar"></div>
      </div>

      {/* CSS for the loading bar animation */}
      <style>{`
        @keyframes loadBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-load-bar {
          animation: loadBar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;