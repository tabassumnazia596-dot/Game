import React, { useState, useEffect } from 'react';
import { RotateCcw, Timer, Trophy } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['⚡', '💎', '🚀', '🔮', '🕹️', '🛡️', '👾', '🔥'];

export const MemoryGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const initGame = () => {
    sound.click();
    const paired = [...SYMBOLS, ...SYMBOLS];
    // Shuffle Fisher-Yates
    for (let i = paired.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paired[i], paired[j]] = [paired[j], paired[i]];
    }

    const cardList: Card[] = paired.map((sym, index) => ({
      id: index,
      symbol: sym,
      isFlipped: false,
      isMatched: false
    }));

    setCards(cardList);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setTime(0);
    setIsActive(true);
    setGameWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && !gameWon) {
      timer = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, gameWon]);

  const handleCardClick = (index: number) => {
    if (!isActive || gameWon) return;
    if (flippedIndices.length === 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    sound.move();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        // Match!
        setTimeout(() => {
          sound.match();
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);
          const newPairs = matchedPairs + 1;
          setMatchedPairs(newPairs);

          if (newPairs === SYMBOLS.length) {
            // Won game!
            sound.win();
            setGameWon(true);
            setIsActive(false);
            const finalScore = Math.max(100, 2000 - (moves * 30 + time * 10));
            onScoreUpdate?.(finalScore);
            if (finalScore > highScore && onNewHighScore) {
              onNewHighScore(finalScore);
            }
          }
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
          <Timer className="w-4 h-4 text-cyan-400" />
          <span>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
        </div>

        <div className="font-mono text-xs text-slate-300">
          Moves: <strong className="text-purple-400 font-bold">{moves}</strong>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Pairs: <strong className="text-emerald-400">{matchedPairs}/{SYMBOLS.length}</strong></span>
        </div>

        <button
          onClick={initGame}
          className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>

      {/* Grid */}
      <div className="relative w-full aspect-square max-w-[360px] bg-slate-950 p-3 rounded-2xl border-2 border-slate-800 shadow-xl">
        <div className="grid grid-cols-4 gap-2.5 w-full h-full">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`relative flex items-center justify-center rounded-xl text-3xl transition-all duration-300 cursor-pointer ${
                card.isFlipped || card.isMatched
                  ? 'bg-purple-900/40 border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] rotate-y-180'
                  : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-600'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <span className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                  {card.symbol}
                </span>
              ) : (
                <span className="text-xl font-bold font-mono opacity-30">?</span>
              )}
            </button>
          ))}
        </div>

        {/* Win Modal */}
        {gameWon && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">Grid Solved</span>
            <h3 className="text-3xl font-black text-white mb-2">MEMORY MASTER!</h3>
            <p className="text-xs text-slate-300 font-mono mb-4">
              Cleared in {time}s with {moves} moves!
            </p>
            <button
              onClick={initGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
