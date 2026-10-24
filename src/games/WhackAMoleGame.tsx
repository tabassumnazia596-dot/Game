import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Timer, Flame } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

type MoleType = 'NORMAL' | 'GOLDEN' | 'BOMB';

interface Hole {
  id: number;
  active: boolean;
  type: MoleType;
  whacked: boolean;
}

export const WhackAMoleGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [holes, setHoles] = useState<Hole[]>(
    Array.from({ length: 9 }, (_, id) => ({ id, active: false, type: 'NORMAL', whacked: false }))
  );
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const scoreRef = useRef(0);

  const startGame = useCallback(() => {
    sound.click();
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setCombo(0);
    setHoles(Array.from({ length: 9 }, (_, id) => ({ id, active: false, type: 'NORMAL', whacked: false })));
    setGameState('PLAYING');
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            sound.win();
            setGameState('GAME_OVER');
            if (scoreRef.current > highScore && onNewHighScore) {
              onNewHighScore(scoreRef.current);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, highScore, onNewHighScore]);

  // Mole pop loop
  useEffect(() => {
    let popTimer: NodeJS.Timeout;
    if (gameState === 'PLAYING') {
      popTimer = setInterval(() => {
        // Randomly activate 1-2 holes
        const holeIdx = Math.floor(Math.random() * 9);
        const rand = Math.random();
        const type: MoleType = rand < 0.2 ? 'BOMB' : rand < 0.4 ? 'GOLDEN' : 'NORMAL';

        setHoles(prev =>
          prev.map((h, i) =>
            i === holeIdx ? { ...h, active: true, type, whacked: false } : h
          )
        );

        // Hide after 900ms
        setTimeout(() => {
          setHoles(prev =>
            prev.map((h, i) => (i === holeIdx ? { ...h, active: false } : h))
          );
        }, 850);
      }, 750);
    }
    return () => clearInterval(popTimer);
  }, [gameState]);

  const whack = (idx: number) => {
    const h = holes[idx];
    if (!h.active || h.whacked || gameState !== 'PLAYING') return;

    if (h.type === 'BOMB') {
      sound.hit();
      const newScore = Math.max(0, scoreRef.current - 20);
      scoreRef.current = newScore;
      setScore(newScore);
      setCombo(0);
    } else {
      sound.score();
      const points = h.type === 'GOLDEN' ? 30 : 10;
      const newCombo = combo + 1;
      setCombo(newCombo);
      const bonus = newCombo > 5 ? 10 : 0;
      const newScore = scoreRef.current + points + bonus;
      scoreRef.current = newScore;
      setScore(newScore);
      onScoreUpdate?.(newScore);
    }

    setHoles(prev =>
      prev.map((item, i) => (i === idx ? { ...item, whacked: true } : item))
    );
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Score:</span>
          <span className="text-xl font-bold font-mono text-rose-400">{score}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400">
          <Timer className="w-4 h-4" />
          <span>Time: <strong className="font-bold">{timeLeft}s</strong></span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
          <Flame className="w-4 h-4" />
          <span>Combo: <strong className="font-bold">{combo}x</strong></span>
        </div>

        <button
          onClick={startGame}
          className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>

      {/* 3x3 Holes Grid */}
      <div className="relative w-full aspect-square max-w-[360px] bg-slate-950 p-4 rounded-2xl border-2 border-slate-800 shadow-2xl">
        <div className="grid grid-cols-3 gap-3 w-full h-full">
          {holes.map((hole, idx) => (
            <button
              key={hole.id}
              onClick={() => whack(idx)}
              className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-[#13172e] to-[#0a0d1d] flex flex-col items-center justify-center transition-all cursor-pointer ${
                hole.active && !hole.whacked
                  ? hole.type === 'BOMB'
                    ? 'border-rose-500 shadow-[0_0_15px_#f43f5e]'
                    : hole.type === 'GOLDEN'
                    ? 'border-amber-400 shadow-[0_0_15px_#fbbf24]'
                    : 'border-cyan-400 shadow-[0_0_15px_#06b6d4]'
                  : 'border-slate-800/80'
              }`}
            >
              {/* Server Pod Base Hole */}
              <div className="w-16 h-3 bg-slate-950 rounded-full border border-slate-800 absolute bottom-3" />

              {/* Emerging Character */}
              {hole.active && (
                <div
                  className={`text-4xl transition-transform duration-100 ${
                    hole.whacked ? 'scale-75 opacity-60' : 'animate-in slide-in-from-bottom-6'
                  }`}
                >
                  {hole.whacked ? '💥' : hole.type === 'BOMB' ? '💣' : hole.type === 'GOLDEN' ? '👑' : '🤖'}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-black text-white mb-2">CYBER MOLE WHACK</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Whack rogue droids (10 pts) and Golden droids (30 pts). Avoid hazardous bombs (-20 pts)!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Start Whacking
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">Time Elapsed</span>
            <h3 className="text-3xl font-black text-white mb-2">ROUND FINISHED!</h3>
            <p className="text-sm font-mono text-slate-300 mb-4">Total Score: <span className="text-rose-400 font-bold">{score}</span></p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
