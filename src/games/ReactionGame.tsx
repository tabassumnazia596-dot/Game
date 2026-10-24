import React, { useState, useRef } from 'react';
import { RotateCcw, Trophy, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

type Stage = 'IDLE' | 'WAITING_GREEN' | 'CLICK_NOW' | 'TOO_EARLY' | 'ROUND_RESULT' | 'FINAL_SUMMARY';

export const ReactionGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [stage, setStage] = useState<Stage>('IDLE');
  const [currentMs, setCurrentMs] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    sound.click();
    setStage('WAITING_GREEN');
    setCurrentMs(null);

    // Random delay between 1.5s and 4.5s
    const delay = Math.floor(Math.random() * 3000) + 1500;
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setStage('CLICK_NOW');
      sound.simonTone(3);
    }, delay);
  };

  const handleBoxClick = () => {
    if (stage === 'IDLE' || stage === 'ROUND_RESULT' || stage === 'TOO_EARLY') {
      startRound();
      return;
    }

    if (stage === 'WAITING_GREEN') {
      // Clicked too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      sound.hit();
      setStage('TOO_EARLY');
      return;
    }

    if (stage === 'CLICK_NOW') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      sound.score();
      setCurrentMs(elapsed);
      const newHistory = [...history, elapsed];
      setHistory(newHistory);

      if (newHistory.length >= 5) {
        // Finished 5 rounds
        setStage('FINAL_SUMMARY');
        const avg = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length);
        const points = Math.max(100, Math.round(2000 - avg * 3));
        onScoreUpdate?.(points);
        if (points > highScore && onNewHighScore) {
          onNewHighScore(points);
        }
      } else {
        setStage('ROUND_RESULT');
      }
    }
  };

  const resetAll = () => {
    sound.click();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStage('IDLE');
    setHistory([]);
    setCurrentMs(null);
  };

  const getTier = (ms: number) => {
    if (ms < 190) return { label: 'GODLIKE REFLEX', color: 'text-amber-400' };
    if (ms < 230) return { label: 'ESPORTS PRO', color: 'text-purple-400' };
    if (ms < 280) return { label: 'FAST GAMER', color: 'text-cyan-400' };
    if (ms < 350) return { label: 'AVERAGE REFLEX', color: 'text-emerald-400' };
    return { label: 'SLEEPY TURTLE', color: 'text-rose-400' };
  };

  const avgMs = history.length > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : 0;

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="font-mono text-xs text-slate-400">
          Trial: <strong className="text-cyan-400">{Math.min(history.length + 1, 5)}/5</strong>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Avg: <strong className="text-amber-400">{avgMs ? `${avgMs}ms` : '--'}</strong></span>
        </div>

        <button
          onClick={resetAll}
          className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Main Clickable Reflex Pad */}
      <div
        onClick={handleBoxClick}
        className={`w-full aspect-[4/3] max-w-[380px] rounded-2xl border-2 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 shadow-2xl relative overflow-hidden ${
          stage === 'WAITING_GREEN'
            ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
            : stage === 'CLICK_NOW'
            ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_50px_#10b981]'
            : stage === 'TOO_EARLY'
            ? 'bg-amber-950/80 border-amber-500'
            : 'bg-slate-950 border-slate-800 hover:border-purple-500/60'
        }`}
      >
        {stage === 'IDLE' && (
          <div className="flex flex-col items-center animate-in zoom-in-95">
            <Zap className="w-12 h-12 text-purple-400 mb-2" />
            <h3 className="text-2xl font-black text-white mb-1">REACTION TEST</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-3">
              Click anywhere inside this box to begin. Wait for GREEN, then click instantly!
            </p>
            <span className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold font-mono">
              Click to Start
            </span>
          </div>
        )}

        {stage === 'WAITING_GREEN' && (
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">🛑</span>
            <h3 className="text-2xl font-black text-rose-300 mb-1">WAIT FOR GREEN...</h3>
            <p className="text-xs text-rose-200/70 font-mono">Do not click yet!</p>
          </div>
        )}

        {stage === 'CLICK_NOW' && (
          <div className="flex flex-col items-center animate-bounce">
            <Zap className="w-14 h-14 text-slate-950 mb-1 stroke-[3]" />
            <h2 className="text-4xl font-black text-slate-950">CLICK NOW!</h2>
          </div>
        )}

        {stage === 'TOO_EARLY' && (
          <div className="flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mb-2" />
            <h3 className="text-xl font-bold text-amber-300 mb-1">TOO EARLY!</h3>
            <p className="text-xs text-slate-300 font-mono mb-3">You clicked before the light turned green.</p>
            <span className="text-xs text-amber-400 font-bold underline">Click to Try Again</span>
          </div>
        )}

        {stage === 'ROUND_RESULT' && (
          <div className="flex flex-col items-center animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1" />
            <h3 className="text-4xl font-black font-mono text-white mb-1">{currentMs} ms</h3>
            <span className={`text-xs font-mono font-bold mb-3 ${getTier(currentMs || 300).color}`}>
              {getTier(currentMs || 300).label}
            </span>
            <span className="text-xs text-cyan-400 font-mono underline">Click for Next Round</span>
          </div>
        )}

        {stage === 'FINAL_SUMMARY' && (
          <div className="flex flex-col items-center animate-in zoom-in-95">
            <Trophy className="w-12 h-12 text-amber-400 mb-1" />
            <span className="text-xs font-mono text-slate-400 uppercase">Test Completed (5 Trials)</span>
            <h3 className="text-4xl font-black font-mono text-amber-300 my-1">{avgMs} ms</h3>
            <span className={`text-sm font-black tracking-widest font-mono mb-4 ${getTier(avgMs).color}`}>
              ★ {getTier(avgMs).label} ★
            </span>
            <button
              onClick={e => { e.stopPropagation(); resetAll(); }}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retest Reflex
            </button>
          </div>
        )}
      </div>

      {/* Trial History Dots */}
      <div className="flex items-center gap-2 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold ${
              history[i] !== undefined
                ? 'bg-purple-950/80 border-purple-500/60 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}
          >
            {history[i] !== undefined ? `${history[i]}ms` : `#${i + 1}`}
          </div>
        ))}
      </div>
    </div>
  );
};
