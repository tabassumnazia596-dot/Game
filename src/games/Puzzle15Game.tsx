import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Timer } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

export const Puzzle15Game: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Generate solvable board by starting solved and doing 80 random valid moves
  const initBoard = useCallback(() => {
    sound.click();
    const solved = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    let emptyIdx = 15;

    for (let m = 0; m < 120; m++) {
      const neighbors: number[] = [];
      const r = Math.floor(emptyIdx / 4);
      const c = emptyIdx % 4;

      if (r > 0) neighbors.push(emptyIdx - 4);
      if (r < 3) neighbors.push(emptyIdx + 4);
      if (c > 0) neighbors.push(emptyIdx - 1);
      if (c < 3) neighbors.push(emptyIdx + 1);

      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      [solved[emptyIdx], solved[chosen]] = [solved[chosen], solved[emptyIdx]];
      emptyIdx = chosen;
    }

    setBoard(solved);
    setMoves(0);
    setTime(0);
    setIsWon(false);
    setIsActive(true);
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isActive && !isWon) {
      t = setInterval(() => setTime(s => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isActive, isWon]);

  const handleTileClick = (idx: number) => {
    if (isWon || !isActive) return;

    const emptyIdx = board.indexOf(0);
    const r1 = Math.floor(idx / 4);
    const c1 = idx % 4;
    const r2 = Math.floor(emptyIdx / 4);
    const c2 = emptyIdx % 4;

    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

    if (isAdjacent) {
      sound.move();
      const newBoard = [...board];
      [newBoard[idx], newBoard[emptyIdx]] = [newBoard[emptyIdx], newBoard[idx]];
      setBoard(newBoard);
      const newMoves = moves + 1;
      setMoves(newMoves);

      // Check win
      const won = newBoard.slice(0, 15).every((val, i) => val === i + 1) && newBoard[15] === 0;
      if (won) {
        sound.win();
        setIsWon(true);
        setIsActive(false);
        const finalScore = Math.max(100, 2500 - (newMoves * 15 + time * 5));
        onScoreUpdate?.(finalScore);
        if (finalScore > highScore && onNewHighScore) {
          onNewHighScore(finalScore);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400">
          <Timer className="w-4 h-4" />
          <span>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
        </div>

        <div className="font-mono text-xs text-slate-300">
          Moves: <strong className="text-purple-400 font-bold">{moves}</strong>
        </div>

        <button
          onClick={initBoard}
          className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Shuffle
        </button>
      </div>

      {/* 4x4 Grid */}
      <div className="relative w-full aspect-square max-w-[360px] bg-slate-950 p-3 rounded-2xl border-2 border-slate-800 shadow-2xl">
        <div className="grid grid-cols-4 gap-2 w-full h-full">
          {board.map((tile, idx) => (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={tile === 0 || isWon}
              className={`flex items-center justify-center font-mono font-black text-xl rounded-xl transition-all cursor-pointer ${
                tile === 0
                  ? 'bg-transparent border border-slate-900/60 pointer-events-none'
                  : 'bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 shadow-md active:scale-95'
              }`}
            >
              {tile !== 0 ? tile : ''}
            </button>
          ))}
        </div>

        {/* Win Modal */}
        {isWon && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">Numbers Ordered</span>
            <h3 className="text-3xl font-black text-white mb-2">PUZZLE SOLVED!</h3>
            <p className="text-xs text-slate-300 font-mono mb-4">
              Completed in {moves} moves and {time} seconds.
            </p>
            <button
              onClick={initBoard}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 font-mono mt-4 text-center">
        Click or tap any tile adjacent to the blank space to slide it
      </p>
    </div>
  );
};
