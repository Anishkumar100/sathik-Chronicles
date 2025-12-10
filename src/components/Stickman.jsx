import React from 'react';

const Stickman = ({ color = "white", pose = "idle", isFlipped = false }) => {
  const isPunching = pose === "punch";
  const isHurt = pose === "hurt";
  const isBlocking = pose === "block"; // <--- NEW POSE

  const transform = isFlipped ? 'scale(-1, 1)' : 'scale(1, 1)';

  return (
    <svg 
      width="120" 
      height="220" 
      viewBox="0 0 100 200" 
      className="overflow-visible"
      style={{ transform: transform, transformOrigin: 'center' }}
    >
      {/* HEAD */}
      <circle 
        cx={isHurt ? "40" : "50"} 
        cy={isHurt ? "40" : "30"} 
        r="20" 
        stroke={color} 
        strokeWidth="5" 
        fill="#1a1a1a" 
      />

      {/* BODY */}
      <line 
        x1={isHurt ? "40" : "50"} y1={isHurt ? "60" : "50"} 
        x2={isHurt ? "60" : "50"} y2="120" 
        stroke={color} strokeWidth="5" 
      />

      {/* ARMS */}
      {/* Front Arm */}
      <line 
        x1={isHurt ? "40" : "50"} y1={isHurt ? "65" : "70"} 
        // Logic: If blocking, arm goes up to face. If punching, extends out.
        x2={isPunching ? "110" : (isBlocking ? "80" : (isHurt ? "20" : "20"))} 
        y2={isPunching ? "70" : (isBlocking ? "40" : (isHurt ? "50" : "100"))} 
        stroke={color} strokeWidth="5" 
        className="transition-all duration-75"
      />
      {/* Back Arm */}
      <line 
        x1={isHurt ? "40" : "50"} y1={isHurt ? "65" : "70"} 
        x2={isPunching ? "130" : (isBlocking ? "70" : (isHurt ? "80" : "80"))} 
        y2={isPunching ? "65" : (isBlocking ? "30" : (isHurt ? "40" : "100"))} 
        stroke={color} strokeWidth="5" 
        className="transition-all duration-75"
      />

      {/* LEGS */}
      <line 
        x1={isHurt ? "60" : "50"} y1="120" 
        x2={isHurt ? "40" : "30"} y2="190" 
        stroke={color} strokeWidth="5" 
      />
      <line 
        x1={isHurt ? "60" : "50"} y1="120" 
        x2={isHurt ? "80" : "70"} y2="190" 
        stroke={color} strokeWidth="5" 
      />
    </svg>
  );
};

export default Stickman;