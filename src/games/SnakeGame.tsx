import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Pause, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  highScore: number;
  onScoreUpdate?: (score: number) => void;
  onNewHighScore?: (score: number) => void;
}

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;

export const SnakeGame: React.FC<Props> = ({ highScore, onScoreUpdate, onNewHighScore }) => {
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
  ]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Direction>('UP');
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(110);
  const nextDirRef = useRef<Direction>('UP');

  // Spawn food not on snake
  const spawnFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let collision = true;
    while (collision) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      collision = currentSnake.some(s => s.x === newFood.x && s.y === newFood.y);
    }
    return newFood!;
  }, []);

  const startGame = () => {
    sound.click();
    const initialSnake: Point[] = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    setSnake(initialSnake);
    setDir('UP');
    nextDirRef.current = 'UP';
    setFood(spawnFood(initialSnake));
    setScore(0);
    setSpeed(110);
    setGameState('PLAYING');
  };

  const handleGameOver = useCallback((finalScore: number) => {
    sound.gameOver();
    setGameState('GAME_OVER');
    if (finalScore > highScore && onNewHighScore) {
      onNewHighScore(finalScore);
    }
  }, [highScore, onNewHighScore]);

  // Main loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = nextDirRef.current;
        setDir(currentDir);

        if (currentDir === 'UP') head.y -= 1;
        if (currentDir === 'DOWN') head.y += 1;
        if (currentDir === 'LEFT') head.x -= 1;
        if (currentDir === 'RIGHT') head.x += 1;

        // Collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleGameOver(score);
          return prevSnake;
        }

        // Collision with self
        if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
          handleGameOver(score);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          sound.score();
          const newScore = score + 10;
          setScore(newScore);
          onScoreUpdate?.(newScore);
          setFood(spawnFood(newSnake));
          if (speed > 55) {
            setSpeed(s => s - 2);
          }
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [gameState, food, score, speed, spawnFood, handleGameOver, onScoreUpdate]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameState === 'PLAYING') {
        setGameState('PAUSED');
        return;
      }
      if (e.key === ' ' && gameState === 'PAUSED') {
        setGameState('PLAYING');
        return;
      }

      if (gameState !== 'PLAYING') return;

      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dir !== 'DOWN') {
        nextDirRef.current = 'UP';
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dir !== 'UP') {
        nextDirRef.current = 'DOWN';
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dir !== 'RIGHT') {
        nextDirRef.current = 'LEFT';
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dir !== 'LEFT') {
        nextDirRef.current = 'RIGHT';
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, gameState]);

  const changeDirection = (newDir: Direction) => {
    sound.move();
    if (newDir === 'UP' && dir !== 'DOWN') nextDirRef.current = 'UP';
    if (newDir === 'DOWN' && dir !== 'UP') nextDirRef.current = 'DOWN';
    if (newDir === 'LEFT' && dir !== 'RIGHT') nextDirRef.current = 'LEFT';
    if (newDir === 'RIGHT' && dir !== 'LEFT') nextDirRef.current = 'RIGHT';
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Score:</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{score}</span>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-mono uppercase">Best:</span>
          <span className="text-lg font-bold font-mono text-amber-400">{Math.max(score, highScore)}</span>
        </div>

        <div className="flex items-center gap-1">
          {gameState === 'PLAYING' && (
            <button
              onClick={() => setGameState('PAUSED')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          )}
          {gameState === 'PAUSED' && (
            <button
              onClick={() => setGameState('PLAYING')}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" /> Resume
            </button>
          )}
          <button
            onClick={startGame}
            className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative w-full aspect-square max-w-[420px] bg-[#0c0d1b] border-2 border-emerald-500/40 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        {/* Cyber grid lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Snake body */}
        {snake.map((segment, idx) => (
          <div
            key={idx}
            className={`absolute rounded-xs transition-all duration-75 ${
              idx === 0
                ? 'bg-emerald-400 shadow-[0_0_10px_#10b981] z-10'
                : 'bg-emerald-600/90'
            }`}
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(segment.x * 100) / GRID_SIZE}%`,
              top: `${(segment.y * 100) / GRID_SIZE}%`
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute rounded-full bg-rose-500 animate-pulse shadow-[0_0_12px_#f43f5e] z-10"
          style={{
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
            left: `${(food.x * 100) / GRID_SIZE}%`,
            top: `${(food.y * 100) / GRID_SIZE}%`
          }}
        />

        {/* Start / Game Over Overlays */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-black text-white mb-2">NEON SNAKE</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Eat energy orbs to expand. Dodge outer boundaries and avoid striking your own cyber tail!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Start Game
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1">System Overload</span>
            <h3 className="text-3xl font-black text-white mb-2">GAME OVER</h3>
            <p className="text-sm text-slate-300 font-mono mb-1">Final Score: <span className="text-emerald-400 font-bold">{score}</span></p>
            {score > highScore && (
              <p className="text-xs text-amber-400 font-mono font-bold mb-4">★ New Local High Score! ★</p>
            )}
            <button
              onClick={startGame}
              className="mt-3 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="grid grid-cols-3 gap-2 w-48 mt-4 md:hidden">
        <div />
        <button
          onClick={() => changeDirection('UP')}
          aria-label="Move Up"
          className="p-3 bg-slate-800 active:bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />
        <button
          onClick={() => changeDirection('LEFT')}
          aria-label="Move Left"
          className="p-3 bg-slate-800 active:bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => changeDirection('DOWN')}
          aria-label="Move Down"
          className="p-3 bg-slate-800 active:bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <button
          onClick={() => changeDirection('RIGHT')}
          aria-label="Move Right"
          className="p-3 bg-slate-800 active:bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
