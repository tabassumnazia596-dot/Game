// Web Audio API Synthesized Audio Engine for PlayZone
// Zero external mp3 dependencies - 100% reliable, zero latency, works offline.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    const saved = localStorage.getItem('playzone_sound_muted');
    this.isMuted = saved === 'true';
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('playzone_sound_muted', String(this.isMuted));
    return this.isMuted;
  }

  public playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.1, gainVal: number = 0.15) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext could be blocked by autoplay policies until user interacts
    }
  }

  public click() {
    this.playTone(600, 'sine', 0.04, 0.08);
  }

  public move() {
    this.playTone(440, 'triangle', 0.06, 0.1);
  }

  public score() {
    this.playTone(587.33, 'triangle', 0.08, 0.12);
    setTimeout(() => this.playTone(880, 'sine', 0.12, 0.14), 60);
  }

  public match() {
    this.playTone(523.25, 'sine', 0.08, 0.15);
    setTimeout(() => this.playTone(659.25, 'sine', 0.08, 0.15), 70);
    setTimeout(() => this.playTone(783.99, 'sine', 0.15, 0.15), 140);
  }

  public jump() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Ignore
    }
  }

  public laser() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore
    }
  }

  public hit() {
    this.playTone(140, 'square', 0.12, 0.16);
  }

  public win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.18, 0.18), i * 110);
    });
  }

  public gameOver() {
    const notes = [440, 392, 349.23, 293.66];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.22, 0.14), i * 130);
    });
  }

  public simonTone(idx: number) {
    const tones = [261.63, 329.63, 392.0, 523.25];
    this.playTone(tones[idx % tones.length], 'sine', 0.3, 0.2);
  }
}

export const sound = new SoundEngine();
