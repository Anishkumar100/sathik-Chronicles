import React, { useState } from 'react';
import { useEffect } from 'react';
import RunnerMod from './components/RunnerMod';
import FighterMod from './components/FighterMod';
import Loader from './components/Loader';
import MKOverlay from './components/MKOverlay';
// Assets
import JaniIntro from './assets/JaniIntro.mp4';
import JaniLost from './assets/JaniLost.mp4';
import SathikIntro from './assets/SathikIntro.mp4';
import SathikLost from './assets/SathikLost.mp4';
import SathikOutro from "./assets/SathikOutro.mp4"; 

function App() {
  const [gameState, setGameState] = useState('menu'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  
  // Overlay Control (Parent-side)
  const [showOverlay, setShowOverlay] = useState(false);

  // --- OVERLAY TIMER LOGIC ---
  useEffect(() => {
    const cinematicStates = ['intro_sathik', 'intro_jani', 'cutscene_win', 'cutscene_lose', 'outro'];
    
    if (cinematicStates.includes(gameState)) {
      setShowOverlay(true);
      // Force hide after 2 seconds
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
    }
  }, [gameState]);

  // --- AUDIO UNLOCKER (Safe Version) ---
  const unlockAudio = () => {
    // Prevents "Cannot read property 'state' of null" crash
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }
  };

  // --- FIGHTER SEQUENCE ---
  const startFighterCampaign = () => {
    unlockAudio(); 
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveVideo(SathikIntro);
      setGameState('intro_sathik');
    }, 2000);
  };

  // --- BONUS OUTRO SEQUENCE ---
  const playOutro = () => {
    unlockAudio();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveVideo(SathikOutro);
      setGameState('outro');
    }, 2000);
  };

  const handleVideoEnd = () => {
    if (gameState === 'intro_sathik') {
      setActiveVideo(JaniIntro);
      setGameState('intro_jani');
    } else if (gameState === 'intro_jani') {
      setGameState('fighter');
    } else {
      setGameState('menu');
    }
  };

  // --- GAME OVER LOGIC ---
  const handleGameOver = (result) => {
    if (result === 'win') {
      setActiveVideo(JaniLost);
      setGameState('cutscene_win');
    } else {
      setActiveVideo(SathikLost);
      setGameState('cutscene_lose');
    }
  };

  const startRunner = () => {
    unlockAudio();
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        setGameState('runner');
    }, 2000);
  }

  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden relative font-sans text-white select-none touch-none flex flex-col items-center justify-center">
      
      {isLoading && <Loader />}

      {/* --- MENU --- */}
      {gameState === 'menu' && !isLoading && (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 z-10 relative">
          <div className="absolute inset-0 bg-[url('/assets/background.png')] bg-cover bg-center opacity-30 blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900"></div>
          
          <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-12 text-center italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] z-20 tracking-tighter">
            SATHIK<br/>CHRONICLES
          </h1>
          
          <div className="flex flex-col md:flex-row gap-6 z-20 w-full max-w-4xl px-6 justify-center items-center">
            {/* Runner */}
            <button 
              onClick={startRunner}
              className="group relative w-full md:w-80 py-6 bg-gray-800 border-4 border-gray-600 hover:border-yellow-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-2xl font-black text-white italic tracking-widest uppercase">Endless Run</span>
            </button>

            {/* Fighter */}
            <button 
              onClick={startFighterCampaign}
              className="group relative w-full md:w-80 py-6 bg-gray-800 border-4 border-gray-600 hover:border-red-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-2xl font-black text-white italic tracking-widest uppercase">Fight Mode</span>
            </button>

             {/* Bonus */}
             <button 
              onClick={playOutro}
              className="group relative w-full md:w-80 py-6 bg-gray-800 border-4 border-gray-600 hover:border-purple-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-2xl font-black text-white italic tracking-widest uppercase">Bonus</span>
            </button>
          </div>

          {/* --- FOOTER STAMP --- */}
          <div className="absolute bottom-5 z-50">
            <a 
              href="https://anishkumar-v2.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/40 hover:text-yellow-400 font-bold tracking-[0.2em] text-xs md:text-sm border-b border-transparent hover:border-yellow-400 transition-all cursor-pointer"
            >
              MADE BY ANISH KUMAR
            </a>
          </div>

        </div>
      )}

      {/* --- MODS --- */}
      {gameState === 'runner' && <RunnerMod onEnd={handleGameOver} />}
      {gameState === 'fighter' && <FighterMod onEnd={handleGameOver} />}

      {/* --- VIDEO PLAYER CONTAINER --- */}
      {['intro_sathik', 'intro_jani', 'cutscene_win', 'cutscene_lose', 'outro'].includes(gameState) && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center p-0 md:p-10">
          
          {/* OVERLAYS: Conditionally Rendered by Parent State (Guaranteed Removal) */}
          {showOverlay && (
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                {gameState === 'intro_sathik' && <MKOverlay text="SATHIK" subtext="ENTERING ARENA" color="text-green-500" />}
                {gameState === 'intro_jani' && <MKOverlay text="JANI" subtext="THE SHAITAAN" color="text-purple-500" />}
                {gameState === 'cutscene_win' && <MKOverlay text="VICTORY" subtext="SATHIK WINS" color="text-yellow-500" />}
                {gameState === 'cutscene_lose' && <MKOverlay text="DEFEAT" subtext="TRY AGAIN" color="text-red-600" />}
                {gameState === 'outro' && <MKOverlay text="BONUS" subtext="SPECIAL SCENE" color="text-purple-500" />}
            </div>
          )}

          <div className="relative w-full h-full md:w-auto md:max-w-6xl md:aspect-video md:h-screen md:max-h-screen md:rounded-2xl md:overflow-hidden md:shadow-2xl md:border-4 md:border-gray-800 bg-black flex items-center justify-center">
            
            {isVideoBuffering && (
              <div className="absolute z-40 text-white flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-xs uppercase tracking-widest">Loading...</span>
              </div>
            )}

            <video 
              key={activeVideo} 
              src={activeVideo} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover md:object-contain bg-black"
              onEnded={handleVideoEnd}
              onWaiting={() => setIsVideoBuffering(true)}
              onPlaying={() => setIsVideoBuffering(false)}
            />
            
            <button 
              onClick={handleVideoEnd}
              className="absolute top-6 right-6 z-[70] text-white/70 hover:text-white bg-black/50 hover:bg-black/80 px-4 py-2 rounded text-xs font-bold uppercase tracking-widest border border-white/10 transition-colors backdrop-blur-md"
            >
              Skip Scene &gt;&gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;