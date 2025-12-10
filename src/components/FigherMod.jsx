import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import Stickman from './Stickman';

// Import Sounds
import soundPunch from '../assets/punchSound.mp3';
import soundHurt from '../assets/janiHurt.mp3';

const FighterMod = ({ onEnd }) => {
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerPose, setPlayerPose] = useState('idle');
  const [enemyPose, setEnemyPose] = useState('idle');
  const [combo, setCombo] = useState(0);
  const [showHitSpark, setShowHitSpark] = useState(false);
  const [shake, setShake] = useState(0);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [combatTexts, setCombatTexts] = useState([]); 
  const [endMessage, setEndMessage] = useState(null); // For the custom win/lose text

  // Setup Sounds
  const punchAudio = new Howl({ src: [soundPunch], volume: 0.8 });
  const hurtAudio = new Howl({ src: [soundHurt], volume: 1.0 });
  const blockAudio = new Howl({ src: [soundPunch], volume: 0.5, rate: 0.5 }); // Lower pitch for block

  // --- GAME OVER LOGIC ---
  useEffect(() => {
    if (enemyHp <= 0 && !endMessage) {
        setEndMessage({ text: "SHAITAAN HAS GONE TO SLEEP", color: "text-yellow-500" });
        setTimeout(() => onEnd('win'), 3000); // Wait 3s to read message
    }
  }, [enemyHp, onEnd, endMessage]);

  useEffect(() => {
    if (playerHp <= 0 && !endMessage) {
        setEndMessage({ text: "ANOTHER HAND BROKE", color: "text-red-600" });
        setTimeout(() => onEnd('lose'), 3000);
    }
  }, [playerHp, onEnd, endMessage]);

  // Helper to add floating text
  const spawnText = (text, color = "text-white", xOffset = 0) => {
    const id = Date.now() + Math.random();
    setCombatTexts(prev => [...prev, { id, text, color, xOffset }]);
    setTimeout(() => {
      setCombatTexts(prev => prev.filter(t => t.id !== id));
    }, 800);
  };

  // --- PLAYER ACTIONS ---

  const handleBlock = () => {
    if (playerPose !== 'idle' || playerHp <= 0 || enemyHp <= 0) return;
    
    setPlayerPose('block');
    // Block lasts for 500ms (Timing based skill)
    setTimeout(() => {
        if (playerHp > 0) setPlayerPose('idle');
    }, 500);
  };

  const handleAttack = () => {
    if (playerPose !== 'idle' || playerHp <= 0 || enemyHp <= 0) return;

    setPlayerPose('punch');
    punchAudio.play();

    // Enemy Block Chance (20%)
    const isBlocked = Math.random() < 0.20;
    const isCrit = !isBlocked && Math.random() < 0.20; // 20% Crit chance
    
    let damage = Math.floor(Math.random() * 8) + 10; // Base damage increased
    if (isCrit) damage *= 2;
    if (isBlocked) damage = 0;

    setTimeout(() => {
        if (isBlocked) {
            setEnemyPose('block');
            spawnText("BLOCKED", "text-blue-400", 50);
            blockAudio.play();
        } else {
            setEnemyHp(h => Math.max(0, h - damage));
            setEnemyPose('hurt');
            setShake(20);
            setCameraZoom(1.05); 
            setShowHitSpark(true);
            setCombo(c => c + 1);
            hurtAudio.play();
            spawnText(isCrit ? `CRITICAL -${damage}` : `-${damage}`, isCrit ? "text-red-500 font-black text-5xl" : "text-yellow-400 text-3xl", 50);
        }

        setTimeout(() => setShowHitSpark(false), 150);
        setTimeout(() => { setShake(0); setCameraZoom(1); }, 100);
        setTimeout(() => setEnemyPose('idle'), 250); 
    }, 100);

    setTimeout(() => setPlayerPose('idle'), 300);

    // --- ENEMY AI (RIGOROUS MODE) ---
    // If enemy is hurt, they retaliate FAST
    const reactionTime = enemyHp < 50 ? 300 : 600; 
    
    setTimeout(() => {
        if (enemyHp > 0) { 
             // 70% chance to attack back immediately
             if (Math.random() < 0.7) enemyAttack();
        }
    }, reactionTime);
  };

  const enemyAttack = () => {
      if (enemyHp <= 0) return;

      setEnemyPose('punch');
      punchAudio.play();
      
      // Rigorous Damage: 15 to 25
      const enemyDmg = Math.floor(Math.random() * 10) + 15;

      setTimeout(() => {
          // CHECK IF PLAYER IS BLOCKING
          if (playerPose === 'block') {
             spawnText("BLOCKED!", "text-blue-400 font-bold", -50);
             blockAudio.play();
             setShake(5);
             // No Damage taken
          } else {
             // Hit!
             setPlayerHp(h => Math.max(0, h - enemyDmg));
             setPlayerPose('hurt');
             setShake(30); // Heavy shake on impact
             setCombo(0); 
             spawnText(`-${enemyDmg}`, "text-red-600 font-black text-4xl", -50);
             hurtAudio.play();
             
             // Enrage: If Enemy is low, they might Combo (Attack again instantly)
             if (enemyHp < 40 && Math.random() < 0.5) {
                setTimeout(enemyAttack, 400); // Double hit!
             }
          }

          setTimeout(() => setShake(0), 100);
          // Only reset to idle if not blocking manually
          if (playerPose !== 'block') {
             setTimeout(() => setPlayerPose('idle'), 250);
          }
      }, 100);

      setTimeout(() => setEnemyPose('idle'), 300);
  };

  return (
    <motion.div 
      className="relative w-full h-full bg-slate-900 overflow-hidden select-none"
      animate={{ 
          x: [0, -shake, shake, 0], 
          y: [0, shake/2, -shake/2, 0],
          scale: cameraZoom
      }}
      transition={{ duration: 0.05 }}
    >
      {/* --- CRT SCANLINE --- */}
      <div className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* --- CUSTOM END MESSAGE OVERLAY --- */}
      <AnimatePresence>
        {endMessage && (
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
            >
                <h1 className={`text-4xl md:text-6xl font-black italic text-center px-4 ${endMessage.color} drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]`}>
                    {endMessage.text}
                </h1>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- HUD --- */}
      <div className="absolute top-2 w-full px-2 md:px-6 z-20">
         <div className="flex justify-between items-start max-w-5xl mx-auto">
            {/* Player Bar */}
            <div className="w-[45%]">
                <div className="flex items-center gap-2 mb-1">
                     <span className="text-green-400 font-black text-sm md:text-xl italic tracking-wider">SATHIK</span>
                </div>
                <div className={`w-full h-4 md:h-8 bg-gray-900 border-2 border-white skew-x-[-20deg] relative overflow-hidden shadow-[0_0_15px_rgba(74,222,128,0.5)] ${playerHp < 30 ? 'animate-pulse' : ''}`}>
                    <div className="absolute h-full bg-red-900 w-full"></div>
                    <div className="absolute h-full bg-red-600 transition-all duration-1000 ease-out" style={{ width: `${playerHp}%` }} />
                    <div className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300 ease-out" style={{ width: `${playerHp}%` }} />
                </div>
            </div>

            {/* VS */}
            <div className="relative">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 italic mt-1 animate-bounce">VS</div>
            </div>

            {/* Enemy Bar */}
            <div className="w-[45%] flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                     <span className="text-purple-400 font-black text-sm md:text-xl italic tracking-wider">JANI</span>
                </div>
                <div className={`w-full h-4 md:h-8 bg-gray-900 border-2 border-white skew-x-[20deg] relative overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.5)] ${enemyHp < 30 ? 'animate-pulse border-red-500' : ''}`}>
                     <div className="absolute h-full bg-red-900 w-full"></div>
                     <div className="absolute h-full right-0 bg-red-600 transition-all duration-1000 ease-out" style={{ width: `${enemyHp}%` }} />
                     <div className="absolute h-full right-0 bg-gradient-to-l from-purple-600 to-purple-400 transition-all duration-300 ease-out" style={{ width: `${enemyHp}%` }} />
                </div>
            </div>
         </div>
      </div>

      {/* --- COMBO --- */}
      <AnimatePresence>
        {combo > 1 && (
            <motion.div 
                initial={{ scale: 0, opacity: 0, rotate: -10 }}
                animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                exit={{ scale: 3, opacity: 0 }}
                className="absolute top-24 left-10 z-10 pointer-events-none"
            >
                <div className="text-6xl font-black text-yellow-500 italic drop-shadow-[4px_4px_0_rgba(0,0,0,1)] stroke-black" style={{ WebkitTextStroke: '2px black' }}>
                    {combo} HITS!
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- ARENA --- */}
      <div className="absolute bottom-0 w-full h-[25%] bg-gradient-to-t from-gray-900 to-gray-800 border-t-4 border-gray-600"></div>

      {/* --- CHARACTERS --- */}
      <div className="absolute bottom-[20%] w-full flex justify-between px-8 md:px-32 items-end pointer-events-none">
          {/* SATHIK */}
          <motion.div 
            animate={{ x: playerPose === 'punch' ? 100 : 0 }} 
            className="relative z-10"
          >
             <div className="scale-90 md:scale-110 origin-bottom-left filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                <Stickman color="#4ade80" pose={playerPose} />
             </div>
             
             {/* Floating Text */}
             {combatTexts.filter(t => t.xOffset < 0).map(t => (
                 <motion.div 
                    key={t.id}
                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ y: -100, opacity: 0, scale: 1.2 }}
                    className={`absolute -top-20 left-10 ${t.color} font-black text-3xl whitespace-nowrap drop-shadow-md z-50`}
                 >
                    {t.text}
                 </motion.div>
             ))}
          </motion.div>

          {/* HIT SPARK */}
          {showHitSpark && (
              <div className="absolute left-1/2 bottom-32 -translate-x-1/2 z-40">
                  <div className="w-40 h-40 bg-yellow-200 rounded-full blur-xl opacity-90 animate-ping"></div>
              </div>
          )}

          {/* JANI */}
          <motion.div 
             className="relative z-0"
             animate={{ x: enemyPose === 'punch' ? -100 : 0 }} 
          >
             <div className="scale-90 md:scale-110 origin-bottom-right filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                <Stickman color="#a855f7" pose={enemyPose} isFlipped={true} />
             </div>

             {/* Enemy Floating Text */}
             {combatTexts.filter(t => t.xOffset > 0).map(t => (
                 <motion.div 
                    key={t.id}
                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ y: -100, opacity: 0, scale: 1.2 }}
                    className={`absolute -top-20 right-10 ${t.color} font-black text-3xl whitespace-nowrap drop-shadow-md z-50`}
                 >
                    {t.text}
                 </motion.div>
             ))}
          </motion.div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="absolute bottom-8 right-6 z-30 touch-manipulation flex gap-4">
        {/* BLOCK BUTTON */}
        <button 
            onClick={handleBlock}
            className="group relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-4 border-white/50 shadow-[0_0_20px_rgba(59,130,246,0.6)] active:scale-90 transition-all overflow-hidden flex items-center justify-center"
        >
             <span className="text-white font-black italic text-sm md:text-xl drop-shadow-md">BLOCK</span>
        </button>

        {/* FIGHT BUTTON */}
        <button 
            onClick={handleAttack}
            className="group relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-4 border-white/50 shadow-[0_0_30px_rgba(255,0,0,0.6)] active:scale-90 transition-all overflow-hidden"
        >
            <div className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-20 animate-pulse"></div>
            <span className="relative z-10 text-xl md:text-3xl font-black italic tracking-wider text-white drop-shadow-lg group-active:rotate-6 block transition-transform">FIGHT</span>
        </button>
      </div>

    </motion.div>
  );
};

export default FighterMod;