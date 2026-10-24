import React, { useState, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2 } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

const COLORS = [
  { id: 0, name: 'Emerald', bg: 'bg-emerald-500', activeBg: 'bg-emerald-300 shadow-[0_0_30px_#10b981]' },
  { id: 1, name: 'Rose', bg: 'bg-rose-500', activeBg: 'bg-rose-300 shadow-[0_0_30px_#f43f5e]' },
  { id: 2, name: 'Amber', bg: 'bg-amber-400', activeBg: 'bg-amber-200 shadow-[0_0_30px_#fbbf24]' },
  { id: 3, name: 'Cyan', bg: 'bg-cyan-500', activeBg: 'bg-cyan-300 shadow-[0_0_30px_#06b6d4]' },
];

export const SimonGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [streak, setStreak] = useState(0);

  const streakRef = useRef(0);

  const playSequence = useCallback((seq: number[]) => {
    setIsPlayingSeq(true);
    let i = 0;
    const interval = setInterval(() => {
      const colorId = seq[i];
      sound.simonTone(colorId);
      setActivePad(colorId);

      setTimeout(() => {
        setActivePad(null);
      }, 350);

      i++;
      if (i >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPlayingSeq(false);
        }, 400);
      }
    }, 600);
  }, []);

  const addNextToSequence = useCallback((currentSeq: number[]) => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setPlayerIdx(0);
    setTimeout(() => {
      playSequence(newSeq);
    }, 600);
  }, [playSequence]);

  const startGame = () => {
    sound.click();
    streakRef.current = 0;
    setStreak(0);
    setGameState('PLAYING');
    addNextToSequence([]);
  };

  const handlePadClick = (colorId: number) => {
    if (isPlayingSeq || gameState !== 'PLAYING') return;

    sound.simonTone(colorId);
    setActivePad(colorId);
    setTimeout(() => setActivePad(null), 250);

    if (colorId === sequence[playerIdx]) {
      // Correct step
      const nextIdx = playerIdx + 1;
      if (nextIdx === sequence.length) {
        // Round cleared
        sound.score();
        const newStreak = streak + 1;
        streakRef.current = newStreak;
        setStreak(newStreak);
        const points = newStreak * 100;
        onScoreUpdate?.(points);
        if (points > highScore && onNewHighScore) {
          onNewHighScore(points);
        }
        addNextToSequence(sequence);
      } else {
        setPlayerIdx(nextIdx);
      }
    } else {
      // Wrong step - Game Over
      sound.gameOver();
      setGameState('GAME_OVER');
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Streak:</span>
          <span className="text-xl font-bold font-mono text-purple-400">{streak}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>Record: <strong className="font-bold">{Math.max(streak, Math.floor(highScore / 100))}</strong></span>
        </div>

        <button
          onClick={startGame}
          className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>

      {/* Simon Circular Matrix */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-slate-950 rounded-full border-4 border-slate-800 shadow-2xl p-3 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 w-full h-full rounded-full overflow-hidden p-2">
          {COLORS.map(col => {
            const isActive = activePad === col.id;
            return (
              <button
                key={col.id}
                onClick={() => handlePadClick(col.id)}
                disabled={isPlayingSeq || gameState !== 'PLAYING'}
                className={`transition-all duration-150 cursor-pointer ${
                  col.id === 0 ? 'rounded-tl-full' :
                  col.id === 1 ? 'rounded-tr-full' :
                  col.id === 2 ? 'rounded-bl-full' : 'rounded-br-full'
                } ${isActive ? col.activeBg : `${col.bg} opacity-75 hover:opacity-100`}`}
              />
            );
          })}
        </div>

        {/* Center Console Circle */}
        <div className="absolute w-28 h-28 bg-slate-900 border-4 border-slate-800 rounded-full flex flex-col items-center justify-center text-center shadow-inner pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">SIMON</span>
          <span className="text-xl font-black font-mono text-purple-300">
            {gameState === 'PLAYING' ? `${playerIdx + 1}/${sequence.length}` : streak}
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            {isPlayingSeq ? 'LISTENING' : 'REPEAT'}
          </span>
        </div>

        {/* Start Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-full flex flex-col items-center justify-center p-6 text-center z-20">
            <h4 className="text-xl font-black text-white mb-1">SIMON MATRIX</h4>
            <p className="text-[11px] text-slate-400 max-w-[200px] mb-3">
              Remember and repeat the growing tone sequence!
            </p>
            <button
              onClick={startGame}
              className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-full flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-[10px] font-mono uppercase text-rose-400 mb-1">Sequence Broken</span>
            <h4 className="text-xl font-black text-white mb-1">GAME OVER</h4>
            <p className="text-xs text-slate-300 font-mono mb-3">Streak: <strong className="text-purple-400">{streak}</strong></p>
            <button
              onClick={startGame}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 font-mono mt-4 text-center">
        Watch and listen to the pads, then repeat in identical order
      </p>
    </div>
  );
};
