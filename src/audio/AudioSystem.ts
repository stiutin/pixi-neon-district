interface Tone {
  readonly frequency: number;
  readonly duration: number;
  readonly type: OscillatorType;
  readonly delay?: number;
}

const PEAK_GAIN = 0.055;
const ATTACK = 0.008;

export class AudioSystem {
  private context: AudioContext | null = null;

  constructor(private enabled = true) {}

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public playCollect(): void {
    this.play([
      {frequency: 620, duration: 0.08, type: 'sine'},
      {frequency: 880, duration: 0.09, type: 'sine', delay: 0.045},
    ]);
  }

  public playComplete(): void {
    this.play([
      {frequency: 523, duration: 0.12, type: 'triangle'},
      {frequency: 659, duration: 0.12, type: 'triangle', delay: 0.1},
      {frequency: 784, duration: 0.22, type: 'triangle', delay: 0.2},
    ]);
  }

  public playTalk(): void {
    this.play([{frequency: 300, duration: 0.08, type: 'triangle'}]);
  }

  public playConfirm(): void {
    this.play([{frequency: 520, duration: 0.06, type: 'square'}]);
  }

  public destroy(): void {
    void this.context?.close();
    this.context = null;
  }

  private play(tones: readonly Tone[]): void {
    if (!this.enabled) return;

    const context = this.getContext();
    if (!context) return;

    const now = context.currentTime;
    for (const tone of tones) this.scheduleTone(context, tone, now + (tone.delay ?? 0));
  }

  private getContext(): AudioContext | null {
    if (!this.context) {
      const scope = globalThis as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextClass = scope.AudioContext ?? scope.webkitAudioContext;

      if (!AudioContextClass) return null;

      this.context = new AudioContextClass();
    }

    if (this.context.state === 'suspended') void this.context.resume();

    return this.context;
  }

  private scheduleTone(context: AudioContext, tone: Tone, startTime: number): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = tone.type;
    oscillator.frequency.value = tone.frequency;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, startTime + ATTACK);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + tone.duration);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}
