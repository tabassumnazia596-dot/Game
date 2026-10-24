import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Flag, Timer, Bomb } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
}

const NUMBER_COLORS = [
  '',
  'text-cyan-400',
  'text-emerald-400',
  'text-rose-400',
  'text-purple-400',
  'text-amber-400',
  'text-teal-400',
  'text-pink-400',
  'text-white'
];

export const MinesweeperGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [minesCount, setMinesCount] = useState(10);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [firstClick, setFirstClick] = useState(true);
  const [status, setStatus] = useState<'READY' | 'PLAYING' | 'WON' | 'LOST'>('READY');
  const [flagMode, setFlagMode] = useState(false);
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [time, setTime] = useState(0);

  const createEmptyBoard = useCallback((rCount: number, cCount: number): Cell[][] => {
    return Array.from({ length: rCount }, (_, r) =>
      Array.from({ length: cCount }, (_, c) => ({
        r,
        c,
        isMine: false,
        revealed: false,
        flagged: false,
        count: 0
      }))
    );
  }, []);

  const resetGame = useCallback((rCount = rows, cCount = cols, mCount = minesCount) => {
    sound.click();
    setRows(rCount);
    setCols(cCount);
    setMinesCount(mCount);
    setGrid(createEmptyBoard(rCount, cCount));
    setFirstClick(true);
    setStatus('READY');
    setFlagsUsed(0);
    setTime(0);
  }, [rows, cols, minesCount, createEmptyBoard]);

  useEffect(() => {
    resetGame(8, 8, 10);
  }, []);

  // Timer
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (status === 'PLAYING') {
      t = setInterval(() => setTime(s => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [status]);

  const populateMines = (clickedR: number, clickedC: number, board: Cell[][]) => {
    let planted = 0;
    while (planted < minesCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      // Guarantee clicked cell and adjacent cells are clear
      if (Math.abs(r - clickedR) <= 1 && Math.abs(c - clickedC) <= 1) continue;
      if (!board[r][c].isMine) {
        board[r][c].isMine = true;
        planted++;
      }
    }

    // Compute adjacency counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
              count++;
            }
          }
        }
        board[r][c].count = count;
      }
    }
  };

  const revealCell = (r: number, c: number, currentBoard?: Cell[][]) => {
    if (status === 'WON' || status === 'LOST') return;

    const b = currentBoard ? currentBoard.map(row => row.map(cell => ({ ...cell }))) : grid.map(row => row.map(cell => ({ ...cell })));
    const target = b[r][c];

    if (target.flagged || target.revealed) return;

    if (firstClick) {
      setFirstClick(false);
      setStatus('PLAYING');
      populateMines(r, c, b);
    }

    sound.move();

    if (b[r][c].isMine) {
      // Hit mine - Lost
      sound.gameOver();
      setStatus('LOST');
      // Reveal all mines
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (b[i][j].isMine) b[i][j].revealed = true;
        }
      }
      setGrid(b);
      return;
    }

    // Flood fill
    const stack: [number, number][] = [[r, c]];
    b[r][c].revealed = true;

    while (stack.length > 0) {
      const [currR, currC] = stack.pop()!;
      if (b[currR][currC].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (!b[nr][nc].revealed && !b[nr][nc].flagged && !b[nr][nc].isMine) {
                b[nr][nc].revealed = true;
                if (b[nr][nc].count === 0) {
                  stack.push([nr, nc]);
                }
              }
            }
          }
        }
      }
    }

    // Check Win
    let unrevealedSafe = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!b[i][j].isMine && !b[i][j].revealed) {
          unrevealedSafe++;
        }
      }
    }

    if (unrevealedSafe === 0) {
      sound.win();
      setStatus('WON');
      const finalScore = Math.max(50, 1500 - time * 5);
      onScoreUpdate?.(finalScore);
      if (finalScore > highScore && onNewHighScore) {
        onNewHighScore(finalScore);
      }
    }

    setGrid(b);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === 'WON' || status === 'LOST') return;
    if (grid[r][c].revealed) return;

    sound.click();
    const b = grid.map(row => row.map(cell => ({ ...cell })));
    const willFlag = !b[r][c].flagged;
    b[r][c].flagged = willFlag;
    setFlagsUsed(prev => (willFlag ? prev + 1 : prev - 1));
    setGrid(b);
  };

  const handleCellClick = (r: number, c: number) => {
    if (flagMode) {
      const fakeEvt = { preventDefault: () => {} } as React.MouseEvent;
      toggleFlag(fakeEvt, r, c);
    } else {
      revealCell(r, c);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Mode Bar */}
      <div className="flex items-center justify-between w-full mb-3 text-xs">
        <div className="flex gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => resetGame(8, 8, 10)}
            className={`px-3 py-1 rounded font-medium transition-colors ${rows === 8 ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
          >
            Easy (8x8)
          </button>
          <button
            onClick={() => resetGame(10, 10, 18)}
            className={`px-3 py-1 rounded font-medium transition-colors ${rows === 10 ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
          >
            Medium (10x10)
          </button>
        </div>

        {/* Flag mode button for touch / easy toggle */}
        <button
          onClick={() => setFlagMode(m => !m)}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all ${
            flagMode ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Flag className="w-3.5 h-3.5 fill-current" />
          <span>Flag Mode: {flagMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Status Bar */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-3">
        <div className="flex items-center gap-1.5 font-mono text-xs text-rose-400">
          <Bomb className="w-4 h-4" />
          <span className="font-bold">{minesCount - flagsUsed}</span>
        </div>

        <button
          onClick={() => resetGame()}
          className="text-2xl p-1 bg-slate-800 hover:bg-slate-700 rounded-full cursor-pointer transition-transform active:scale-90"
        >
          {status === 'LOST' ? '💥' : status === 'WON' ? '😎' : '🤖'}
        </button>

        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400">
          <Timer className="w-4 h-4" />
          <span className="font-bold">{time}s</span>
        </div>
      </div>

      {/* Minesweeper Grid */}
      <div className="relative bg-slate-950 p-2 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-auto">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={e => toggleFlag(e, r, c)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-mono font-bold text-sm rounded-md transition-all cursor-pointer ${
                  cell.revealed
                    ? cell.isMine
                      ? 'bg-rose-950 border border-rose-500 text-rose-400 shadow-[0_0_8px_#f43f5e]'
                      : 'bg-slate-900/90 border border-slate-800/60'
                    : 'bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 shadow-xs active:translate-y-0.5'
                }`}
              >
                {cell.revealed && cell.isMine && '💣'}
                {cell.revealed && !cell.isMine && cell.count > 0 && (
                  <span className={NUMBER_COLORS[cell.count]}>{cell.count}</span>
                )}
                {!cell.revealed && cell.flagged && (
                  <span className="text-amber-400 text-xs">🚩</span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Win Modal */}
        {status === 'WON' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">Mines Cleared</span>
            <h3 className="text-3xl font-black text-white mb-2">SECTOR SECURE!</h3>
            <p className="text-xs text-slate-300 font-mono mb-4">Completed in {time} seconds.</p>
            <button
              onClick={() => resetGame()}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 font-mono mt-3 text-center">
        Left-click/tap to reveal · Right-click or use Flag Mode to plant markers
      </p>
    </div>
  );
};
