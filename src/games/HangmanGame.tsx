import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, HelpCircle } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

const CATEGORIES: Record<string, string[]> = {
  Gaming: ['FORTNITE', 'POKEMON', 'NINTENDO', 'PLAYSTATION', 'ARCADE', 'CONTROLLER', 'HEADSHOT', 'MINECRAFT'],
  Tech: ['JAVASCRIPT', 'REACT', 'DATABASE', 'ALGORITHM', 'KEYBOARD', 'BROWSER', 'SERVER', 'INTERNET'],
  Cosmos: ['ASTRONAUT', 'SUPERNOVA', 'GALAXY', 'ASTEROID', 'SATELLITE', 'TELESCOPE', 'NEBULA', 'ECLIPSE'],
  Animals: ['PANTHER', 'DOLPHIN', 'FALCON', 'CHAMELEON', 'CHEETAH', 'KANGAROO', 'OCTOPUS', 'PENGUIN']
};

export const HangmanGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [category, setCategory] = useState<string>('Gaming');
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  const [streak, setStreak] = useState(0);

  const initGame = useCallback((cat = category) => {
    sound.click();
    const list = CATEGORIES[cat];
    const picked = list[Math.floor(Math.random() * list.length)];
    setCategory(cat);
    setWord(picked);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setStatus('PLAYING');
  }, [category]);

  useEffect(() => {
    initGame('Gaming');
  }, []);

  const guessLetter = (letter: string) => {
    if (status !== 'PLAYING' || guessedLetters.includes(letter)) return;

    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    if (word.includes(letter)) {
      sound.score();
      // Check win
      const won = word.split('').every(ch => newGuessed.includes(ch));
      if (won) {
        sound.win();
        setStatus('WON');
        const newStreak = streak + 1;
        setStreak(newStreak);
        const points = (6 - wrongGuesses) * 150 + newStreak * 50;
        onScoreUpdate?.(points);
        if (points > highScore && onNewHighScore) {
          onNewHighScore(points);
        }
      }
    } else {
      sound.hit();
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= 6) {
        sound.gameOver();
        setStatus('LOST');
        setStreak(0);
      }
    }
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-4 text-xs font-mono">
        {Object.keys(CATEGORIES).map(cat => (
          <button
            key={cat}
            onClick={() => initGame(cat)}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              category === cat ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
          <Trophy className="w-4 h-4" />
          <span>Streak: <strong className="font-bold">{streak}x</strong></span>
        </div>

        <div className="text-xs font-mono text-rose-400">
          Shield Damage: <strong className="font-bold">{wrongGuesses}/6</strong>
        </div>

        <button
          onClick={() => initGame()}
          className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Hangman Display & Word Area */}
      <div className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 mb-4 flex flex-col items-center shadow-xl">
        {/* Neon SVG Gallows */}
        <div className="w-44 h-44 my-2">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-purple-400 fill-none" strokeWidth="3" strokeLinecap="round">
            {/* Base */}
            <line x1="15" y1="90" x2="65" y2="90" stroke="#64748b" />
            {/* Pole */}
            <line x1="30" y1="90" x2="30" y2="15" stroke="#a855f7" />
            {/* Top beam */}
            <line x1="30" y1="15" x2="70" y2="15" stroke="#a855f7" />
            {/* Support */}
            <line x1="30" y1="30" x2="45" y2="15" stroke="#a855f7" />
            {/* Rope */}
            <line x1="70" y1="15" x2="70" y2="28" stroke="#f59e0b" />

            {/* Head */}
            {wrongGuesses >= 1 && <circle cx="70" cy="36" r="8" stroke="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" />}
            {/* Body */}
            {wrongGuesses >= 2 && <line x1="70" y1="44" x2="70" y2="65" stroke="#38bdf8" />}
            {/* Left Arm */}
            {wrongGuesses >= 3 && <line x1="70" y1="50" x2="55" y2="42" stroke="#38bdf8" />}
            {/* Right Arm */}
            {wrongGuesses >= 4 && <line x1="70" y1="50" x2="85" y2="42" stroke="#38bdf8" />}
            {/* Left Leg */}
            {wrongGuesses >= 5 && <line x1="70" y1="65" x2="57" y2="80" stroke="#38bdf8" />}
            {/* Right Leg */}
            {wrongGuesses >= 6 && <line x1="70" y1="65" x2="83" y2="80" stroke="#f43f5e" filter="drop-shadow(0 0 6px #f43f5e)" />}
          </svg>
        </div>

        {/* Word Display Dashes */}
        <div className="flex flex-wrap justify-center gap-2 mt-2 mb-3">
          {word.split('').map((letter, idx) => {
            const revealed = guessedLetters.includes(letter) || status === 'LOST';
            return (
              <div
                key={idx}
                className={`w-9 h-11 border-b-2 flex items-center justify-center font-mono font-black text-xl transition-all ${
                  revealed
                    ? status === 'LOST' && !guessedLetters.includes(letter)
                      ? 'border-rose-500 text-rose-400'
                      : 'border-emerald-400 text-emerald-300'
                    : 'border-slate-700 text-transparent'
                }`}
              >
                {revealed ? letter : ''}
              </div>
            );
          })}
        </div>

        {/* Status Message */}
        {status !== 'PLAYING' && (
          <div className="w-full text-center py-2 animate-in zoom-in-95">
            <h4 className={`text-xl font-black ${status === 'WON' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {status === 'WON' ? 'TRANSMISSION DECODED!' : 'AGENT COMPROMISED!'}
            </h4>
            <button
              onClick={() => initGame()}
              className="mt-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Next Word
            </button>
          </div>
        )}
      </div>

      {/* Alphabet Keyboard */}
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 w-full max-w-[420px]">
        {letters.map(letter => {
          const isGuessed = guessedLetters.includes(letter);
          const isCorrect = isGuessed && word.includes(letter);
          const isWrong = isGuessed && !word.includes(letter);

          return (
            <button
              key={letter}
              onClick={() => guessLetter(letter)}
              disabled={isGuessed || status !== 'PLAYING'}
              className={`h-10 rounded-lg border font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                isCorrect
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                  : isWrong
                  ? 'bg-slate-900/40 border-slate-900 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};
