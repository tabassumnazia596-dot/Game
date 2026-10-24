import React, { useState } from 'react';
import { RotateCcw, Flame, Trophy } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

type Choice = 'rock' | 'paper' | 'scissors';

const CHOICES: { id: Choice; name: string; emoji: string; beats: Choice; color: string }[] = [
  { id: 'rock', name: 'Rock', emoji: '✊', beats: 'scissors', color: 'from-rose-500/20 to-rose-900/40 border-rose-500/50 text-rose-300' },
  { id: 'paper', name: 'Paper', emoji: '✋', beats: 'rock', color: 'from-cyan-500/20 to-cyan-900/40 border-cyan-500/50 text-cyan-300' },
  { id: 'scissors', name: 'Scissors', emoji: '✌️', beats: 'paper', color: 'from-emerald-500/20 to-emerald-900/40 border-emerald-500/50 text-emerald-300' },
];

export const RPSGame: React.FC<Props> = ({ onScoreUpdate }) => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [cpuChoice, setCpuChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'WIN' | 'LOSE' | 'DRAW' | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);

  const playRound = (choice: Choice) => {
    if (isShuffling) return;

    sound.click();
    setPlayerChoice(choice);
    setIsShuffling(true);
    setResult(null);

    // Simulated quick CPU shuffle
    setTimeout(() => {
      const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
      setCpuChoice(randomChoice);
      setIsShuffling(false);

      if (choice === randomChoice) {
        setResult('DRAW');
        sound.hit();
      } else {
        const playerObj = CHOICES.find(c => c.id === choice)!;
        if (playerObj.beats === randomChoice) {
          setResult('WIN');
          sound.win();
          const newStreak = streak + 1;
          const pointsEarned = 100 * newStreak;
          const newScore = score + pointsEarned;
          setStreak(newStreak);
          if (newStreak > bestStreak) setBestStreak(newStreak);
          setScore(newScore);
          onScoreUpdate?.(newScore);
        } else {
          setResult('LOSE');
          sound.gameOver();
          setStreak(0);
        }
      }
    }, 600);
  };

  const resetAll = () => {
    sound.click();
    setPlayerChoice(null);
    setCpuChoice(null);
    setResult(null);
    setStreak(0);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono uppercase">Score:</span>
          <span className="text-xl font-bold font-mono text-purple-400">{score}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-400">Streak: {streak}x</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Best: <strong className="text-slate-200">{bestStreak}</strong></span>
        </div>
      </div>

      {/* Duel Arena */}
      <div className="w-full bg-slate-950 border-2 border-slate-800/80 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-2 gap-4 items-center">
          {/* Player Choice */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase mb-2">You</span>
            <div className={`w-28 h-28 rounded-2xl flex items-center justify-center text-5xl bg-slate-900 border-2 transition-all ${
              playerChoice
                ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                : 'border-slate-800 text-slate-700'
            }`}>
              {playerChoice ? CHOICES.find(c => c.id === playerChoice)?.emoji : '❔'}
            </div>
            <span className="text-xs font-medium text-slate-400 mt-2 capitalize">
              {playerChoice || 'Choose Below'}
            </span>
          </div>

          {/* CPU Choice */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-mono text-purple-400 font-bold uppercase mb-2">Cyber Bot</span>
            <div className={`w-28 h-28 rounded-2xl flex items-center justify-center text-5xl bg-slate-900 border-2 transition-all ${
              isShuffling ? 'animate-bounce border-purple-500' :
              cpuChoice ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-slate-800 text-slate-700'
            }`}>
              {isShuffling ? '⚡' : cpuChoice ? CHOICES.find(c => c.id === cpuChoice)?.emoji : '❔'}
            </div>
            <span className="text-xs font-medium text-slate-400 mt-2 capitalize">
              {isShuffling ? 'Analyzing...' : cpuChoice || 'Waiting...'}
            </span>
          </div>
        </div>

        {/* Result Message Banner */}
        {result && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center animate-in zoom-in-95 duration-200">
            <h4 className={`text-2xl font-black mb-1 ${
              result === 'WIN' ? 'text-emerald-400 drop-shadow-[0_0_10px_#10b981]' :
              result === 'LOSE' ? 'text-rose-400 drop-shadow-[0_0_10px_#f43f5e]' : 'text-amber-400'
            }`}>
              {result === 'WIN' ? 'ROUND WON!' : result === 'LOSE' ? 'BOT WINS!' : 'DRAW!'}
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              {result === 'WIN' ? `+${100 * streak} points · Streak increased!` :
               result === 'LOSE' ? 'Streak reset to zero.' : 'Stalemate — pick again!'}
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Choose Your Move</span>
      <div className="grid grid-cols-3 gap-3 w-full">
        {CHOICES.map(c => (
          <button
            key={c.id}
            onClick={() => playRound(c.id)}
            disabled={isShuffling}
            className={`p-4 rounded-xl border bg-gradient-to-b ${c.color} flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md`}
          >
            <span className="text-4xl mb-1">{c.emoji}</span>
            <span className="text-xs font-bold font-mono uppercase">{c.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end w-full">
        <button
          onClick={resetAll}
          className="text-xs text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Match Stats
        </button>
      </div>
    </div>
  );
};
