import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Trophy, Keyboard, Timer } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

const PASSAGES = [
  "In the cyber matrix, high-velocity reflex separates champions from novices. Precision keystrokes ignite photonic engines across digital arenas.",
  "Arcade machines defined an entire generation of competitive gaming. From vector monitors to pixel sprites, players chased the elusive high score.",
  "Quantum algorithms simulate complex physics models in milliseconds, accelerating next generation game engines with realistic lighting and spatial audio.",
  "Speedrunning demands muscle memory and frame-perfect coordination. Every millisecond saved brings the runner closer to the world record."
];

export const TypingSpeedGame: React.FC<Props> = ({ onScoreUpdate, highScore, onNewHighScore }) => {
  const [passageIndex, setPassageIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeMode, setTimeMode] = useState<30 | 60>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const targetText = PASSAGES[passageIndex];
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const resetTest = useCallback((idx = 0, duration: 30 | 60 = timeMode) => {
    sound.click();
    setPassageIndex(idx);
    setUserInput('');
    setTimeMode(duration);
    setTimeLeft(duration);
    setIsStarted(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [timeMode]);

  useEffect(() => {
    resetTest(0, 30);
  }, []);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            finishTest();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, isFinished]);

  const finishTest = useCallback(() => {
    sound.win();
    setIsFinished(true);

    const elapsed = timeMode - timeLeft || 1;
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === targetText[i]) correctChars++;
    }

    const calculatedWpm = Math.round((correctChars / 5) / (elapsed / 60));
    const calculatedAcc = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;

    setWpm(calculatedWpm);
    setAccuracy(calculatedAcc);

    const score = Math.round(calculatedWpm * (calculatedAcc / 100) * 10);
    onScoreUpdate?.(score);
    if (score > highScore && onNewHighScore) {
      onNewHighScore(score);
    }
  }, [timeMode, timeLeft, userInput, targetText, highScore, onScoreUpdate, onNewHighScore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;

    if (!isStarted) {
      setIsStarted(true);
    }

    sound.click();
    const val = e.target.value;
    setUserInput(val);

    // Compute live WPM and Accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correct++;
    }

    const elapsed = Math.max(1, timeMode - timeLeft);
    const liveWpm = Math.round((correct / 5) / (elapsed / 60));
    const liveAcc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setWpm(liveWpm);
    setAccuracy(liveAcc);

    // If completed full passage
    if (val.length >= targetText.length) {
      finishTest();
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 font-mono">WPM:</span>
          <span className="text-xl font-bold font-mono text-amber-400">{wpm}</span>
        </div>

        <div className="text-xs font-mono text-slate-300">
          Accuracy: <strong className="text-cyan-400 font-bold">{accuracy}%</strong>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-rose-400">
          <Timer className="w-4 h-4" />
          <span className="font-bold">{timeLeft}s</span>
        </div>

        <button
          onClick={() => resetTest((passageIndex + 1) % PASSAGES.length)}
          className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Next
        </button>
      </div>

      {/* Passage Display with letter highlights */}
      <div className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 mb-4 shadow-xl">
        <div className="text-base sm:text-lg font-mono leading-relaxed mb-4 select-text">
          {targetText.split('').map((char, idx) => {
            let color = 'text-slate-500';
            let bg = '';
            if (idx < userInput.length) {
              if (userInput[idx] === char) {
                color = 'text-emerald-400 font-bold';
              } else {
                color = 'text-rose-400 font-bold';
                bg = 'bg-rose-950/60 rounded-xs';
              }
            } else if (idx === userInput.length) {
              bg = 'bg-purple-500/30 border-b-2 border-purple-400 animate-pulse';
            }

            return (
              <span key={idx} className={`${color} ${bg}`}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Input Text Area */}
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={isFinished}
          placeholder="Start typing passage here to begin test..."
          className="w-full h-24 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl p-3 font-mono text-sm text-slate-200 outline-none resize-none transition-colors"
        />

        {/* Finished Modal */}
        {isFinished && (
          <div className="mt-4 p-4 bg-slate-900/90 border border-amber-500/40 rounded-xl text-center animate-in zoom-in-95">
            <span className="text-xs font-mono uppercase text-amber-400 tracking-widest">Test Complete</span>
            <h3 className="text-3xl font-black text-white my-1">{wpm} WPM</h3>
            <p className="text-xs text-slate-300 font-mono mb-3">
              Accuracy: <strong className="text-emerald-400">{accuracy}%</strong> · Characters Typed: {userInput.length}
            </p>
            <button
              onClick={() => resetTest((passageIndex + 1) % PASSAGES.length)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Next Passage
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 font-mono text-center">
        Type quickly and accurately. The test starts automatically on your first keystroke.
      </p>
    </div>
  );
};
