/**
 * Web Audio API procedural sound engine for 8-bit chiptune music and sound effects.
 * No external assets needed, 100% reliable and instantaneous.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private musicInterval: number | null = null;
  private currentTrack: 'level' | 'boss' | 'victory' | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private step: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // SOUND EFFECTS
  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playMeow() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(4, now);

    // Cute feline inflection (starts mid, rises high, drops softly: Mye-oo-w)
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(780, now + 0.12);
    osc.frequency.linearRampToValueAtTime(520, now + 0.32);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.22);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playFishCollect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Sparkly chime
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    osc2.frequency.setValueAtTime(1975.53, now); // B6
    osc2.frequency.setValueAtTime(2637.02, now + 0.08); // E7

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.26);
    osc2.stop(now + 0.26);
  }

  public playFart() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // 1. Low pitched sawtooth with pitch wobble
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.1);
    osc.frequency.linearRampToValueAtTime(55, now + 0.28);

    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 0.3);

    // 2. Filtered noise burst for that authentic comical "pfffrt"
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(200, now + 0.3);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
    noise.start(now);
    noise.stop(now + 0.3);
  }

  public playKiss() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    
    // Comic wet smack "Чмок!"
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playBossHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Coughing / reaction sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playSwoop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // MUSIC GENERATION
  public playMusic(track: 'level' | 'boss' | 'victory') {
    if (this.currentTrack === track) return;
    this.stopMusic();
    this.currentTrack = track;
    this.initCtx();

    if (track === 'level') {
      this.startLevelMusic();
    } else if (track === 'boss') {
      this.startBossMusic();
    } else if (track === 'victory') {
      this.startVictoryMusic();
    }
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTrack = null;
    this.step = 0;
  }

  private startLevelMusic() {
    // Cheerful, bouncy cat exploration chiptune (Key of C Major / A Minor)
    const melody = [
      523.25, 0, 659.25, 783.99,  880.00, 783.99, 659.25, 523.25,
      587.33, 0, 659.25, 698.46,  783.99, 698.46, 659.25, 587.33,
      523.25, 659.25, 783.99, 1046.50, 987.77, 783.99, 880.00, 659.25,
      698.46, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25, 0
    ];
    const bass = [
      130.81, 130.81, 196.00, 130.81, 174.61, 174.61, 220.00, 174.61,
      146.83, 146.83, 220.00, 146.83, 196.00, 196.00, 246.94, 196.00
    ];

    const tempo = 135; // ms per 16th note
    this.step = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;

      // Melody note
      const mNote = melody[this.step % melody.length];
      if (mNote > 0) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = 'square';
        mOsc.frequency.setValueAtTime(mNote, now);

        mGain.gain.setValueAtTime(0.08, now);
        mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        mOsc.connect(mGain);
        mGain.connect(this.musicGain);
        mOsc.start(now);
        mOsc.stop(now + 0.13);
      }

      // Bass note
      if (this.step % 2 === 0) {
        const bIdx = Math.floor(this.step / 2) % bass.length;
        const bNote = bass[bIdx];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bNote, now);

        bGain.gain.setValueAtTime(0.18, now);
        bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        bOsc.connect(bGain);
        bGain.connect(this.musicGain);
        bOsc.start(now);
        bOsc.stop(now + 0.24);
      }

      // Snappy 8-bit hi-hat / kick rhythm
      if (this.step % 4 === 2) {
        // Snare pop
        const nOsc = this.ctx.createOscillator();
        const nGain = this.ctx.createGain();
        nOsc.type = 'sawtooth';
        nOsc.frequency.setValueAtTime(200, now);
        nOsc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

        nGain.gain.setValueAtTime(0.06, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        nOsc.connect(nGain);
        nGain.connect(this.musicGain);
        nOsc.start(now);
        nOsc.stop(now + 0.07);
      }

      this.step++;
    }, tempo);
  }

  private startBossMusic() {
    // Fast, tense boss chase music (Key of D Minor / F Major, driving arpeggio)
    const bossNotes = [
      293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 392.00, 466.16,
      293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 329.63, 293.66
    ];
    const bassNotes = [73.42, 73.42, 110.00, 73.42, 87.31, 87.31, 130.81, 87.31];

    const tempo = 110; // Fast chase tempo
    this.step = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;

      const mNote = bossNotes[this.step % bossNotes.length];
      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mOsc.type = 'sawtooth';
      mOsc.frequency.setValueAtTime(mNote, now);

      mGain.gain.setValueAtTime(0.1, now);
      mGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      mOsc.connect(mGain);
      mGain.connect(this.musicGain);
      mOsc.start(now);
      mOsc.stop(now + 0.1);

      if (this.step % 2 === 0) {
        const bNote = bassNotes[(this.step / 2) % bassNotes.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'square';
        bOsc.frequency.setValueAtTime(bNote, now);

        bGain.gain.setValueAtTime(0.14, now);
        bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        bOsc.connect(bGain);
        bGain.connect(this.musicGain);
        bOsc.start(now);
        bOsc.stop(now + 0.19);
      }

      this.step++;
    }, tempo);
  }

  private startVictoryMusic() {
    // Sweet, joyful ending fanfare
    const victoryNotes = [
      523.25, 659.25, 783.99, 1046.50, 0, 783.99, 1046.50, 1318.51
    ];
    let noteIdx = 0;
    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const note = victoryNotes[noteIdx % victoryNotes.length];
      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.36);
      }
      noteIdx++;
    }, 240);
  }
}

export const sound = new SoundEngine();
