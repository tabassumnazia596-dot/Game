import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gamepad2, 
  Search, 
  Heart, 
  Shuffle, 
  Flame, 
  Sparkles, 
  Trophy, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  Star, 
  Play, 
  Clock, 
  Tag, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { GAMES_DATA, GameInfo, GameCategory, CATEGORIES } from './data/games';
import { GameThumbnail } from './components/GameThumbnail';
import { GamePlayer } from './components/GamePlayer';
import { AdBanner } from './components/AdBanner';
import { AboutPage, ContactPage, PrivacyPolicyPage, TermsPage, NotFoundPage } from './pages/StaticPages';
import { sound } from './utils/sound';

type ViewMode = 'home' | 'game' | 'category' | 'favorites' | 'all' | 'about' | 'contact' | 'privacy' | 'terms' | '404';

export default function App() {
  const [view, setView] = useState<ViewMode>('home');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentGames, setRecentGames] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'name'>('popular');

  // Load favorites & recent from localStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('playzone_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedRecent = localStorage.getItem('playzone_recent');
      if (savedRecent) setRecentGames(JSON.parse(savedRecent));
    } catch {
      // Local storage may be disabled
    }
  }, []);

  // Handle URL Hash navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/game/')) {
        const gameId = hash.replace('/game/', '');
        const found = GAMES_DATA.find(g => g.id === gameId);
        if (found) {
          setSelectedGameId(gameId);
          setView('game');
        } else {
          setView('404');
        }
      } else if (hash === '/all') {
        setView('all');
      } else if (hash === '/favorites') {
        setView('favorites');
      } else if (hash.startsWith('/category/')) {
        const cat = hash.replace('/category/', '');
        const validCat = CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
        if (validCat) {
          setSelectedCategory(validCat);
          setView('category');
        }
      } else if (hash === '/about') {
        setView('about');
      } else if (hash === '/contact') {
        setView('contact');
      } else if (hash === '/privacy') {
        setView('privacy');
      } else if (hash === '/terms') {
        setView('terms');
      } else if (hash === '' || hash === '/') {
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Toggle favorite
  const toggleFavorite = (gameId: string) => {
    sound.click();
    setFavorites(prev => {
      const next = prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId];
      try {
        localStorage.setItem('playzone_favorites', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Select and launch game
  const launchGame = (gameId: string) => {
    sound.click();
    setSelectedGameId(gameId);
    setView('game');
    window.location.hash = `/game/${gameId}`;

    // Add to recent
    setRecentGames(prev => {
      const filtered = prev.filter(id => id !== gameId);
      const next = [gameId, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('playzone_recent', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch a random game
  const launchRandomGame = () => {
    sound.score();
    const randomIndex = Math.floor(Math.random() * GAMES_DATA.length);
    launchGame(GAMES_DATA[randomIndex].id);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Navigate to page
  const navigateTo = (newView: ViewMode, hash = '') => {
    sound.click();
    setView(newView);
    setMobileMenuOpen(false);
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter and sort games
  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter(g => {
      const matchesSearch = 
        searchQuery === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'All' || g.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.playCount - a.playCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.title.localeCompare(b.title);
    });
  }, [searchQuery, selectedCategory, sortBy]);

  // Featured and popular lists
  const featuredGames = GAMES_DATA.filter(g => g.featured);
  const popularGames = GAMES_DATA.filter(g => g.popular);
  const activeGame = GAMES_DATA.find(g => g.id === selectedGameId);

  return (
    <div className="min-h-screen bg-[#080912] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* ================= TOP NAVIGATION BAR ================= */}
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-50 bg-[#0a0c1c]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark with single text element */}
        <button
          onClick={() => navigateTo('home', '/')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px] shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0a0c1c] rounded-[11px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-purple-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
            Play<span className="text-purple-400">Zone</span>
          </span>
        </button>

        {/* Zone 2: Single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <button
            onClick={() => navigateTo('home', '/')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              view === 'home' ? 'text-purple-400 border-b border-purple-400 pb-0.5' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => { setSelectedCategory('All'); navigateTo('all', '/all'); }}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              view === 'all' && selectedCategory === 'All' ? 'text-purple-400 border-b border-purple-400 pb-0.5' : ''
            }`}
          >
            All Games ({GAMES_DATA.length})
          </button>
          <button
            onClick={() => { setSelectedCategory('Arcade'); navigateTo('category', '/category/arcade'); }}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              view === 'category' ? 'text-purple-400 border-b border-purple-400 pb-0.5' : ''
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => navigateTo('favorites', '/favorites')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer ${
              view === 'favorites' ? 'text-purple-400 border-b border-purple-400 pb-0.5' : ''
            }`}
          >
            <span>Favorites</span>
            {favorites.length > 0 && (
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800/60 px-1.5 py-0.2 rounded-full font-mono">
                {favorites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => navigateTo('about', '/about')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              view === 'about' ? 'text-purple-400 border-b border-purple-400 pb-0.5' : ''
            }`}
          >
            About
          </button>
        </nav>

        {/* Zone 3: Primary Action & Sound Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="hidden sm:flex p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={launchRandomGame}
            className="px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:scale-102 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Game</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0e20] border-b border-slate-800 px-4 py-4 space-y-3 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => navigateTo('home', '/')}
              className="p-2.5 text-left bg-slate-900 border border-slate-800 rounded-lg hover:border-purple-500"
            >
              Home
            </button>
            <button
              onClick={() => { setSelectedCategory('All'); navigateTo('all', '/all'); }}
              className="p-2.5 text-left bg-slate-900 border border-slate-800 rounded-lg hover:border-purple-500"
            >
              All 20 Games
            </button>
            <button
              onClick={() => navigateTo('favorites', '/favorites')}
              className="p-2.5 text-left bg-slate-900 border border-slate-800 rounded-lg hover:border-purple-500 flex items-center justify-between"
            >
              <span>Favorites</span>
              <span className="text-[10px] bg-rose-900/60 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                {favorites.length}
              </span>
            </button>
            <button
              onClick={() => navigateTo('about', '/about')}
              className="p-2.5 text-left bg-slate-900 border border-slate-800 rounded-lg hover:border-purple-500"
            >
              About
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Audio Synth Effects:</span>
            <button
              onClick={handleToggleSound}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-md border border-slate-800"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'Muted' : 'Enabled'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= BODY CONTENT ROUTER ================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW: GAME PLAYER */}
        {view === 'game' && activeGame && (
          <GamePlayer
            game={activeGame}
            onBack={() => navigateTo('home', '/')}
            onSelectGame={launchGame}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* VIEW: ABOUT PAGE */}
        {view === 'about' && <AboutPage onNavigateHome={() => navigateTo('home', '/')} />}

        {/* VIEW: CONTACT PAGE */}
        {view === 'contact' && <ContactPage onNavigateHome={() => navigateTo('home', '/')} />}

        {/* VIEW: PRIVACY PAGE */}
        {view === 'privacy' && <PrivacyPolicyPage onNavigateHome={() => navigateTo('home', '/')} />}

        {/* VIEW: TERMS PAGE */}
        {view === 'terms' && <TermsPage onNavigateHome={() => navigateTo('home', '/')} />}

        {/* VIEW: 404 NOT FOUND */}
        {view === '404' && <NotFoundPage onNavigateHome={() => navigateTo('home', '/')} />}

        {/* VIEW: FAVORITES */}
        {view === 'favorites' && (
          <div className="animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <Heart className="w-7 h-7 text-rose-500 fill-current" />
                  Your Favorite Games
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Bookmarked games saved locally on your device ({favorites.length})
                </p>
              </div>

              <button
                onClick={() => navigateTo('all', '/all')}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 underline"
              >
                Browse All Games
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="py-16 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col items-center text-center p-6">
                <Heart className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-lg font-bold text-slate-300 mb-1">No Favorite Games Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mb-5">
                  Click the heart icon on any game card or inside the game player to add your favorites here for instant access!
                </p>
                <button
                  onClick={() => navigateTo('all', '/all')}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Explore 20 Games
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {GAMES_DATA.filter(g => favorites.includes(g.id)).map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={() => launchGame(game.id)}
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(game.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: CATEGORY OR ALL GAMES */}
        {(view === 'all' || view === 'category') && (
          <div className="animate-in fade-in duration-200">
            {/* Title & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {selectedCategory === 'All' ? 'All Browser Games' : `${selectedCategory} Games`}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Instant free web games · Zero installs required
                </p>
              </div>

              {/* Sorting and Search */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search games..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'popular' | 'rating' | 'name')}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-300 outline-none cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All ({GAMES_DATA.length})
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat} ({GAMES_DATA.filter(g => g.category === cat).length})
                </button>
              ))}
            </div>

            {/* Games Grid */}
            {filteredGames.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/30 border border-slate-800 rounded-2xl">
                <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-300">No games matched "{searchQuery}"</h3>
                <p className="text-xs text-slate-500 mt-1">Try clearing filters or search for another keyword.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="mt-4 px-4 py-2 bg-purple-600 text-xs text-white rounded-lg cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={() => launchGame(game.id)}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={() => toggleFavorite(game.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: HOME PAGE */}
        {view === 'home' && (
          <div className="space-y-12">
            {/* 1. HERO SECTION */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-[#0d0f22] p-6 sm:p-10 lg:p-12 shadow-2xl">
              {/* Background generated hero artwork with measured scrim */}
              <div className="absolute inset-0 z-0">
                <img
                  src="/src/assets/images/hero_gaming_portal_1792853693824.jpg"
                  alt="PlayZone Gaming Arena"
                  className="w-full h-full object-cover object-center opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080912] via-[#080912]/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080912] via-transparent to-transparent" />
              </div>

              {/* Hero Copy & Search Bar */}
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>20 Free Browser Games · 100% Playable</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4 text-balance">
                  Play Free Online Games on <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">PlayZone</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 max-w-xl">
                  Dive into instant browser action with retro arcade favorites, tactical brain teasers, high-speed endless runners, and competitive puzzles. Zero downloads required.
                </p>

                {/* Search Bar in Hero */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg mb-4">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') navigateTo('all', '/all');
                      }}
                      placeholder="Search Snake, 2048, Sudoku, Space Shooter..."
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-purple-400 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur-md shadow-lg"
                    />
                  </div>
                  <button
                    onClick={() => navigateTo('all', '/all')}
                    className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl whitespace-nowrap shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
                  >
                    Find Game
                  </button>
                </div>

                {/* Quick genre tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-slate-500">Popular Genres:</span>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); navigateTo('category', `/category/${cat.toLowerCase()}`); }}
                      className="hover:text-purple-300 underline cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Top Leaderboard Ad Slot */}
            <AdBanner format="leaderboard" adSlotId="HOME-HERO-BELOW" />

            {/* 2. RECENTLY PLAYED SECTION (if any) */}
            {recentGames.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">Continue Playing</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Recently Launched</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recentGames.map(id => {
                    const game = GAMES_DATA.find(g => g.id === id);
                    if (!game) return null;
                    return (
                      <div
                        key={game.id}
                        onClick={() => launchGame(game.id)}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3 hover:border-purple-500/60 transition-all cursor-pointer group"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                          <GameThumbnail game={game} className="w-full h-full" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                            {game.title}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400">{game.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. FEATURED GAMES CAROUSEL / BENTO */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl sm:text-2xl font-black text-white">Featured Games</h2>
                </div>
                <button
                  onClick={() => navigateTo('all', '/all')}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featuredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    featuredCard={true}
                    onPlay={() => launchGame(game.id)}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={() => toggleFavorite(game.id)}
                  />
                ))}
              </div>
            </section>

            {/* 4. POPULAR GAMES */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <h2 className="text-xl sm:text-2xl font-black text-white">Most Popular</h2>
                </div>
                <button
                  onClick={() => { setSortBy('popular'); navigateTo('all', '/all'); }}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>See Leaderboards</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {popularGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={() => launchGame(game.id)}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={() => toggleFavorite(game.id)}
                  />
                ))}
              </div>
            </section>

            {/* In-feed Ad Banner */}
            <AdBanner format="infeed" adSlotId="HOME-MID-INFEED" />

            {/* 5. EXPLORE BY CATEGORY TABS & CAROUSEL */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl sm:text-2xl font-black text-white">Browse Categories</h2>
                <span className="text-xs font-mono text-slate-400">Curated Genres</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                {CATEGORIES.map(cat => {
                  const count = GAMES_DATA.filter(g => g.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); navigateTo('category', `/category/${cat.toLowerCase()}`); }}
                      className="p-4 bg-slate-900/70 border border-slate-800 hover:border-purple-500/60 rounded-2xl flex flex-col items-center text-center transition-all hover:-translate-y-1 group cursor-pointer"
                    >
                      <span className="text-2xl mb-2">
                        {cat === 'Arcade' ? '🕹️' : cat === 'Action' ? '🚀' : cat === 'Puzzle' ? '🧩' : cat === 'Brain' ? '🧠' : '⚡'}
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        {cat}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 mt-1">
                        {count} Games
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 6. COMPLETE 20-GAME CATALOG */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">All 20 Games</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Explore the full instant-play catalog</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as 'popular' | 'rating' | 'name')}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 outline-none"
                  >
                    <option value="popular">Popularity</option>
                    <option value="rating">Rating</option>
                    <option value="name">A to Z</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {GAMES_DATA.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={() => launchGame(game.id)}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={() => toggleFavorite(game.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ================= WEBSITE FOOTER ================= */}
      <footer className="w-full bg-[#06070e] border-t border-slate-800/80 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
                <span className="text-lg font-black text-white">PlayZone</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                PlayZone is an ultra-fast, modern browser gaming portal featuring 20 free, instant games. Play solo or challenge friends without installation.
              </p>
              <div className="text-[11px] font-mono text-slate-500">
                HTML5 Canvas · Web Audio API · Zero Latency
              </div>
            </div>

            {/* Games Categories */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">Categories</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                {CATEGORIES.map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => { setSelectedCategory(cat); navigateTo('category', `/category/${cat.toLowerCase()}`); }}
                      className="hover:text-purple-400 transition-colors cursor-pointer"
                    >
                      {cat} Games
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">Explore</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => navigateTo('home', '/')} className="hover:text-purple-400 transition-colors cursor-pointer">
                    Home Arena
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCategory('All'); navigateTo('all', '/all'); }} className="hover:text-purple-400 transition-colors cursor-pointer">
                    All 20 Games
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('favorites', '/favorites')} className="hover:text-purple-400 transition-colors cursor-pointer">
                    My Favorites ({favorites.length})
                  </button>
                </li>
                <li>
                  <button onClick={launchRandomGame} className="hover:text-purple-400 transition-colors cursor-pointer">
                    Surprise Me (Random)
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Inquiries */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">Legal & Support</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => navigateTo('about', '/about')} className="hover:text-purple-400 transition-colors cursor-pointer">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('contact', '/contact')} className="hover:text-purple-400 transition-colors cursor-pointer">
                    Contact & Feedback
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('privacy', '/privacy')} className="hover:text-purple-400 transition-colors cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('terms', '/terms')} className="hover:text-purple-400 transition-colors cursor-pointer">
                    Terms of Use
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <span>© {new Date().getFullYear()} PlayZone Portal. All 20 browser games are free to play.</span>
            <div className="flex items-center gap-4">
              <span>Ready for Netlify & AdSense</span>
              <span>·</span>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-purple-400 cursor-pointer">
                Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Game Card Component
interface GameCardProps {
  game: GameInfo;
  onPlay: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  featuredCard?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  onPlay,
  isFavorite,
  onToggleFavorite,
  featuredCard = false
}) => {
  return (
    <div
      onClick={onPlay}
      className={`relative bg-[#0c0f24] border border-slate-800/90 rounded-2xl overflow-hidden group hover:border-purple-500/70 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col ${
        featuredCard ? 'shadow-lg' : ''
      }`}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <GameThumbnail game={game} className="w-full h-full" />

        {/* Favorite Heart Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-slate-950/70 backdrop-blur-xs border border-slate-800 transition-colors z-10 cursor-pointer ${
            isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-white'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Category badge */}
        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs border border-slate-700/60 text-slate-300 rounded">
          {game.category}
        </span>

        {/* Play Overlay Button */}
        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-[0_0_15px_#a855f7] transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {game.shortDesc}
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{game.rating}</span>
          </div>
          <span>{game.playCount.toLocaleString()} plays</span>
        </div>
      </div>
    </div>
  );
};
