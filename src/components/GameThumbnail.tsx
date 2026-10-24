import React, { useState } from 'react';
import { GameInfo } from '../data/games';
import { 
  Gamepad2, 
  Sparkles, 
  Rocket, 
  Zap, 
  Grid3X3, 
  Brain, 
  Bomb, 
  Type, 
  Layers, 
  Crosshair, 
  Timer, 
  Flame, 
  HelpCircle,
  Keyboard,
  Shuffle
} from 'lucide-react';

interface Props {
  game: GameInfo;
  className?: string;
  badge?: string;
}

export const GameThumbnail: React.FC<Props> = ({ game, className = '', badge }) => {
  const [imgError, setImgError] = useState(false);

  // If game has a custom image and it hasn't errored, show it
  if (game.image && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 group ${className}`}>
        <img
          src={game.image}
          alt={game.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        {badge && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-600/90 text-white rounded shadow-sm backdrop-blur-xs">
            {badge}
          </span>
        )}
      </div>
    );
  }

  // Custom distinct glowing SVG illustration for each game
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#0f1123] via-[#161933] to-[#0a0c1a] border border-slate-800/80 group ${className}`}>
      {/* Background ambient glow according to accent */}
      <div 
        className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none ${
          game.accent === 'green' ? 'bg-emerald-500' :
          game.accent === 'cyan' ? 'bg-cyan-500' :
          game.accent === 'purple' ? 'bg-purple-500' :
          game.accent === 'amber' ? 'bg-amber-500' :
          game.accent === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
        }`} 
      />

      {/* Cyber grid lines */}
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:14px_14px]" />

      {/* Unique visual graphics per game */}
      <div className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-105">
        {game.id === 'snake' && (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M 20 20 H 60 V 50 H 30 V 80 H 70" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="70" cy="80" r="5" fill="#34d399" filter="drop-shadow(0 0 6px #10b981)" />
              <circle cx="85" cy="30" r="6" fill="#f43f5e" filter="drop-shadow(0 0 8px #f43f5e)" />
            </svg>
          </div>
        )}

        {game.id === 'tictactoe' && (
          <div className="grid grid-cols-3 gap-2 w-20 h-20">
            <div className="text-xl font-black text-cyan-400 flex items-center justify-center border-b border-r border-slate-700/60">X</div>
            <div className="text-xl font-black text-purple-400 flex items-center justify-center border-b border-r border-slate-700/60">O</div>
            <div className="text-xl font-black text-cyan-400 flex items-center justify-center border-b border-slate-700/60">X</div>
            <div className="text-xl font-black text-purple-400 flex items-center justify-center border-b border-r border-slate-700/60">O</div>
            <div className="text-xl font-black text-cyan-400 flex items-center justify-center border-b border-r border-slate-700/60">X</div>
            <div className="border-b border-slate-700/60" />
            <div className="text-xl font-black text-purple-400 flex items-center justify-center border-r border-slate-700/60">O</div>
            <div className="border-r border-slate-700/60" />
            <div className="text-xl font-black text-cyan-400 flex items-center justify-center">X</div>
          </div>
        )}

        {game.id === 'rps' && (
          <div className="flex items-center gap-2">
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">✊</span>
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">✋</span>
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">✌️</span>
          </div>
        )}

        {game.id === 'memory' && (
          <div className="grid grid-cols-2 gap-2 w-20 h-20">
            <div className="bg-purple-900/60 border border-purple-500/50 rounded flex items-center justify-center text-purple-300 font-bold shadow-sm">★</div>
            <div className="bg-indigo-900/40 border border-indigo-700/40 rounded flex items-center justify-center text-slate-500 font-bold">?</div>
            <div className="bg-indigo-900/40 border border-indigo-700/40 rounded flex items-center justify-center text-slate-500 font-bold">?</div>
            <div className="bg-purple-900/60 border border-purple-500/50 rounded flex items-center justify-center text-purple-300 font-bold shadow-sm">★</div>
          </div>
        )}

        {game.id === 'minesweeper' && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <Bomb className="w-12 h-12 text-rose-500 filter drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
              <span className="absolute -top-1 -right-2 text-xs font-mono font-bold text-amber-400 bg-slate-900 px-1 rounded border border-amber-500/30">!</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              <span className="w-4 h-4 rounded-xs bg-slate-800 text-[10px] text-cyan-400 font-bold flex items-center justify-center">1</span>
              <span className="w-4 h-4 rounded-xs bg-slate-800 text-[10px] text-emerald-400 font-bold flex items-center justify-center">2</span>
              <span className="w-4 h-4 rounded-xs bg-slate-800 text-[10px] text-rose-400 font-bold flex items-center justify-center">3</span>
            </div>
          </div>
        )}

        {game.id === 'sudoku' && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 border border-purple-500/30 rounded">
            {[5, 3, 4, 6, 7, 2, 1, 9, 8].map((n, idx) => (
              <div key={idx} className="w-5 h-5 flex items-center justify-center text-[11px] font-mono font-bold text-purple-300 bg-slate-800/80 rounded-xs">
                {n}
              </div>
            ))}
          </div>
        )}

        {game.id === 'wordguess' && (
          <div className="flex gap-1">
            {['P', 'L', 'A', 'Y', 'Z'].map((letter, i) => (
              <div key={i} className={`w-7 h-9 flex items-center justify-center text-xs font-black rounded-xs ${
                i === 0 || i === 2 ? 'bg-emerald-600 text-white' :
                i === 1 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {letter}
              </div>
            ))}
          </div>
        )}

        {game.id === 'hangman' && (
          <div className="relative w-16 h-20">
            <svg viewBox="0 0 60 70" className="w-full h-full stroke-amber-400 fill-none" strokeWidth="2.5" strokeLinecap="round">
              <line x1="10" y1="65" x2="50" y2="65" />
              <line x1="25" y1="65" x2="25" y2="10" />
              <line x1="25" y1="10" x2="45" y2="10" />
              <line x1="45" y1="10" x2="45" y2="20" />
              <circle cx="45" cy="26" r="6" stroke="#38bdf8" />
              <line x1="45" y1="32" x2="45" y2="48" stroke="#38bdf8" />
              <line x1="45" y1="38" x2="36" y2="32" stroke="#38bdf8" />
              <line x1="45" y1="38" x2="54" y2="32" stroke="#38bdf8" />
            </svg>
          </div>
        )}

        {game.id === 'flappy' && (
          <div className="relative w-24 h-20 flex items-center justify-center">
            {/* Pillars */}
            <div className="absolute left-2 top-0 w-3 h-6 bg-emerald-500 rounded-b" />
            <div className="absolute left-2 bottom-0 w-3 h-6 bg-emerald-500 rounded-t" />
            {/* Neon Bird */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.6)]">
              <span className="text-xs">⚡</span>
            </div>
          </div>
        )}

        {game.id === 'breakout' && (
          <div className="w-24 h-20 flex flex-col justify-between items-center py-1">
            <div className="grid grid-cols-4 gap-1 w-full px-2">
              <div className="h-2 bg-rose-500 rounded-xs" />
              <div className="h-2 bg-amber-500 rounded-xs" />
              <div className="h-2 bg-cyan-500 rounded-xs" />
              <div className="h-2 bg-purple-500 rounded-xs" />
            </div>
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            <div className="w-12 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]" />
          </div>
        )}

        {game.id === 'whackamole' && (
          <div className="relative w-20 h-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-rose-500 flex items-center justify-center text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
              🤖
            </div>
            <div className="w-16 h-3 bg-slate-950 border border-slate-700 rounded-full mt-1" />
          </div>
        )}

        {game.id === 'simon' && (
          <div className="grid grid-cols-2 gap-1.5 w-18 h-18 p-1.5 bg-slate-950 rounded-full border border-slate-700/80 shadow-md">
            <div className="bg-emerald-500 rounded-tl-full shadow-[0_0_8px_#10b981]" />
            <div className="bg-rose-500 rounded-tr-full shadow-[0_0_8px_#f43f5e]" />
            <div className="bg-amber-400 rounded-bl-full shadow-[0_0_8px_#fbbf24]" />
            <div className="bg-cyan-500 rounded-br-full shadow-[0_0_8px_#06b6d4]" />
          </div>
        )}

        {game.id === 'puzzle15' && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-indigo-500/40 rounded">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <div key={num} className="w-5 h-5 bg-indigo-950 border border-indigo-600/40 rounded flex items-center justify-center text-[10px] font-bold text-indigo-200">
                {num}
              </div>
            ))}
            <div className="w-5 h-5 bg-slate-950 rounded" />
          </div>
        )}

        {game.id === 'bubbleshooter' && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1">
              <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              <span className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
              <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            </div>
            <div className="w-0.5 h-6 bg-slate-600 mt-2" />
            <span className="w-5 h-5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          </div>
        )}

        {game.id === 'colormatch' && (
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-rose-500 tracking-wider">BLUE</span>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded">YES</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-500/40 rounded">NO</span>
            </div>
          </div>
        )}

        {game.id === 'reaction' && (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Timer className="w-7 h-7 text-emerald-400" />
            </div>
            <span className="text-[11px] font-mono text-emerald-300 mt-1 font-bold">CLICK!</span>
          </div>
        )}

        {game.id === 'typingspeed' && (
          <div className="flex flex-col items-center">
            <Keyboard className="w-10 h-10 text-amber-400 mb-1 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
            <span className="text-xs font-mono font-bold text-slate-300">WPM: <span className="text-amber-400">92</span></span>
          </div>
        )}

        {/* Fallback generic high tech icon if any unlisted */}
        {!['snake', 'tictactoe', 'rps', 'memory', 'minesweeper', 'sudoku', 'wordguess', 'hangman', 'flappy', 'breakout', 'whackamole', 'simon', 'puzzle15', 'bubbleshooter', 'colormatch', 'reaction', 'typingspeed'].includes(game.id) && (
          <Gamepad2 className="w-12 h-12 text-purple-400 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
        )}
      </div>

      {/* Card Gradient Footer */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

      {badge && (
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-600/90 text-white rounded shadow-sm backdrop-blur-xs">
          {badge}
        </span>
      )}
    </div>
  );
};
