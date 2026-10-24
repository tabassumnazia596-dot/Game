import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

interface Obstacle {
  x: number;
  type: 'LOW_JUMP' | 'HIGH_BEAM';
  w: number;
  h: number;
  y: number;
}

interface Orb {
  x: number;
  y: number;
  collected: boolean;
}

export const RunnerGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);

  const playerRef = useRef({
    y: 200,
    vy: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const frameRef = useRef(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(4.5);
  const animIdRef = useRef<number | null>(null);

  const GROUND_Y = 240;
  const PLAYER_X = 60;
  const PLAYER_W = 28;
  const PLAYER_H = 46;

  const resetGame = useCallback(() => {
    sound.click();
    playerRef.current = {
      y: GROUND_Y - PLAYER_H,
      vy: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0
    };
    obstaclesRef.current = [];
    orbsRef.current = [];
    frameRef.current = 0;
    scoreRef.current = 0;
    speedRef.current = 4.5;
    setScore(0);
    setGameState('PLAYING');
  }, []);

  const jump = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    const p = playerRef.current;
    if (!p.isJumping && !p.isSliding) {
      sound.jump();
      p.vy = -10.5;
      p.isJumping = true;
    }
  }, [gameState]);

  const slide = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    const p = playerRef.current;
    if (!p.isJumping && !p.isSliding) {
      sound.move();
      p.isSliding = true;
      p.slideTimer = 35; // Frames
    }
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
      const p = playerRef.current;

      frameRef.current++;
      scoreRef.current += 1;
      if (frameRef.current % 10 === 0) {
        setScore(scoreRef.current);
        onScoreUpdate?.(scoreRef.current);
      }

      // Increase speed gradually
      if (frameRef.current % 400 === 0 && speedRef.current < 9) {
        speedRef.current += 0.3;
      }

      // Physics
      if (p.isJumping) {
        p.vy += 0.58; // Gravity
        p.y += p.vy;
        if (p.y >= GROUND_Y - PLAYER_H) {
          p.y = GROUND_Y - PLAYER_H;
          p.vy = 0;
          p.isJumping = false;
        }
      }

      if (p.isSliding) {
        p.slideTimer--;
        if (p.slideTimer <= 0) {
          p.isSliding = false;
        }
      }

      // Spawn Obstacles & Orbs
      if (frameRef.current % 90 === 0 && Math.random() < 0.75) {
        const isBeam = Math.random() < 0.45;
        if (isBeam) {
          // Floating high beam: player must SLIDE underneath
          obstaclesRef.current.push({
            x: W,
            type: 'HIGH_BEAM',
            w: 40,
            h: 18,
            y: GROUND_Y - PLAYER_H - 12
          });
        } else {
          // Low barrier: player must JUMP over
          obstaclesRef.current.push({
            x: W,
            type: 'LOW_JUMP',
            w: 24,
            h: 30,
            y: GROUND_Y - 30
          });
        }
      }

      // Spawn Energy Orbs
      if (frameRef.current % 110 === 0 && Math.random() < 0.6) {
        orbsRef.current.push({
          x: W,
          y: GROUND_Y - 60 - Math.random() * 40,
          collected: false
        });
      }

      // Move obstacles & collision check
      const currentH = p.isSliding ? 22 : PLAYER_H;
      const currentY = p.isSliding ? GROUND_Y - 22 : p.y;

      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.x -= speedRef.current;

        // Collision logic
        if (
          PLAYER_X < obs.x + obs.w &&
          PLAYER_X + PLAYER_W > obs.x &&
          currentY < obs.y + obs.h &&
          currentY + currentH > obs.y
        ) {
          sound.gameOver();
          setGameState('GAME_OVER');
          if (scoreRef.current > highScore && onNewHighScore) {
            onNewHighScore(scoreRef.current);
          }
          return;
        }

        if (obs.x < -60) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      // Move and check orbs
      for (let i = orbsRef.current.length - 1; i >= 0; i--) {
        const orb = orbsRef.current[i];
        orb.x -= speedRef.current;

        if (
          !orb.collected &&
          Math.hypot(PLAYER_X + PLAYER_W / 2 - orb.x, currentY + currentH / 2 - orb.y) < 26
        ) {
          orb.collected = true;
          sound.score();
          scoreRef.current += 100;
        }

        if (orb.x < -30) {
          orbsRef.current.splice(i, 1);
        }
      }

      // RENDERING
      ctx.clearRect(0, 0, W, H);

      // Night sky with gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#070914');
      skyGrad.addColorStop(1, '#13122c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Distant City Skyline
      ctx.fillStyle = '#1c1b3a';
      for (let x = 0; x < W; x += 45) {
        const bH = 50 + (Math.sin(x * 0.05) * 20 + 20);
        ctx.fillRect(x, GROUND_Y - bH, 35, bH);
      }

      // Ground Rooftop Platform
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

      // Neon Top Border of Ground
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();

      // Draw Energy Orbs
      for (const orb of orbsRef.current) {
        if (!orb.collected) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw Obstacles
      for (const obs of obstaclesRef.current) {
        if (obs.type === 'LOW_JUMP') {
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = '#fda4af';
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        } else {
          // Beam
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.strokeStyle = '#67e8f9';
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        }
      }

      // Draw Player Runner
      ctx.fillStyle = '#a855f7';
      if (p.isSliding) {
        // Sliding posture
        ctx.fillRect(PLAYER_X, GROUND_Y - 22, PLAYER_W + 12, 22);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(PLAYER_X + PLAYER_W + 2, GROUND_Y - 18, 8, 8);
      } else {
        // Standing / jumping posture
        ctx.fillRect(PLAYER_X, p.y, PLAYER_W, PLAYER_H);
        // Visor
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(PLAYER_X + 16, p.y + 6, 10, 8);
        // Foot trail
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(PLAYER_X - 6, p.y + PLAYER_H - 4, 6, 4);
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [gameState, highScore, onNewHighScore, onScoreUpdate]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') jump();
      if (e.key === 'ArrowDown' || e.key === 's') slide();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump, slide]);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Distance:</span>
          <span className="text-xl font-bold font-mono text-purple-400">{score}m</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>Record: <strong className="font-bold">{Math.max(score, highScore)}m</strong></span>
        </div>

        <button
          onClick={resetGame}
          className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>

      {/* Canvas */}
      <div className="relative w-full aspect-[16/9] max-w-[500px] bg-slate-950 border-2 border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={500}
          height={280}
          className="w-full h-full block"
        />

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-black text-white mb-2">CYBER SPRINT</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Jump over ground barricades. Slide under high laser beams. Collect golden energy cores!
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Launch Sprint
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1">Impact Sustained</span>
            <h3 className="text-3xl font-black text-white mb-2">RUN TERMINATED</h3>
            <p className="text-sm font-mono text-slate-300 mb-1">Final Distance: <span className="text-purple-400 font-bold">{score}m</span></p>
            {score > highScore && (
              <p className="text-xs text-amber-400 font-mono font-bold mb-4">★ New Record Distance! ★</p>
            )}
            <button
              onClick={resetGame}
              className="mt-3 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Sprint Again
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons for Mobile */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[320px] mt-4">
        <button
          onClick={jump}
          className="py-3 px-4 bg-slate-900 active:bg-purple-600 border border-slate-800 rounded-xl flex items-center justify-center gap-2 font-mono font-bold text-sm text-purple-300 shadow cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" /> JUMP
        </button>
        <button
          onClick={slide}
          className="py-3 px-4 bg-slate-900 active:bg-cyan-600 border border-slate-800 rounded-xl flex items-center justify-center gap-2 font-mono font-bold text-sm text-cyan-300 shadow cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" /> SLIDE
        </button>
      </div>
    </div>
  );
};
