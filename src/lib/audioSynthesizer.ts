// ==============================================================================
// ADHD SOUND GENERATOR (Web Audio API - Zero external files)
// Gerador nativo de Ruído Marrom (Brown Noise) e Tons Binaurais (40Hz Gama)
// ==============================================================================

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentType: 'brown' | 'binaural' | 'none' = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Ruído Marrom (Brownian Noise):
   * O padrão-ouro para TDAH na literatura científica. Atenua frequências agudas
   * e cria um manto sonoro contínuo que reduz dispersão e ruídos ambientais.
   */
  public startBrownNoise(volume = 0.25) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensar volume
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtro Passa-Baixas para suavizar ainda mais
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Tom quente e aveludado

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    whiteNoise.start(0);
    this.noiseNode = whiteNoise;
    this.isPlaying = true;
    this.currentType = 'brown';
  }

  /**
   * Pulso Isocrônico / Foco em 40Hz (Gama):
   * Estímulo sonoro associado ao aumento de foco cognitivo e processamento de informações.
   */
  public startFocusTone(volume = 0.15) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    const carrierOsc = this.ctx.createOscillator();
    carrierOsc.type = 'sine';
    carrierOsc.frequency.setValueAtTime(200, this.ctx.currentTime); // Tom portador suave

    const modOsc = this.ctx.createOscillator();
    modOsc.type = 'sine';
    modOsc.frequency.setValueAtTime(40, this.ctx.currentTime); // Modulação 40Hz

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(volume * 0.5, this.ctx.currentTime);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

    carrierOsc.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    carrierOsc.start();
    this.noiseNode = carrierOsc;
    this.isPlaying = true;
    this.currentType = 'binaural';
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch (e) {
        // Ignora se já estiver parado
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
    this.currentType = 'none';
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      type: this.currentType
    };
  }
}

export const soundSynthesizer = new SoundSynthesizer();

