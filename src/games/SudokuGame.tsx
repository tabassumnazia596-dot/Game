import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Timer, Lightbulb, Eraser } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

// Curated playable Sudoku templates with known solutions
const PUZZLES = {
  easy: {
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]
  },
  medium: {
    initial: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9],
    ]
  }
};

export const SudokuGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('easy');
  const [board, setBoard] = useState<number[][]>([]);
  const [initialMask, setInitialMask] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const initBoard = useCallback((diff: 'easy' | 'medium') => {
    sound.click();
    const puzzle = PUZZLES[diff];
    const initialCopy = puzzle.initial.map(row => [...row]);
    const mask = puzzle.initial.map(row => row.map(val => val !== 0));
    setBoard(initialCopy);
    setInitialMask(mask);
    setSelectedCell(null);
    setTime(0);
    setIsWon(false);
    setMistakes(0);
  }, []);

  useEffect(() => {
    initBoard(difficulty);
  }, [difficulty, initBoard]);

  // Timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (!isWon) {
      t = setInterval(() => setTime(s => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isWon]);

  // Conflict validation
  const hasConflict = (r: number, c: number, val: number): boolean => {
    if (val === 0) return false;
    // Check row
    for (let col = 0; col < 9; col++) {
      if (col !== c && board[r][col] === val) return true;
    }
    // Check col
    for (let row = 0; row < 9; row++) {
      if (row !== r && board[row][c] === val) return true;
    }
    // Check 3x3 box
    const startR = Math.floor(r / 3) * 3;
    const startC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const curR = startR + i;
        const curC = startC + j;
        if ((curR !== r || curC !== c) && board[curR][curC] === val) return true;
      }
    }
    return false;
  };

  const handleInputNumber = (val: number) => {
    if (!selectedCell || isWon) return;
    const { r, c } = selectedCell;
    if (initialMask[r][c]) return;

    sound.move();
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = val;
    setBoard(newBoard);

    // Check mistake against known solution
    const solVal = PUZZLES[difficulty].solution[r][c];
    if (val !== 0 && val !== solVal) {
      sound.hit();
      setMistakes(m => m + 1);
    }

    // Check win condition
    const isComplete = newBoard.every((row, rowIdx) =>
      row.every((cell, colIdx) => cell === PUZZLES[difficulty].solution[rowIdx][colIdx])
    );

    if (isComplete) {
      sound.win();
      setIsWon(true);
      const finalScore = Math.max(100, 2500 - time * 3 - mistakes * 50);
      onScoreUpdate?.(finalScore);
      if (finalScore > highScore && onNewHighScore) {
        onNewHighScore(finalScore);
      }
    }
  };

  const giveHint = () => {
    if (!selectedCell || isWon) return;
    const { r, c } = selectedCell;
    if (initialMask[r][c]) return;

    sound.score();
    const correctVal = PUZZLES[difficulty].solution[r][c];
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = correctVal;
    setBoard(newBoard);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || isWon) return;
      const key = e.key;
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
        handleInputNumber(parseInt(key, 10));
      } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleInputNumber(0);
      } else if (key === 'ArrowUp' && selectedCell.r > 0) {
        setSelectedCell({ r: selectedCell.r - 1, c: selectedCell.c });
      } else if (key === 'ArrowDown' && selectedCell.r < 8) {
        setSelectedCell({ r: selectedCell.r + 1, c: selectedCell.c });
      } else if (key === 'ArrowLeft' && selectedCell.c > 0) {
        setSelectedCell({ r: selectedCell.r, c: selectedCell.c - 1 });
      } else if (key === 'ArrowRight' && selectedCell.c < 8) {
        setSelectedCell({ r: selectedCell.r, c: selectedCell.c + 1 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-3">
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-lg text-xs font-mono">
          <button
            onClick={() => setDifficulty('easy')}
            className={`px-2.5 py-1 rounded transition-colors ${difficulty === 'easy' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Easy
          </button>
          <button
            onClick={() => setDifficulty('medium')}
            className={`px-2.5 py-1 rounded transition-colors ${difficulty === 'medium' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Medium
          </button>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400">
          <Timer className="w-4 h-4" />
          <span>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
        </div>

        <div className="font-mono text-xs text-rose-400">
          Mistakes: <strong className="font-bold">{mistakes}</strong>
        </div>

        <button
          onClick={() => initBoard(difficulty)}
          className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Sudoku 9x9 Board */}
      <div className="relative bg-slate-950 p-2 sm:p-3 rounded-2xl border-2 border-slate-800 shadow-2xl mb-4">
        <div className="grid grid-cols-9 gap-[2px] bg-slate-800/80 p-[2px] rounded-lg">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isInitial = initialMask[r]?.[c];
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isConflicted = !isInitial && cell !== 0 && hasConflict(r, c, cell);
              const isSameRowCol = selectedCell && (selectedCell.r === r || selectedCell.c === c);

              // 3x3 block borders
              const borderBottom = (r === 2 || r === 5) ? 'border-b-2 border-b-purple-500/40' : '';
              const borderRight = (c === 2 || c === 5) ? 'border-r-2 border-r-purple-500/40' : '';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => {
                    sound.click();
                    setSelectedCell({ r, c });
                  }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-mono font-bold text-sm sm:text-base transition-colors cursor-pointer ${borderBottom} ${borderRight} ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-[0_0_10px_#a855f7]'
                      : isSameRowCol
                      ? 'bg-slate-900/90'
                      : 'bg-slate-950 hover:bg-slate-900'
                  } ${
                    isConflicted
                      ? 'text-rose-400 bg-rose-950/40'
                      : isInitial
                      ? 'text-cyan-400 font-black'
                      : 'text-purple-300'
                  }`}
                >
                  {cell !== 0 ? cell : ''}
                </button>
              );
            })
          )}
        </div>

        {/* Victory Overlay */}
        {isWon && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">Grid Completed</span>
            <h3 className="text-3xl font-black text-white mb-2">SUDOKU MASTER!</h3>
            <p className="text-xs text-slate-300 font-mono mb-4">Solved in {Math.floor(time / 60)}m {time % 60}s with {mistakes} mistakes.</p>
            <button
              onClick={() => initBoard(difficulty)}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play New Puzzle
            </button>
          </div>
        )}
      </div>

      {/* Number Pad & Actions */}
      <div className="flex flex-col gap-2 w-full max-w-[360px]">
        <div className="grid grid-cols-9 gap-1.5 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleInputNumber(num)}
              className="h-10 bg-slate-900 hover:bg-purple-600/80 active:bg-purple-500 text-white font-mono font-bold rounded-lg border border-slate-800 transition-all cursor-pointer shadow-sm"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 w-full mt-1">
          <button
            onClick={() => handleInputNumber(0)}
            className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5 text-rose-400" /> Erase Cell
          </button>
          <button
            onClick={giveHint}
            className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Reveal Hint
          </button>
        </div>
      </div>
    </div>
  );
};
