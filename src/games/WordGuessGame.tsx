import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Delete, CornerDownLeft } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

const WORDS = [
  'CYBER', 'PIXEL', 'QUEST', 'LASER', 'POWER', 'GHOST', 'BLADE',
  'TURBO', 'MAGIC', 'ROBOT', 'ARENA', 'RADAR', 'TITAN', 'ROGUE',
  'DRIVE', 'FLAME', 'STORM', 'SHARK', 'NINJA', 'ARMOR'
];

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

export const WordGuessGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  const [streak, setStreak] = useState(0);

  const initGame = useCallback(() => {
    sound.click();
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('PLAYING');
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5 || gameStatus !== 'PLAYING') return;

    sound.move();
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === targetWord) {
      sound.win();
      setGameStatus('WON');
      const newStreak = streak + 1;
      setStreak(newStreak);
      const points = (7 - newGuesses.length) * 200 + newStreak * 50;
      onScoreUpdate?.(points);
      if (points > highScore && onNewHighScore) {
        onNewHighScore(points);
      }
    } else if (newGuesses.length === 6) {
      sound.gameOver();
      setGameStatus('LOST');
      setStreak(0);
    }
  }, [currentGuess, gameStatus, guesses, targetWord, streak, highScore, onScoreUpdate, onNewHighScore]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'PLAYING') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACK' || key === 'BACKSPACE') {
      sound.click();
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      sound.click();
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameStatus, submitGuess]);

  // Physical keyboard listener
  useEffect(() => {
    const handlePhysicalKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER') handleKeyPress('ENTER');
      else if (key === 'BACKSPACE') handleKeyPress('BACK');
      else if (/^[A-Z]$/.test(key)) handleKeyPress(key);
    };
    window.addEventListener('keydown', handlePhysicalKey);
    return () => window.removeEventListener('keydown', handlePhysicalKey);
  }, [handleKeyPress]);

  // Determine letter status for row
  const getLetterStatus = (word: string, index: number): LetterState => {
    const letter = word[index];
    if (letter === targetWord[index]) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  // Keyboard key styling
  const getKeyStyle = (key: string) => {
    if (key === 'ENTER' || key === 'BACK') {
      return 'bg-slate-800 text-slate-200 border-slate-700';
    }

    let state: LetterState = 'empty';
    for (const g of guesses) {
      for (let i = 0; i < 5; i++) {
        if (g[i] === key) {
          if (targetWord[i] === key) {
            state = 'correct';
            break;
          } else if (targetWord.includes(key) && state !== 'correct') {
            state = 'present';
          } else if (state === 'empty') {
            state = 'absent';
          }
        }
      }
    }

    if (state === 'correct') return 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_8px_#10b981]';
    if (state === 'present') return 'bg-amber-600 text-white border-amber-500';
    if (state === 'absent') return 'bg-slate-900/60 text-slate-600 border-slate-800';
    return 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-750';
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>Streak: <strong className="font-bold">{streak}x</strong></span>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Attempts: <strong className="text-cyan-400">{guesses.length}/6</strong>
        </div>

        <button
          onClick={initGame}
          className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> New Word
        </button>
      </div>

      {/* 6x5 Letter Matrix */}
      <div className="grid grid-rows-6 gap-2 mb-5">
        {Array.from({ length: 6 }).map((_, rowIdx) => {
          const isSubmitted = rowIdx < guesses.length;
          const isCurrent = rowIdx === guesses.length;
          const wordToRender = isSubmitted
            ? guesses[rowIdx]
            : isCurrent
            ? currentGuess.padEnd(5, ' ')
            : '     ';

          return (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, colIdx) => {
                const char = wordToRender[colIdx]?.trim();
                let statusClass = 'border-slate-800 bg-slate-950/60 text-white';

                if (isSubmitted) {
                  const status = getLetterStatus(guesses[rowIdx], colIdx);
                  if (status === 'correct') {
                    statusClass = 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_10px_#10b981]';
                  } else if (status === 'present') {
                    statusClass = 'bg-amber-600 border-amber-500 text-white';
                  } else {
                    statusClass = 'bg-slate-900 border-slate-800 text-slate-500';
                  }
                } else if (isCurrent && char) {
                  statusClass = 'border-purple-500 bg-slate-900 text-purple-300 scale-105';
                }

                return (
                  <div
                    key={colIdx}
                    className={`w-11 h-12 sm:w-13 sm:h-14 flex items-center justify-center font-mono font-black text-xl sm:text-2xl rounded-xl border-2 transition-all duration-300 ${statusClass}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Status Overlay */}
      {gameStatus !== 'PLAYING' && (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-4 text-center animate-in zoom-in-95 duration-200">
          <h4 className={`text-xl font-black ${gameStatus === 'WON' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {gameStatus === 'WON' ? 'CIPHER CRACKED!' : 'DECRYPT FAILED!'}
          </h4>
          <p className="text-xs font-mono text-slate-300 mt-1">
            The secret word was <strong className="text-cyan-400 tracking-wider font-black">{targetWord}</strong>
          </p>
          <button
            onClick={initGame}
            className="mt-2.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Play Another Word
          </button>
        </div>
      )}

      {/* On-screen Virtual Keyboard */}
      <div className="flex flex-col gap-1.5 w-full max-w-[420px]">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 w-full">
            {row.map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`h-11 sm:h-12 rounded-lg border font-mono font-bold text-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  key === 'ENTER' || key === 'BACK' ? 'px-2.5 sm:px-3 text-[10px]' : 'flex-1 max-w-10'
                } ${getKeyStyle(key)}`}
              >
                {key === 'BACK' ? <Delete className="w-4 h-4" /> : key === 'ENTER' ? <CornerDownLeft className="w-4 h-4" /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
