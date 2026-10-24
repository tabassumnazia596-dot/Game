import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Heart, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

interface Bullet {
  x: number;
  y: number;
}

interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  vx: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export const SpaceShooterGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const shipRef = useRef({ x: 180, y: 410, w: 32, h: 32, vx: 0 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean; shoot: boolean }>({ left: false, right: false, shoot: false });
  const frameRef = useRef(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const animIdRef = useRef<number | null>(null);

  const resetGame = useCallback(() => {
    sound.click();
    shipRef.current = { x: 180, y: 410, w: 32, h: 32, vx: 0 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    frameRef.current = 0;
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
  }, []);

  const shoot = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    sound.laser();
    bulletsRef.current.push(
      { x: shipRef.current.x + 8, y: shipRef.current.y - 4 },
      { x: shipRef.current.x + 24, y: shipRef.current.y - 4 }
    );
  }, [gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const loop = () => {
      if (!isMounted) return;

      const W = canvas.width;
      const H = canvas.height;
      const ship = shipRef.current;

      frameRef.current++;

      // Ship movement
      if (keysRef.current.left) ship.x -= 5;
      if (keysRef.current.right) ship.x += 5;
      ship.x = Math.max(10, Math.min(W - ship.w - 10, ship.x));

      // Auto fire on hold space
      if (keysRef.current.shoot && frameRef.current % 14 === 0) {
        shoot();
      }

      // Spawn enemies
      if (frameRef.current % 45 === 0) {
        const enemyW = 28;
        const enemyH = 24;
        enemiesRef.current.push({
          x: Math.random() * (W - enemyW - 40) + 20,
          y: -30,
          w: enemyW,
          h: enemyH,
          hp: 2,
          maxHp: 2,
          vx: (Math.random() - 0.5) * 1.5
        });
      }

      // Move bullets
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];
        b.y -= 8;
        if (b.y < -10) {
          bulletsRef.current.splice(i, 1);
        }
      }

      // Move enemies
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const en = enemiesRef.current[i];
        en.y += 2.2;
        en.x += en.vx;

        // Wall bounce
        if (en.x <= 10 || en.x + en.w >= W - 10) en.vx = -en.vx;

        // Check bullet hits
        for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
          const b = bulletsRef.current[j];
          if (
            b.x > en.x &&
            b.x < en.x + en.w &&
            b.y > en.y &&
            b.y < en.y + en.h
          ) {
            bulletsRef.current.splice(j, 1);
            en.hp--;

            if (en.hp <= 0) {
              sound.score();
              scoreRef.current += 150;
              setScore(scoreRef.current);
              onScoreUpdate?.(scoreRef.current);

              if (scoreRef.current > highScore && onNewHighScore) {
                onNewHighScore(scoreRef.current);
              }

              // Spawn particles
              for (let p = 0; p < 8; p++) {
                particlesRef.current.push({
                  x: en.x + en.w / 2,
                  y: en.y + en.h / 2,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: '#f43f5e',
                  life: 20
                });
              }

              enemiesRef.current.splice(i, 1);
              break;
            }
          }
        }

        // Check ship collision
        if (
          ship.x < en.x + en.w &&
          ship.x + ship.w > en.x &&
          ship.y < en.y + en.h &&
          ship.y + ship.h > en.y
        ) {
          enemiesRef.current.splice(i, 1);
          sound.hit();
          livesRef.current--;
          setLives(livesRef.current);

          if (livesRef.current <= 0) {
            sound.gameOver();
            setGameState('GAME_OVER');
            return;
          }
        } else if (en.y > H) {
          enemiesRef.current.splice(i, 1);
        }
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) particlesRef.current.splice(i, 1);
      }

      // RENDERING
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#050714';
      ctx.fillRect(0, 0, W, H);

      // Starfield background
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 40; s++) {
        const sx = (s * 37 + frameRef.current * 0.5) % W;
        const sy = (s * 53 + frameRef.current * 1.5) % H;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Bullets
      ctx.fillStyle = '#38bdf8';
      for (const b of bulletsRef.current) {
        ctx.fillRect(b.x, b.y, 3, 10);
      }

      // Draw Enemies
      for (const en of enemiesRef.current) {
        ctx.fillStyle = '#f43f5e';
        // Alien Cruiser shape
        ctx.beginPath();
        ctx.moveTo(en.x + en.w / 2, en.y + en.h);
        ctx.lineTo(en.x, en.y);
        ctx.lineTo(en.x + en.w / 2, en.y + 6);
        ctx.lineTo(en.x + en.w, en.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Ship
      ctx.save();
      ctx.translate(ship.x, ship.y);

      // Thruster flame
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(ship.w / 2 - 4, ship.h);
      ctx.lineTo(ship.w / 2, ship.h + 8 + (Math.sin(frameRef.current) * 3));
      ctx.lineTo(ship.w / 2 + 4, ship.h);
      ctx.closePath();
      ctx.fill();

      // Spaceship body
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(ship.w / 2, 0);
      ctx.lineTo(0, ship.h);
      ctx.lineTo(ship.w / 2, ship.h - 8);
      ctx.lineTo(ship.w, ship.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // Draw Particles
      for (const pt of particlesRef.current) {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 2.5, 2.5);
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [gameState, highScore, onNewHighScore, onScoreUpdate, shoot]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
      if (e.key === ' ') {
        keysRef.current.shoot = true;
        shoot();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
      if (e.key === ' ') keysRef.current.shoot = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot]);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Score:</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>Best: <strong className="font-bold">{Math.max(score, highScore)}</strong></span>
        </div>

        <button
          onClick={resetGame}
          className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>

      {/* Canvas */}
      <div className="relative w-full aspect-[4/5] max-w-[380px] bg-slate-950 border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={400}
          height={480}
          className="w-full h-full block"
        />

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-black text-white mb-2">GALAXY RAIDER</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Pilot your starfighter and eliminate alien invaders before they breach defense lines!
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Engage Invaders
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1">Defense Pierced</span>
            <h3 className="text-3xl font-black text-white mb-2">STARFIGHTER DOWN</h3>
            <p className="text-sm font-mono text-slate-300 mb-4">Total Score: <span className="text-cyan-400 font-bold">{score}</span></p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Deploy Again
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[340px] mt-4">
        <button
          onMouseDown={() => { keysRef.current.left = true; }}
          onMouseUp={() => { keysRef.current.left = false; }}
          onTouchStart={() => { keysRef.current.left = true; }}
          onTouchEnd={() => { keysRef.current.left = false; }}
          className="p-3 bg-slate-900 active:bg-cyan-600 border border-slate-800 rounded-xl flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={shoot}
          className="p-3 bg-purple-600 active:bg-purple-500 text-white font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
        >
          <Zap className="w-5 h-5 fill-current" /> FIRE
        </button>
        <button
          onMouseDown={() => { keysRef.current.right = true; }}
          onMouseUp={() => { keysRef.current.right = false; }}
          onTouchStart={() => { keysRef.current.right = true; }}
          onTouchEnd={() => { keysRef.current.right = false; }}
          className="p-3 bg-slate-900 active:bg-cyan-600 border border-slate-800 rounded-xl flex items-center justify-center text-white"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
