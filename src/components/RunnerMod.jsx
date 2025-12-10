import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

// Import Assets
import screamSound from '../assets/sathikScream.mp3';
import autoSoundFile from '../assets/AutoSound.mp3'; 
import sathikImage from "../assets/sathikTongue.jpeg"; 
import autoImage from "../assets/yellowAuto.png";

const RunnerMod = ({ onEnd }) => {
  const [score, setScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(2.2);

  // --- AUDIO SETUP (Moved INSIDE to fix warning) ---
  const screamAudioRef = useRef(null);
  const autoAudioRef = useRef(null);

  useEffect(() => {
    screamAudioRef.current = new Howl({ src: [screamSound] });
    autoAudioRef.current = new Howl({ 
        src: [autoSoundFile], 
        volume: 0.6,
        rate: 1.0
    });

    // Cleanup when leaving the game
    return () => {
        if (autoAudioRef.current) autoAudioRef.current.unload();
        if (screamAudioRef.current) screamAudioRef.current.unload();
    };
  }, []);

  // --- CONTROLS ---
  const handleInput = (e) => {
    if (e) e.stopPropagation();

    if (!gameStarted) {
      setGameStarted(true);
      playAutoSound(); 
      return;
    }
    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 750); 
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        handleInput();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isJumping]); 

  // --- AUDIO HELPER ---
  const playAutoSound = () => {
      if (!autoAudioRef.current) return;
      
      autoAudioRef.current.stop();
      autoAudioRef.current.play();
      setTimeout(() => {
          if (autoAudioRef.current) autoAudioRef.current.fade(0.6, 0, 200);
      }, 800);
  };

  // --- GAME LOOP ---
  useEffect(() => {
    if (!gameStarted) return;

    if (score > 0 && score % 300 === 0) {
        setGameSpeed(prev => Math.max(0.9, prev - 0.1)); 
    }

    const loop = setInterval(() => {
      const sathik = document.getElementById('sathik-player')?.getBoundingClientRect();
      const auto = document.getElementById('auto-enemy')?.getBoundingClientRect();

      if (sathik && auto) {
        // Hitbox logic
        const graceX = auto.width * 0.25; 
        const graceY = auto.height * 0.35; 

        const horizontalCrash = 
            sathik.right > (auto.left + graceX) && 
            sathik.left < (auto.right - graceX);
            
        const verticalCrash = 
            sathik.bottom > (auto.top + graceY);

        if (horizontalCrash && verticalCrash) {
          clearInterval(loop);
          handleCrash();
        } else {
            setScore(prev => prev + 1);
        }
      }
    }, 50);

    return () => clearInterval(loop);
  }, [gameStarted, score]); 

  const handleCrash = () => {
      screamAudioRef.current?.play();
      autoAudioRef.current?.stop();
      onEnd('lose');
  };

  const handleAnimationRepeat = () => {
      playAutoSound();
  };

  return (
    <div 
        className="relative w-full h-full bg-gray-900 overflow-hidden cursor-pointer select-none touch-manipulation" 
        onMouseDown={handleInput}
        onTouchStart={handleInput}
    >
      {/* HUD */}
      <div className="absolute top-6 right-6 z-30 flex flex-col items-end pointer-events-none">
         <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 shadow-lg">
             <span className="text-gray-300 text-xs font-bold uppercase tracking-widest mr-2">Distance</span>
             <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 italic">
                 {Math.floor(score / 10)}m
             </span>
         </div>
      </div>

      {/* Start Overlay */}
      {!gameStarted && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-40 animate-pulse backdrop-blur-sm">
           <h2 className="text-white text-5xl font-black italic uppercase mb-4 drop-shadow-lg text-center">Ready?</h2>
           <p className="text-yellow-400 text-xl font-bold tracking-widest bg-black/60 px-8 py-3 rounded-full border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
               TAP ANYWHERE
           </p>
        </div>
      )}

      {/* Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-gray-900"></div>
      
      {/* Road */}
      <div className="absolute bottom-0 w-full h-[35%] bg-gray-800 border-t-8 border-yellow-600 shadow-[0_-20px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')]"></div>
        <div className="w-full h-full flex justify-center mt-8">
             <div className="w-full h-4 relative overflow-hidden">
                 <div className={`absolute top-0 left-0 w-[200%] h-full flex gap-20 ${gameStarted ? 'animate-road-scroll' : ''}`}>
                      {[...Array(20)].map((_, i) => (
                          <div key={i} className="w-32 h-4 bg-white/50 skew-x-[-45deg]"></div>
                      ))}
                 </div>
             </div>
        </div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/40 z-20"></div>

      {/* Player */}
      <img
        id="sathik-player" 
        src={sathikImage}
        className={`absolute left-8 md:left-32 bottom-[15%] w-20 h-20 md:w-28 md:h-28 object-cover rounded-full border-4 border-white shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out z-30 ${isJumping ? '-translate-y-40 md:-translate-y-48 rotate-12' : 'translate-y-0 rotate-0'}`}
        alt="Player"
      />

      {/* Enemy */}
      <div 
        id="auto-enemy"
        className={`absolute bottom-[12%] w-40 h-28 md:w-60 md:h-40 z-30 ${gameStarted ? 'animate-slide-left' : 'translate-x-[200vw]'}`}
        onAnimationIteration={handleAnimationRepeat}
        style={{ animationDuration: `${gameSpeed}s` }}
      >
         <img 
            src={autoImage} 
            className="w-full h-full object-contain drop-shadow-2xl filter brightness-110"
            alt="Obstacle"
         />
         <div className="absolute top-1/2 left-0 w-10 h-10 bg-yellow-200 blur-xl opacity-60"></div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(120vw); }
          to { transform: translateX(-400px); }
        }
        .animate-slide-left {
          animation-name: slideLeft;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes roadScroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
        }
        .animate-road-scroll {
            animation: roadScroll 0.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default RunnerMod;