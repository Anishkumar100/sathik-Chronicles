import React from 'react';

const MKOverlay = ({ text, subtext, color = "text-yellow-500" }) => {
  return (
    <div className="flex flex-col items-center animate-bounce-in">
      <h1 
        className={`text-6xl md:text-8xl font-black italic tracking-tighter uppercase ${color} drop-shadow-[0_5px_5px_rgba(0,0,0,1)] stroke-black text-center px-4`}
        style={{ WebkitTextStroke: '2px black' }}
      >
        {text}
      </h1>
      {subtext && (
        <p className="text-white text-xl md:text-4xl font-bold tracking-[0.2em] md:tracking-[0.5em] mt-2 uppercase bg-black/50 px-4 py-1 rounded">
          {subtext}
        </p>
      )}
      
      {/* Simple entry animation */}
      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(2); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default MKOverlay;