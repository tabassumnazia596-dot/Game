import React, { useState } from 'react';
import { Mail, Shield, FileText, HelpCircle, Send, CheckCircle2, Gamepad2, ArrowLeft, Heart } from 'lucide-react';
import { sound } from '../utils/sound';

export const AboutPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-slate-400 hover:text-white mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Games
      </button>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">About PlayZone</h1>
            <p className="text-xs text-slate-400 font-mono">The Pure Web Gaming Destination</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            Welcome to <strong className="text-white">PlayZone</strong>, a premier web gaming platform designed for gamers of all ages. Our mission is to make fun, high-performance browser games instantly accessible without mandatory downloads, intrusive installers, or paywalls.
          </p>
          <p>
            Every single title in our 20-game library is engineered with clean HTML5 Canvas, modern Web Audio synthesis, and responsive mobile touch controls. Whether you are looking for arcade classics like <em>Neon Snake</em> and <em>Breakout</em>, mind-bending puzzles like <em>2048</em> and <em>Sudoku</em>, or fast reflex challenges like <em>Cyber Sprint</em> and <em>Galaxy Raider</em>, PlayZone brings you instant entertainment.
          </p>
        </div>

        {/* Features highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase mb-1">Zero Downloads</h4>
            <p className="text-xs text-slate-400">Play instantaneously in any standard web browser on desktop, tablet, or smartphone.</p>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <h4 className="text-xs font-mono font-bold text-purple-400 uppercase mb-1">Local High Scores</h4>
            <p className="text-xs text-slate-400">Your high scores and favorite bookmarked games remain stored safely on your device.</p>
          </div>
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase mb-1">Clean & Responsive</h4>
            <p className="text-xs text-slate-400">Engineered with low latency budgets, fluid keyboard controls, and intuitive touch buttons.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Feedback', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.score();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-slate-400 hover:text-white mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Games
      </button>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Contact PlayZone</h1>
            <p className="text-xs text-slate-400 font-mono">Feedback, Bug Reports & Inquiries</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">Message Received!</h3>
            <p className="text-xs text-slate-300 max-w-sm mb-5">
              Thank you for reaching out, {form.name}. We review all player suggestions and bug reports.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: 'Feedback', message: '' }); }}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Gamer tag or name"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Inquiry Topic</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
              >
                <option value="Feedback">General Game Feedback</option>
                <option value="Bug">Report Game Bug</option>
                <option value="GameRequest">New Game Request</option>
                <option value="Advertising">Advertising / Sponsorship Partnership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your experience or report an issue..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Submit Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-slate-400 hover:text-white mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Games
      </button>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-400 font-mono">Last Updated: October 2026</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            At PlayZone, we respect your privacy and are committed to safeguarding player data. This Privacy Policy outlines what information we collect and how it is used when you interact with our website.
          </p>

          <h3 className="text-sm font-bold text-white uppercase font-mono mt-4">1. Local Storage and Preferences</h3>
          <p>
            PlayZone uses your browser’s local storage (`localStorage`) solely to store your gameplay preferences, such as your high scores, audio mute settings, and favorite bookmarked games. This data resides exclusively on your local device and is not transmitted to external servers.
          </p>

          <h3 className="text-sm font-bold text-white uppercase font-mono mt-4">2. Cookies and Advertising Partners</h3>
          <p>
            PlayZone may display advertisements served by third-party advertising partners such as Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other websites. You may opt out of personalized advertising by visiting Google Ads Settings.
          </p>

          <h3 className="text-sm font-bold text-white uppercase font-mono mt-4">3. Children’s Privacy</h3>
          <p>
            Our games are designed for general audiences. We do not knowingly collect or solicit personal identifiable information from children under the age of 13.
          </p>

          <h3 className="text-sm font-bold text-white uppercase font-mono mt-4">4. Contact Information</h3>
          <p>
            If you have questions or concerns regarding our privacy practices, please reach out via our Contact page.
          </p>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      <button
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-slate-400 hover:text-white mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Games
      </button>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Terms of Use</h1>
            <p className="text-xs text-slate-400 font-mono">Last Updated: October 2026</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            By accessing and enjoying games on PlayZone, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h3 className="text-sm font-bold text-white uppercase font-mono mt-4">1. Free Access and Entertainment</h3>
          <p>
            All browser games on PlayZone are provided free of charge for recreational, non-commercial entertainment. You may not sell, redistribute, or reverse-engineer game assets without authorization.
          </p>

          <h3 className="text-sm font-bold text-white uppercase font-mono mt-4">2. Intellectual Property</h3>
          <p>
            All code, original graphics, designs, logos, and audio synthesis routines created for PlayZone are the intellectual property of PlayZone and its licensors.
          </p>

          <h3 className="text-sm font-bold text-white uppercase font-mono mt-4">3. Disclaimers</h3>
          <p>
            Games are provided "as is" without warranty of any kind. While we strive to maintain uninterrupted access and smooth performance across all modern browsers, PlayZone is not liable for device incompatibilities or gameplay interruptions.
          </p>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center animate-in fade-in duration-200">
      <div className="w-24 h-24 mx-auto mb-4 bg-purple-950/60 border-2 border-purple-500/40 rounded-3xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(168,85,247,0.3)]">
        👾
      </div>
      <span className="text-xs font-mono uppercase tracking-widest text-purple-400">Error 404</span>
      <h1 className="text-3xl sm:text-4xl font-black text-white my-2">SECTOR NOT FOUND</h1>
      <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm mx-auto">
        The game portal or stage you requested has warped into an alternate dimension.
      </p>
      <button
        onClick={onNavigateHome}
        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer"
      >
        <Gamepad2 className="w-4 h-4" /> Return to Arena
      </button>
    </div>
  );
};
