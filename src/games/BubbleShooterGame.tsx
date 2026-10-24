import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

const BUBBLE_COLORS = ['#f43f5e', '#38bdf8', '#10b981', '#fbbf24', '#c084fc'];
const RADIUS = 16;
const ROWS = 6;
const COLS = 10;

interface Bubble {
  r: number;
  c: number;
  color: string | null;
  x: number;
  y: number;
}

export const BubbleShooterGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);

  const gridRef = useRef<Bubble[][]>([]);
  const cannonAngleRef = useRef(-Math.PI / 2);
  const currentBulletRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string } | null>(null);
  const nextColorRef = useRef<string>(BUBBLE_COLORS[0]);
  const scoreRef = useRef(0);
  const animIdRef = useRef<number | null>(null);

  const getRandomColor = () => BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

  const initGrid = () => {
    const grid: Bubble[][] = [];
    for (let r = 0; r < 10; r++) {
      grid[r] = [];
      const offset = (r % 2 === 1) ? RADIUS : 0;
      for (let c = 0; c < COLS; c++) {
        const x = c * (RADIUS * 2) + RADIUS + offset + 10;
        const y = r * (RADIUS * 1.75) + RADIUS + 10;
        grid[r][c] = {
          r,
          c,
          x,
          y,
          color: r < ROWS ? getRandomColor() : null
        };
      }
    }
    gridRef.current = grid;
  };

  const resetGame = useCallback(() => {
    sound.click();
    initGrid();
    cannonAngleRef.current = -Math.PI / 2;
    currentBulletRef.current = null;
    nextColorRef.current = getRandomColor();
    scoreRef.current = 0;
    setScore(0);
    setGameState('PLAYING');
  }, []);

  const shootBubble = () => {
    if (gameState !== 'PLAYING' || currentBulletRef.current) return;

    sound.jump();
    const speed = 9;
    const angle = cannonAngleRef.current;
    currentBulletRef.current = {
      x: 180,
      y: 430,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: nextColorRef.current
    };
    nextColorRef.current = getRandomColor();
  };

  // Find connected same-color cluster using BFS
  const findMatches = (startR: number, startC: number, targetColor: string): [number, number][] => {
    const grid = gridRef.current;
    const matches: [number, number][] = [];
    const visited = new Set<string>();
    const queue: [number, number][] = [[startR, startC]];
    visited.add(`${startR}-${startC}`);

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      matches.push([r, c]);

      // Check 6 hexagonal neighbors
      const isOddRow = r % 2 === 1;
      const neighbors: [number, number][] = [
        [r, c - 1], [r, c + 1],
        [r - 1, isOddRow ? c : c - 1], [r - 1, isOddRow ? c + 1 : c],
        [r + 1, isOddRow ? c : c - 1], [r + 1, isOddRow ? c + 1 : c]
      ];

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < 10 && nc >= 0 && nc < COLS) {
          const key = `${nr}-${nc}`;
          if (!visited.has(key) && grid[nr][nc].color === targetColor) {
            visited.add(key);
            queue.push([nr, nc]);
          }
        }
      }
    }

    return matches;
  };

  // Main game loop
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
      const bullet = currentBulletRef.current;

      // Update bullet
      if (bullet) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Bounce walls
        if (bullet.x - RADIUS <= 0) {
          bullet.x = RADIUS;
          bullet.vx = -bullet.vx;
          sound.move();
        } else if (bullet.x + RADIUS >= W) {
          bullet.x = W - RADIUS;
          bullet.vx = -bullet.vx;
          sound.move();
        }

        // Check collision with top or existing bubbles
        let snapped = false;
        let snapR = 0;
        let snapC = 0;

        // Top hit
        if (bullet.y - RADIUS <= 10) {
          snapped = true;
          snapR = 0;
          snapC = Math.max(0, Math.min(COLS - 1, Math.floor(bullet.x / (RADIUS * 2))));
        } else {
          // Check collision with any grid bubble
          for (let r = 0; r < 10 && !snapped; r++) {
            for (let c = 0; c < COLS && !snapped; c++) {
              const cell = gridRef.current[r][c];
              if (cell.color) {
                const dist = Math.hypot(cell.x - bullet.x, cell.y - bullet.y);
                if (dist < RADIUS * 1.8) {
                  // Find nearest empty spot
                  snapped = true;
                  snapR = Math.min(9, r + 1);
                  snapC = c;
                }
              }
            }
          }
        }

        if (snapped) {
          // Clamp & insert bubble into grid
          if (gridRef.current[snapR] && gridRef.current[snapR][snapC]) {
            gridRef.current[snapR][snapC].color = bullet.color;

            // Check match of 3+
            const cluster = findMatches(snapR, snapC, bullet.color);
            if (cluster.length >= 3) {
              sound.score();
              for (const [cr, cc] of cluster) {
                gridRef.current[cr][cc].color = null;
              }
              const gained = cluster.length * 50;
              scoreRef.current += gained;
              setScore(scoreRef.current);
              onScoreUpdate?.(scoreRef.current);

              if (scoreRef.current > highScore && onNewHighScore) {
                onNewHighScore(scoreRef.current);
              }
            } else {
              sound.hit();
            }

            // Check game over if bottom row reached
            if (gridRef.current[9].some(cell => cell.color !== null)) {
              sound.gameOver();
              setGameState('GAME_OVER');
              return;
            }
          }
          currentBulletRef.current = null;
        }
      }

      // RENDERING
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#080a18';
      ctx.fillRect(0, 0, W, H);

      // Render Grid Bubbles
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < COLS; c++) {
          const b = gridRef.current[r]?.[c];
          if (b && b.color) {
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, RADIUS - 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // Render Cannon at bottom
      const cx = 180;
      const cy = 430;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(cannonAngleRef.current);

      // Cannon barrel
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, -6, 36, 12);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(0, -6, 36, 12);
      ctx.restore();

      // Next ready bubble in cannon base
      ctx.fillStyle = nextColorRef.current;
      ctx.beginPath();
      ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Render Flying Bullet
      if (bullet) {
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [gameState, highScore, onNewHighScore, onScoreUpdate]);

  // Aim cannon with mouse or touch
  const handleAim = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const angle = Math.atan2(y - 430, x - 180);
    // Restrict upward angles only
    if (angle < -0.2 && angle > -Math.PI + 0.2) {
      cannonAngleRef.current = angle;
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Score:</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
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
      <div
        onClick={shootBubble}
        className="relative w-full aspect-[4/5] max-w-[360px] bg-slate-950 border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={460}
          onMouseMove={e => handleAim(e.clientX, e.clientY)}
          onTouchMove={e => {
            if (e.touches[0]) handleAim(e.touches[0].clientX, e.touches[0].clientY);
          }}
          className="w-full h-full block"
        />

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-black text-white mb-2">BUBBLE BLAST</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Aim and fire plasma bubbles to match 3 or more identical colors!
            </p>
            <button
              onClick={e => { e.stopPropagation(); resetGame(); }}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Start Blasting
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1">Grid Overwhelmed</span>
            <h3 className="text-3xl font-black text-white mb-2">GAME OVER</h3>
            <p className="text-sm font-mono text-slate-300 mb-4">Total Score: <span className="text-cyan-400 font-bold">{score}</span></p>
            <button
              onClick={e => { e.stopPropagation(); resetGame(); }}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 font-mono mt-3 text-center">
        Move pointer to aim barrel · Click or tap to launch
      </p>
    </div>
  );
};
