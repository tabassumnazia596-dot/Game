import React, { useState, useEffect, useRef } from 'react';
import { GameInfo, GAMES_DATA } from '../data/games';
import { 
  Heart, 
  Share2, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Gamepad2, 
  Info, 
  Sparkles,
  Trophy,
  Check
} from 'lucide-react';
import { sound } from '../utils/sound';
import { AdBanner } from './AdBanner';
import { GameThumbnail } from './GameThumbnail';

// Import all 20 game components
import { SnakeGame } from '../games/SnakeGame';
import { TicTacToeGame } from '../games/TicTacToeGame';
import { RPSGame } from '../games/RPSGame';
import { MemoryGame } from '../games/MemoryGame';
import { Game2048 } from '../games/Game2048';
import { MinesweeperGame } from '../games/MinesweeperGame';
import { SudokuGame } from '../games/SudokuGame';
import { WordGuessGame } from '../games/WordGuessGame';
import { HangmanGame } from '../games/HangmanGame';
import { FlappyGame } from '../games/FlappyGame';
import { RunnerGame } from '../games/RunnerGame';
import { BreakoutGame } from '../games/BreakoutGame';
import { SpaceShooterGame } from '../games/SpaceShooterGame';
import { WhackAMoleGame } from '../games/WhackAMoleGame';
import { SimonGame } from '../games/SimonGame';
import { Puzzle15Game } from '../games/Puzzle15Game';
import { BubbleShooterGame } from '../games/BubbleShooterGame';
import { ColorMatchGame } from '../games/ColorMatchGame';
import { ReactionGame } from '../games/ReactionGame';
import { TypingSpeedGame } from '../games/TypingSpeedGame';

interface Props {
  game: GameInfo;
  onBack: () => void;
  onSelectGame: (gameId: string) => void;
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
}

export const GamePlayer: React.FC<Props> = ({
  game,
  onBack,
  onSelectGame,
  favorites,
  onToggleFavorite
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [highScore, setHighScore] = useState<number>(0);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`playzone_hs_${game.id}`);
      if (saved) {
        setHighScore(parseInt(saved, 10));
      } else {
        setHighScore(0);
      }
    } catch {
      setHighScore(0);
    }
  }, [game.id]);

  const handleNewHighScore = (newHs: number) => {
    setHighScore(newHs);
    try {
      localStorage.setItem(`playzone_hs_${game.id}`, String(newHs));
    } catch {
      // Ignore
    }
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const copyShareLink = () => {
    sound.click();
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const isFav = favorites.includes(game.id);

  // Filter related games
  const relatedGames = GAMES_DATA.filter(g => g.id !== game.id && g.category === game.category).slice(0, 4);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 animate-in fade-in duration-200">
      {/* Top back button and game title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Arena</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono text-purple-400 uppercase font-semibold">{game.category}</span>
          <span>·</span>
          <span className="font-mono">{game.playCount.toLocaleString()} plays</span>
          <span>·</span>
          <span className="text-amber-400 font-bold">★ {game.rating}</span>
        </div>
      </div>

      {/* Main Game Screen Window */}
      <div
        ref={gameContainerRef}
        className={`relative bg-[#0a0c1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all ${
          isFullscreen ? 'p-6 flex flex-col justify-center items-center h-screen' : 'p-4 sm:p-6'
        }`}
      >
        {/* Game Title Bar & Quick Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{game.title}</h2>
              <p className="text-xs text-slate-400 line-clamp-1">{game.shortDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute button */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(game.id)}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer ${
                isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Share button */}
            <button
              onClick={copyShareLink}
              title="Share game link"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Game Component Mounting */}
        <div className="w-full flex justify-center py-2 min-h-[380px]">
          {game.id === 'snake' && <SnakeGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'tictactoe' && <TicTacToeGame />}
          {game.id === 'rps' && <RPSGame />}
          {game.id === 'memory' && <MemoryGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === '2048' && <Game2048 highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'minesweeper' && <MinesweeperGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'sudoku' && <SudokuGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'wordguess' && <WordGuessGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'hangman' && <HangmanGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'flappy' && <FlappyGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'runner' && <RunnerGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'breakout' && <BreakoutGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'spaceshooter' && <SpaceShooterGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'whackamole' && <WhackAMoleGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'simon' && <SimonGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'puzzle15' && <Puzzle15Game highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'bubbleshooter' && <BubbleShooterGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'colormatch' && <ColorMatchGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'reaction' && <ReactionGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
          {game.id === 'typingspeed' && <TypingSpeedGame highScore={highScore} onNewHighScore={handleNewHighScore} />}
        </div>
      </div>

      {/* Ad Space below game */}
      <AdBanner format="leaderboard" adSlotId="GAME-BOTTOM-728" />

      {/* Instructions & Controls Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {/* Left Column: Instructions */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">How To Play {game.title}</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {game.description}
          </p>

          <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2">Instructions:</h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {game.instructions.map((ins, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-400 font-mono font-bold">·</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Controls */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Controls Guide</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-mono text-slate-400 text-[11px] uppercase block mb-1">Desktop:</span>
                <span className="px-2.5 py-1.5 bg-slate-800/90 border border-slate-700/80 text-cyan-300 rounded font-mono block">
                  {game.controls.desktop}
                </span>
              </div>

              <div>
                <span className="font-mono text-slate-400 text-[11px] uppercase block mb-1">Mobile & Touch:</span>
                <span className="px-2.5 py-1.5 bg-slate-800/90 border border-slate-700/80 text-purple-300 rounded font-mono block">
                  {game.controls.mobile}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-500 flex items-center justify-between">
            <span>High Score Stored:</span>
            <strong className="text-amber-400">{highScore}</strong>
          </div>
        </div>
      </div>

      {/* Related Games Row */}
      {relatedGames.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">More {game.category} Games</h3>
            <span className="text-xs text-slate-400">Recommended for you</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedGames.map(relGame => (
              <div
                key={relGame.id}
                onClick={() => onSelectGame(relGame.id)}
                className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/60 transition-all hover:-translate-y-1 cursor-pointer group"
              >
                <div className="aspect-[4/3] w-full">
                  <GameThumbnail game={relGame} className="w-full h-full" />
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                    {relGame.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>★ {relGame.rating}</span>
                    <span className="font-mono">{relGame.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
