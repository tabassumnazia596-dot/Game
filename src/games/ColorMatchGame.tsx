import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Check, X, Flame } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

const COLOR_MAP: Record<string, { label: string; hex: string }> = {
  red: { label: 'RED', hex: '#f43f5e' },
  blue: { label: 'BLUE', hex: '#38bdf8' },
  green: { label: 'GREEN', hex: '#10b981' },
  yellow: { label: 'YELLOW', hex: '#fbbf24' },
  purple: { label: 'PURPLE', hex: '#c084fc' }
};

const COLOR_KEYS = Object.keys(COLOR_MAP);

export const ColorMatchGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [wordKey, setWordKey] = useState<string>('red');
  const [colorKey, setColorKey] = useState<string>('blue');
  const [isMatch, setIsMatch] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timerProgress, setTimerProgress] = useState<number>(100);

  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(2400); // ms per prompt

  const generatePrompt = useCallback(() => {
    const match = Math.random() < 0.5;
    const wKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    let cKey = wKey;

    if (!match) {
      const otherKeys = COLOR_KEYS.filter(k => k !== wKey);
      cKey = otherKeys[Math.floor(Math.random() * otherKeys.length)];
    }

    setWordKey(wKey);
    setColorKey(cKey);
    setIsMatch(match);
    setTimerProgress(100);

    // Speed up slightly as score rises
    durationRef.current = Math.max(1100, 2400 - scoreRef.current * 15);
  }, []);

  const handleGameOver = useCallback(() => {
    sound.gameOver();
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('GAME_OVER');
    if (scoreRef.current > highScore && onNewHighScore) {
      onNewHighScore(scoreRef.current);
    }
  }, [highScore, onNewHighScore]);

  const startGame = () => {
    sound.click();
    scoreRef.current = 0;
    streakRef.current = 0;
    durationRef.current = 2400;
    setScore(0);
    setStreak(0);
    setGameState('PLAYING');
    generatePrompt();
  };

  // Timer interval for each prompt
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const intervalStep = 50;
    timerRef.current = setInterval(() => {
      setTimerProgress(prev => {
        const nextVal = prev - (intervalStep / durationRef.current) * 100;
        if (nextVal <= 0) {
          handleGameOver();
          return 0;
        }
        return nextVal;
      });
    }, intervalStep);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, handleGameOver, wordKey, colorKey]);

  const answer = (userSaidMatch: boolean) => {
    if (gameState !== 'PLAYING') return;

    if (timerRef.current) clearInterval(timerRef.current);

    if (userSaidMatch === isMatch) {
      // Correct!
      sound.score();
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      setStreak(newStreak);
      const points = 100 + newStreak * 20;
      const newScore = scoreRef.current + points;
      scoreRef.current = newScore;
      setScore(newScore);
      onScoreUpdate?.(newScore);

      generatePrompt();
    } else {
      // Wrong!
      sound.hit();
      handleGameOver();
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') answer(true);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') answer(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Score:</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{score}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
          <Flame className="w-4 h-4" />
          <span>Streak: <strong className="font-bold">{streak}x</strong></span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Best: <strong className="font-bold">{Math.max(score, highScore)}</strong></span>
        </div>

        <button
          onClick={startGame}
          className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>

      {/* Main Flashcard Arena */}
      <div className="relative w-full aspect-square max-w-[360px] bg-slate-950 p-6 rounded-2xl border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-between">
        {/* Timer Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-75 ${
              timerProgress > 50 ? 'bg-emerald-500' : timerProgress > 25 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${timerProgress}%` }}
          />
        </div>

        {/* Big Word Display */}
        <div className="flex flex-col items-center justify-center my-auto">
          <span className="text-xs font-mono uppercase text-slate-500 tracking-widest mb-3">Does ink match meaning?</span>
          <h2
            className="text-5xl sm:text-6xl font-black font-mono tracking-widest transition-transform duration-100"
            style={{ color: COLOR_MAP[colorKey]?.hex || '#fff' }}
          >
            {COLOR_MAP[wordKey]?.label}
          </h2>
        </div>

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-black text-white mb-2">COLOR REFLEX</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Decide fast! Does the written word match the actual font color?
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Begin Test
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1">Reflex Missed</span>
            <h3 className="text-3xl font-black text-white mb-2">ROUND OVER</h3>
            <p className="text-sm font-mono text-slate-300 mb-4">Total Score: <span className="text-emerald-400 font-bold">{score}</span></p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[360px] mt-4">
        <button
          onClick={() => answer(true)}
          disabled={gameState !== 'PLAYING'}
          className="py-4 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-mono font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Check className="w-6 h-6 stroke-[3]" /> MATCH
        </button>
        <button
          onClick={() => answer(false)}
          disabled={gameState !== 'PLAYING'}
          className="py-4 px-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-mono font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <X className="w-6 h-6 stroke-[3]" /> NO MATCH
        </button>
      </div>

      <p className="text-xs text-slate-500 font-mono mt-3 text-center">
        Tip: Press Left Arrow for MATCH, Right Arrow for NO MATCH
      </p>
    </div>
  );
};
