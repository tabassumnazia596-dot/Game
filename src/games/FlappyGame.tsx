import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

export const FlappyGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);

  // Game variables in refs to prevent render lag
  const birdRef = useRef({ y: 150, vy: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const frameCountRef = useRef(0);
  const scoreRef = useRef(0);
  const animIdRef = useRef<number | null>(null);

  const GRAVITY = 0.38;
  const JUMP_FORCE = -6.5;
  const PIPE_SPEED = 2.2;
  const PIPE_SPAWN_RATE = 100;
  const GAP_SIZE = 115;
  const BIRD_RADIUS = 13;

  const resetGame = useCallback(() => {
    sound.click();
    birdRef.current = { y: 150, vy: 0 };
    pipesRef.current = [];
    frameCountRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setGameState('PLAYING');
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'IDLE') {
      resetGame();
      return;
    }
    if (gameState === 'PLAYING') {
      sound.jump();
      birdRef.current.vy = JUMP_FORCE;
    }
  }, [gameState, resetGame]);

  // Game loop
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

      // Physics
      birdRef.current.vy += GRAVITY;
      birdRef.current.y += birdRef.current.vy;

      // Spawn pipes
      frameCountRef.current++;
      if (frameCountRef.current % PIPE_SPAWN_RATE === 0) {
        const minHeight = 40;
        const maxHeight = H - GAP_SIZE - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        const bottomHeight = H - topHeight - GAP_SIZE;
        pipesRef.current.push({
          x: W,
          topHeight,
          bottomHeight,
          passed: false
        });
      }

      // Move pipes
      for (let i = pipesRef.current.length - 1; i >= 0; i--) {
        const pipe = pipesRef.current[i];
        pipe.x -= PIPE_SPEED;

        // Check if bird passed pipe
        if (!pipe.passed && pipe.x + 35 < 70) {
          pipe.passed = true;
          scoreRef.current += 1;
          sound.score();
          setScore(scoreRef.current);
          onScoreUpdate?.(scoreRef.current);
          if (scoreRef.current > highScore && onNewHighScore) {
            onNewHighScore(scoreRef.current);
          }
        }

        // Remove offscreen pipes
        if (pipe.x < -50) {
          pipesRef.current.splice(i, 1);
        }
      }

      // Check collision
      const birdY = birdRef.current.y;
      const birdX = 70;

      // Ceiling and floor
      if (birdY - BIRD_RADIUS < 0 || birdY + BIRD_RADIUS > H) {
        sound.gameOver();
        setGameState('GAME_OVER');
        return;
      }

      // Pipe collisions
      for (const p of pipesRef.current) {
        if (birdX + BIRD_RADIUS > p.x && birdX - BIRD_RADIUS < p.x + 36) {
          if (birdY - BIRD_RADIUS < p.topHeight || birdY + BIRD_RADIUS > H - p.bottomHeight) {
            sound.gameOver();
            setGameState('GAME_OVER');
            return;
          }
        }
      }

      // Rendering
      ctx.clearRect(0, 0, W, H);

      // Cyber background grid
      ctx.fillStyle = '#080a18';
      ctx.fillRect(0, 0, W, H);

      // Faint background cyber lines
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Render Pipes
      for (const p of pipesRef.current) {
        // Top pipe
        const topGrad = ctx.createLinearGradient(p.x, 0, p.x + 36, 0);
        topGrad.addColorStop(0, '#059669');
        topGrad.addColorStop(1, '#10b981');
        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, 0, 36, p.topHeight);
        ctx.strokeStyle = '#34d399';
        ctx.strokeRect(p.x, 0, 36, p.topHeight);

        // Bottom pipe
        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, H - p.bottomHeight, 36, p.bottomHeight);
        ctx.strokeStyle = '#34d399';
        ctx.strokeRect(p.x, H - p.bottomHeight, 36, p.bottomHeight);
      }

      // Render Cyber Drone Bird
      ctx.save();
      ctx.translate(birdX, birdY);
      const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, birdRef.current.vy * 0.08));
      ctx.rotate(angle);

      // Thruster flame
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(-BIRD_RADIUS, 0);
      ctx.lineTo(-BIRD_RADIUS - 8, -3);
      ctx.lineTo(-BIRD_RADIUS - 12, 0);
      ctx.lineTo(-BIRD_RADIUS - 8, 3);
      ctx.closePath();
      ctx.fill();

      // Drone Body
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Drone Visor
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(4, -2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

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
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Score:</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{score}</span>
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

      {/* Game Canvas Container */}
      <div
        onClick={jump}
        className="relative w-full aspect-[4/5] max-w-[360px] bg-slate-950 border-2 border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={450}
          className="w-full h-full block"
        />

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-black text-white mb-2">CYBER BIRD</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Tap screen or press Spacebar to flap upward through electric energy pylons!
            </p>
            <button
              onClick={e => { e.stopPropagation(); resetGame(); }}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Tap To Play
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1">Collision Detected</span>
            <h3 className="text-3xl font-black text-white mb-2">SYSTEM CRASH</h3>
            <p className="text-sm font-mono text-slate-300 mb-1">Pylons Cleared: <span className="text-emerald-400 font-bold">{score}</span></p>
            {score > highScore && (
              <p className="text-xs text-amber-400 font-mono font-bold mb-4">★ New Personal Best! ★</p>
            )}
            <button
              onClick={e => { e.stopPropagation(); resetGame(); }}
              className="mt-3 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Fly Again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 font-mono mt-3 text-center">
        Tap or click anywhere to flap · Spacebar supported
      </p>
    </div>
  );
};
