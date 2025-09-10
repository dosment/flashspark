
'use client';

import { useEffect, useState } from 'react';

const Confetti = () => {
  const [pieces, setPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 150 }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
        transform: `rotate(${Math.random() * 360}deg)`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 2}s`,
      };
      return <div key={i} className="confetti-piece" style={style} />;
    });
    setPieces(newPieces);
  }, []);

  return (
    <>
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 10px;
          opacity: 0;
          animation: drop linear forwards;
        }

        @keyframes drop {
          0% {
            transform: translateY(0) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
        {pieces}
      </div>
    </>
  );
};

export default Confetti;
