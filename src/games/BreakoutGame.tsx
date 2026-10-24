import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  alive: boolean;
}

export const BreakoutGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const paddleRef = useRef({ x: 180, w: 80, h: 10 });
  const ballRef = useRef({ x: 200, y: 300, vx: 3.5, vy: -3.5, radius: 6 });
  const bricksRef = useRef<Brick[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const animIdRef = useRef<number | null>(null);

  const BRICK_ROWS = 5;
  const BRICK_COLS = 8;
  const ROW_COLORS = ['#f43f5e', '#fbbf24', '#10b981', '#06b6d4', '#a855f7'];

  const initBricks = () => {
    const bricks: Brick[] = [];
    const brickW = 44;
    const brickH = 14;
    const padding = 5;
    const offsetTop = 40;
    const offsetLeft = 14;

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: offsetLeft + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          w: brickW,
          h: brickH,
          color: ROW_COLORS[r],
          points: (BRICK_ROWS - r) * 10,
          alive: true
        });
      }
    }
    bricksRef.current = bricks;
  };

  const resetGame = useCallback(() => {
    sound.click();
    paddleRef.current = { x: 160, w: 80, h: 10 };
    ballRef.current = { x: 200, y: 310, vx: 3.5 * (Math.random() > 0.5 ? 1 : -1), vy: -3.5, radius: 6 };
    initBricks();
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
  }, []);

  // Main loop
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
      const b = ballRef.current;
      const pad = paddleRef.current;

      // Ball Movement
      b.x += b.vx;
      b.y += b.vy;

      // Wall Bounce
      if (b.x - b.radius <= 0) {
        b.x = b.radius;
        b.vx = -b.vx;
        sound.move();
      } else if (b.x + b.radius >= W) {
        b.x = W - b.radius;
        b.vx = -b.vx;
        sound.move();
      }

      if (b.y - b.radius <= 0) {
        b.y = b.radius;
        b.vy = -b.vy;
        sound.move();
      }

      // Paddle Collision
      if (
        b.y + b.radius >= H - 25 - pad.h &&
        b.y - b.radius <= H - 25 &&
        b.x >= pad.x &&
        b.x <= pad.x + pad.w
      ) {
        sound.jump();
        // Calculate bounce angle depending on hit spot
        const hitOffset = (b.x - (pad.x + pad.w / 2)) / (pad.w / 2);
        b.vx = hitOffset * 4.5;
        b.vy = -Math.abs(b.vy);
      }

      // Brick Collision
      let remaining = 0;
      for (const brick of bricksRef.current) {
        if (!brick.alive) continue;
        remaining++;

        if (
          b.x + b.radius > brick.x &&
          b.x - b.radius < brick.x + brick.w &&
          b.y + b.radius > brick.y &&
          b.y - b.radius < brick.y + brick.h
        ) {
          brick.alive = false;
          b.vy = -b.vy;
          sound.score();
          scoreRef.current += brick.points;
          setScore(scoreRef.current);
          onScoreUpdate?.(scoreRef.current);

          if (scoreRef.current > highScore && onNewHighScore) {
            onNewHighScore(scoreRef.current);
          }
          break;
        }
      }

      // Check all bricks cleared (Win)
      if (remaining === 0) {
        sound.win();
        setGameState('WON');
        return;
      }

      // Bottom boundary (Ball lost)
      if (b.y + b.radius > H) {
        livesRef.current--;
        setLives(livesRef.current);

        if (livesRef.current <= 0) {
          sound.gameOver();
          setGameState('GAME_OVER');
          return;
        } else {
          sound.hit();
          // Reset ball to paddle
          b.x = pad.x + pad.w / 2;
          b.y = H - 50;
          b.vx = 3.5 * (Math.random() > 0.5 ? 1 : -1);
          b.vy = -3.5;
        }
      }

      // RENDERING
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#080a18';
      ctx.fillRect(0, 0, W, H);

      // Draw Bricks
      for (const brick of bricksRef.current) {
        if (!brick.alive) continue;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
      }

      // Draw Paddle
      const padGrad = ctx.createLinearGradient(pad.x, 0, pad.x + pad.w, 0);
      padGrad.addColorStop(0, '#06b6d4');
      padGrad.addColorStop(1, '#a855f7');
      ctx.fillStyle = padGrad;
      ctx.fillRect(pad.x, H - 25 - pad.h, pad.w, pad.h);
      ctx.strokeStyle = '#67e8f9';
      ctx.strokeRect(pad.x, H - 25 - pad.h, pad.w, pad.h);

      // Draw Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [gameState, highScore, onNewHighScore, onScoreUpdate]);

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    paddleRef.current.x = Math.max(0, Math.min(canvas.width - paddleRef.current.w, mouseX - paddleRef.current.w / 2));
  };

  // Touch move handler
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width;
    paddleRef.current.x = Math.max(0, Math.min(canvas.width - paddleRef.current.w, touchX - paddleRef.current.w / 2));
  };

  const movePaddleButtons = (delta: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    paddleRef.current.x = Math.max(0, Math.min(canvas.width - paddleRef.current.w, paddleRef.current.x + delta));
  };

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
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="w-full h-full block cursor-ew-resize touch-none"
        />

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-black text-white mb-2">NEON BREAKOUT</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Move your cyber paddle to bounce the ball and vaporize all defense bricks!
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Start Game
            </button>
          </div>
        )}

        {/* Game Over / Won Overlay */}
        {(gameState === 'GAME_OVER' || gameState === 'WON') && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <span className={`text-xs font-mono uppercase tracking-widest mb-1 ${gameState === 'WON' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {gameState === 'WON' ? 'Wall Destroyed' : 'Hull Depleted'}
            </span>
            <h3 className="text-3xl font-black text-white mb-2">
              {gameState === 'WON' ? 'VICTORY!' : 'GAME OVER'}
            </h3>
            <p className="text-sm font-mono text-slate-300 mb-4">Final Score: <span className="text-cyan-400 font-bold">{score}</span></p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}
      </div>

      {/* Touch Buttons for Mobile */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[280px] mt-4 md:hidden">
        <button
          onClick={() => movePaddleButtons(-35)}
          className="p-3 bg-slate-900 active:bg-cyan-600 border border-slate-800 rounded-xl flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => movePaddleButtons(35)}
          className="p-3 bg-slate-900 active:bg-cyan-600 border border-slate-800 rounded-xl flex items-center justify-center text-white"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
