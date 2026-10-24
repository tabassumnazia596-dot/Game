import React, { useState } from 'react';
import { RotateCcw, User, Cpu, Users } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

type Player = 'X' | 'O';
type Board = (Player | null)[];
type Mode = 'AI_EASY' | 'AI_HARD' | 'PVP';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

export const TicTacToeGame: React.FC<Props> = ({ onScoreUpdate }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [mode, setMode] = useState<Mode>('AI_HARD');
  const [stats, setStats] = useState({ xWins: 0, oWins: 0, draws: 0 });

  const checkWinner = (currentBoard: Board): { winner: Player | 'DRAW' | null; line: number[] | null } => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'DRAW', line: null };
    }
    return { winner: null, line: null };
  };

  const getBestMoveMinimax = (currentBoard: Board): number => {
    // Minimax algorithm for invincible AI
    const minimax = (b: Board, depth: number, isMax: boolean): number => {
      const res = checkWinner(b);
      if (res.winner === 'O') return 10 - depth;
      if (res.winner === 'X') return depth - 10;
      if (res.winner === 'DRAW') return 0;

      if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (!b[i]) {
            b[i] = 'O';
            best = Math.max(best, minimax(b, depth + 1, false));
            b[i] = null;
          }
        }
        return best;
      } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
          if (!b[i]) {
            b[i] = 'X';
            best = Math.min(best, minimax(b, depth + 1, true));
            b[i] = null;
          }
        }
        return best;
      }
    };

    let bestVal = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O';
        const moveVal = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (moveVal > bestVal) {
          bestVal = moveVal;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner) return;

    sound.move();
    const newBoard = [...board];
    newBoard[idx] = turn;

    const res = checkWinner(newBoard);
    if (res.winner) {
      finishGame(newBoard, res.winner, res.line);
      return;
    }

    if (mode === 'PVP') {
      setBoard(newBoard);
      setTurn(turn === 'X' ? 'O' : 'X');
      return;
    }

    // AI Turn
    setBoard(newBoard);
    setTurn('O');

    setTimeout(() => {
      let aiIndex: number;
      if (mode === 'AI_EASY') {
        const available = newBoard.map((v, i) => (v === null ? i : null)).filter(v => v !== null) as number[];
        aiIndex = available[Math.floor(Math.random() * available.length)];
      } else {
        aiIndex = getBestMoveMinimax([...newBoard]);
      }

      if (aiIndex !== -1 && aiIndex !== undefined) {
        sound.move();
        newBoard[aiIndex] = 'O';
        const aiRes = checkWinner(newBoard);
        if (aiRes.winner) {
          finishGame(newBoard, aiRes.winner, aiRes.line);
        } else {
          setBoard(newBoard);
          setTurn('X');
        }
      }
    }, 350);
  };

  const finishGame = (finalBoard: Board, winResult: Player | 'DRAW', line: number[] | null) => {
    setBoard(finalBoard);
    setWinner(winResult);
    setWinningLine(line);

    if (winResult === 'X') {
      sound.win();
      setStats(prev => ({ ...prev, xWins: prev.xWins + 1 }));
      onScoreUpdate?.((stats.xWins + 1) * 100);
    } else if (winResult === 'O') {
      sound.gameOver();
      setStats(prev => ({ ...prev, oWins: prev.oWins + 1 }));
    } else {
      sound.hit();
      setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  const resetBoard = () => {
    sound.click();
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Mode Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-4 text-xs">
        <button
          onClick={() => { setMode('AI_HARD'); resetBoard(); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
            mode === 'AI_HARD' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> Impossible AI
        </button>
        <button
          onClick={() => { setMode('AI_EASY'); resetBoard(); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
            mode === 'AI_EASY' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> Casual AI
        </button>
        <button
          onClick={() => { setMode('PVP'); resetBoard(); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
            mode === 'PVP' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> 2-Player
        </button>
      </div>

      {/* Score Header */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-300">X: <strong className="text-cyan-400">{stats.xWins}</strong></span>
        </div>
        <div className="text-xs font-mono text-slate-500">
          Draws: <strong className="text-slate-300">{stats.draws}</strong>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'PVP' ? <User className="w-4 h-4 text-purple-400" /> : <Cpu className="w-4 h-4 text-purple-400" />}
          <span className="text-xs font-mono text-slate-300">O: <strong className="text-purple-400">{stats.oWins}</strong></span>
        </div>
      </div>

      {/* Board */}
      <div className="relative w-full aspect-square max-w-[340px] bg-slate-950 p-3 rounded-2xl border-2 border-slate-800 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
        <div className="grid grid-cols-3 gap-2.5 w-full h-full">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || winner !== null}
                className={`relative flex items-center justify-center text-5xl font-black rounded-xl transition-all duration-200 cursor-pointer ${
                  cell === null ? 'bg-slate-900/70 hover:bg-slate-800/80' : 'bg-slate-900/90'
                } ${
                  isWinningCell
                    ? cell === 'X'
                      ? 'border-2 border-cyan-400 shadow-[0_0_15px_#22d3ee]'
                      : 'border-2 border-purple-400 shadow-[0_0_15px_#c084fc]'
                    : 'border border-slate-800/80'
                }`}
              >
                {cell === 'X' && (
                  <span className="text-cyan-400 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-in zoom-in-50 duration-150">
                    X
                  </span>
                )}
                {cell === 'O' && (
                  <span className="text-purple-400 filter drop-shadow-[0_0_10px_rgba(192,132,252,0.7)] animate-in zoom-in-50 duration-150">
                    O
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Winner Banner Overlay */}
        {winner && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 z-20">
            <h4 className="text-2xl font-black text-white mb-1">
              {winner === 'DRAW' ? "IT'S A DRAW!" : `${winner} WINS!`}
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              {winner === 'X' ? 'Victory for Player X!' : winner === 'O' ? 'Victory for Player O!' : 'Evenly matched.'}
            </p>
            <button
              onClick={resetBoard}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Another Round
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between w-full max-w-[340px]">
        <span className="text-xs text-slate-400 font-mono">
          Current Turn: <strong className={turn === 'X' ? 'text-cyan-400' : 'text-purple-400'}>{turn}</strong>
        </span>
        <button
          onClick={resetBoard}
          className="text-xs text-slate-400 hover:text-slate-200 underline font-mono flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset Grid
        </button>
      </div>
    </div>
  );
};
