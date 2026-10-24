import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

type Board = number[][];

const TILE_COLORS: Record<number, string> = {
  2: 'bg-slate-800 text-slate-100 border-slate-700',
  4: 'bg-indigo-900/80 text-indigo-100 border-indigo-700/80',
  8: 'bg-purple-900/90 text-purple-100 border-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.3)]',
  16: 'bg-pink-900/90 text-pink-100 border-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.4)]',
  32: 'bg-rose-900/90 text-rose-100 border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  64: 'bg-amber-900/90 text-amber-100 border-amber-600 shadow-[0_0_14px_rgba(245,158,11,0.5)]',
  128: 'bg-yellow-800 text-yellow-100 border-yellow-500 shadow-[0_0_16px_rgba(234,179,8,0.6)]',
  256: 'bg-emerald-800 text-emerald-100 border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.6)]',
  512: 'bg-teal-800 text-teal-100 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.7)]',
  1024: 'bg-cyan-800 text-cyan-100 border-cyan-400 shadow-[0_0_22px_rgba(6,182,212,0.8)]',
  2048: 'bg-gradient-to-br from-amber-400 to-purple-600 text-slate-950 font-black border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.9)] animate-pulse',
};

export const Game2048: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [board, setBoard] = useState<Board>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Add random tile (2 or 4)
  const addRandomTile = (currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const startNewGame = useCallback(() => {
    sound.click();
    let initialBoard: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    initialBoard = addRandomTile(initialBoard);
    initialBoard = addRandomTile(initialBoard);
    setBoard(initialBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Check can move
  const canMove = (b: Board): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return true;
        if (c < 3 && b[r][c] === b[r][c + 1]) return true;
        if (r < 3 && b[r][c] === b[r + 1][c]) return true;
      }
    }
    return false;
  };

  const slideRowLeft = (row: number[]): { newRow: number[]; addedScore: number; merged: boolean } => {
    let filtered = row.filter(n => n !== 0);
    let addedScore = 0;
    let merged = false;

    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        addedScore += filtered[i];
        filtered[i + 1] = 0;
        merged = true;
      }
    }

    filtered = filtered.filter(n => n !== 0);
    while (filtered.length < 4) {
      filtered.push(0);
    }

    return { newRow: filtered, addedScore, merged };
  };

  const rotateClockwise = (matrix: Board): Board => {
    const N = 4;
    const res: Board = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        res[c][N - 1 - r] = matrix[r][c];
      }
    }
    return res;
  };

  const move = useCallback((direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (gameOver) return;

    let current = board.map(row => [...row]);
    let rotations = 0;

    if (direction === 'UP') {
      current = rotateClockwise(rotateClockwise(rotateClockwise(current)));
      rotations = 1; // Need 1 clockwise rotation to restore
    } else if (direction === 'RIGHT') {
      current = rotateClockwise(rotateClockwise(current));
      rotations = 2; // Need 2 rotations to restore
    } else if (direction === 'DOWN') {
      current = rotateClockwise(current);
      rotations = 3; // Need 3 rotations to restore
    }

    let changed = false;
    let roundScore = 0;
    let anyMerged = false;

    for (let r = 0; r < 4; r++) {
      const { newRow, addedScore, merged } = slideRowLeft(current[r]);
      if (current[r].some((val, idx) => val !== newRow[idx])) {
        changed = true;
      }
      current[r] = newRow;
      roundScore += addedScore;
      if (merged) anyMerged = true;
    }

    // Restore rotation
    for (let i = 0; i < rotations; i++) {
      current = rotateClockwise(current);
    }

    if (changed) {
      if (anyMerged) sound.score();
      else sound.move();

      const updatedWithRandom = addRandomTile(current);
      const newTotalScore = score + roundScore;
      setBoard(updatedWithRandom);
      setScore(newTotalScore);
      onScoreUpdate?.(newTotalScore);

      if (newTotalScore > highScore && onNewHighScore) {
        onNewHighScore(newTotalScore);
      }

      // Check win condition
      if (!won && updatedWithRandom.some(row => row.includes(2048))) {
        setWon(true);
        sound.win();
      }

      // Check game over
      if (!canMove(updatedWithRandom)) {
        setGameOver(true);
        sound.gameOver();
      }
    }
  }, [board, gameOver, score, won, highScore, onScoreUpdate, onNewHighScore]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') move('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') move('RIGHT');
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') move('UP');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') move('DOWN');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Score:</span>
          <span className="text-xl font-bold font-mono text-amber-400">{score}</span>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-mono uppercase">Best:</span>
          <span className="text-lg font-bold font-mono text-amber-400">{Math.max(score, highScore)}</span>
        </div>

        <button
          onClick={startNewGame}
          className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> New Game
        </button>
      </div>

      {/* 2048 Grid */}
      <div className="relative w-full aspect-square max-w-[360px] bg-slate-950 p-3 rounded-2xl border-2 border-slate-800 shadow-2xl">
        <div className="grid grid-cols-4 gap-2.5 w-full h-full">
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`relative flex items-center justify-center rounded-xl font-mono font-black border transition-all duration-150 ${
                  cell === 0 ? 'bg-slate-900/60 border-slate-900/80 text-transparent' : TILE_COLORS[cell] || 'bg-purple-950 text-white'
                } ${
                  cell > 512 ? 'text-lg md:text-xl' : cell > 64 ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
                }`}
              >
                {cell !== 0 && cell}
              </div>
            ))
          )}
        </div>

        {/* Win / Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1">Matrix Filled</span>
            <h3 className="text-3xl font-black text-white mb-2">GAME OVER</h3>
            <p className="text-sm font-mono text-slate-300 mb-4">Final Score: <span className="text-amber-400 font-bold">{score}</span></p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

        {won && !gameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">Legendary Tile Reached</span>
            <h3 className="text-3xl font-black text-white mb-2">YOU FORGED 2048!</h3>
            <p className="text-xs text-slate-300 mb-4">Keep going to score even higher or restart anytime.</p>
            <button
              onClick={() => setWon(false)}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              Keep Playing
            </button>
          </div>
        )}
      </div>

      {/* Mobile Direction Buttons */}
      <div className="grid grid-cols-3 gap-2 w-48 mt-4 md:hidden">
        <div />
        <button
          onClick={() => move('UP')}
          aria-label="Move Up"
          className="p-3 bg-slate-800 active:bg-amber-500 text-white rounded-lg flex items-center justify-center shadow"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />
        <button
          onClick={() => move('LEFT')}
          aria-label="Move Left"
          className="p-3 bg-slate-800 active:bg-amber-500 text-white rounded-lg flex items-center justify-center shadow"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => move('DOWN')}
          aria-label="Move Down"
          className="p-3 bg-slate-800 active:bg-amber-500 text-white rounded-lg flex items-center justify-center shadow"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <button
          onClick={() => move('RIGHT')}
          aria-label="Move Right"
          className="p-3 bg-slate-800 active:bg-amber-500 text-white rounded-lg flex items-center justify-center shadow"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
