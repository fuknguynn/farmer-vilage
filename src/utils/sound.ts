export type SfxType =
  | 'till'
  | 'water'
  | 'seed'
  | 'harvest'
  | 'coin'
  | 'buy'
  | 'shop'
  | 'gate'
  | 'step'
  | 'click'
  | 'back'
  | 'fish'
  | 'eat'
  | 'quest'
  | 'sleep'
  | 'error'
  | 'animal';

const SFX_FILES: Record<SfxType, string> = {
  till: '/assets/cozy-farm/sfx/hoe-dig.wav',
  water: '/assets/cozy-farm/sfx/watering.wav',
  seed: '/assets/cozy-farm/sfx/seed-plant.wav',
  harvest: '/assets/cozy-farm/sfx/harvest-pop.wav',
  coin: '/assets/cozy-farm/sfx/sell-coins.wav',
  buy: '/assets/cozy-farm/sfx/buy.wav',
  shop: '/assets/cozy-farm/sfx/shop-bell.wav',
  gate: '/assets/cozy-farm/sfx/gate.wav',
  step: '/assets/cozy-farm/sfx/step-grass.wav',
  click: '/assets/cozy-farm/sfx/ui-click.wav',
  back: '/assets/cozy-farm/sfx/ui-back.wav',
  fish: '/assets/cozy-farm/sfx/watering.wav',
  eat: '/assets/cozy-farm/sfx/harvest-pop.wav',
  quest: '/assets/cozy-farm/sfx/jingle-level-up.wav',
  sleep: '/assets/cozy-farm/sfx/jingle-new-day.wav',
  error: '/assets/cozy-farm/sfx/not-enough-money.wav',
  animal: '/assets/cozy-farm/sfx/harvest-pop.wav'
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmInterval: number | null = null;
  private ambienceAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  public bgmVolume: number = 0.4;
  public sfxVolume: number = 0.7;
  public muted: boolean = false;
  private isPlayingBgm: boolean = false;
  private noteIndex: number = 0;
  private lastStepTime: number = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public updateSettings(bgmVolume: number, sfxVolume: number, muted: boolean) {
    this.bgmVolume = bgmVolume;
    this.sfxVolume = sfxVolume;
    this.muted = muted;
    if (this.ambienceAudio) {
      this.ambienceAudio.volume = muted ? 0 : Math.min(1, bgmVolume * 0.65);
    }
    if (muted) {
      this.stopBgm();
    } else if (!this.isPlayingBgm) {
      this.startBgm();
    }
  }

  public startBgm() {
    if (this.muted || this.isPlayingBgm) return;
    this.isPlayingBgm = true;

    // Phát âm thanh chim hót buổi sáng gốc của Cozy Farm (ambience-morning-birds.ogg)
    try {
      if (!this.ambienceAudio) {
        this.ambienceAudio = new Audio('/assets/cozy-farm/sfx/ambience-morning-birds.ogg');
        this.ambienceAudio.loop = true;
      }
      this.ambienceAudio.volume = this.muted ? 0 : Math.min(1, this.bgmVolume * 0.65);
      this.ambienceAudio.play().catch(() => {});
    } catch {
      // Ignore autoplay block until next user interaction
    }

    // Giai điệu đồng quê ngũ cung êm dịu kết hợp cùng tiếng chim rừng
    const melody = [
      523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33,
      523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0
    ];

    this.bgmInterval = window.setInterval(() => {
      if (this.muted || this.bgmVolume <= 0.01) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      const freq = melody[this.noteIndex % melody.length];
      this.noteIndex++;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const vol = this.bgmVolume * 0.05;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.9);
      } catch {
        // Ignore audio errors when tab inactive
      }
    }, 1100);
  }

  public stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.ambienceAudio) {
      this.ambienceAudio.pause();
    }
  }

  public playStepSfx() {
    const now = performance.now();
    if (now - this.lastStepTime < 280) return;
    this.lastStepTime = now;
    this.playSfx('step');
  }

  public playSfx(type: SfxType) {
    if (this.muted || this.sfxVolume <= 0.01) return;

    const url = SFX_FILES[type];
    if (url) {
      try {
        let baseAudio = this.audioCache.get(url);
        if (!baseAudio) {
          baseAudio = new Audio(url);
          baseAudio.preload = 'auto';
          this.audioCache.set(url, baseAudio);
        }
        const clone = baseAudio.cloneNode(true) as HTMLAudioElement;
        const scale = type === 'step' ? 0.35 : type === 'click' ? 0.55 : 0.85;
        clone.volume = Math.max(0, Math.min(1, this.sfxVolume * scale));
        clone.play().catch(() => {});
        return;
      } catch {
        // Fallback below if HTMLAudioElement fails
      }
    }
  }
}

export const soundManager = new SoundManager();
