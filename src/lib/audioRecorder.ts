/**
 * Utilitário de Gravação e Processamento de Áudio para o Chat do Personal OS
 * - Captura áudio via MediaRecorder (WebM / Opus / MP4)
 * - Reconhecimento de fala nativo opcional em tempo real (Web Speech API pt-BR)
 * - Conversão para Base64 e Blob URL para reprodução imediata
 */

export interface RecordedAudioData {
  blob: Blob;
  base64: string;
  mimeType: string;
  durationSeconds: number;
  audioUrl: string;
  transcript?: string;
}

export class AudioRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private speechRecognition: any = null;
  private currentTranscript: string = '';

  /**
   * Verifica se o navegador tem suporte a gravação de áudio
   */
  public static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      navigator?.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window.MediaRecorder !== 'undefined'
    );
  }

  /**
   * Inicia a gravação de áudio
   */
  public async startRecording(onTranscriptUpdate?: (text: string) => void): Promise<void> {
    if (!AudioRecorderService.isSupported()) {
      throw new Error('Gravação de áudio não suportada neste navegador.');
    }

    this.audioChunks = [];
    this.currentTranscript = '';
    this.startTime = Date.now();

    // 1. Obter acesso ao microfone
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });

    // 2. Determinar o melhor mimeType suportado
    const preferredTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac'
    ];

    let selectedType = '';
    for (const t of preferredTypes) {
      if (MediaRecorder.isTypeSupported(t)) {
        selectedType = t;
        break;
      }
    }

    this.mediaRecorder = selectedType
      ? new MediaRecorder(this.mediaStream, { mimeType: selectedType })
      : new MediaRecorder(this.mediaStream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(150); // Coleta dados a cada 150ms

    // 3. Tentar reconhecimento de fala nativo em tempo real como auxílio imediato (Web Speech API)
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = 'pt-BR';
          rec.continuous = true;
          rec.interimResults = true;

          rec.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript + ' ';
            }
            this.currentTranscript = transcript.trim();
            if (onTranscriptUpdate) {
              onTranscriptUpdate(this.currentTranscript);
            }
          };

          rec.onerror = () => {
            // Ignora silenciosamente erros de SpeechRecognition (ex: 'no-speech')
          };

          rec.start();
          this.speechRecognition = rec;
        } catch {
          // Navegador pode bloquear ou não ter suporte pleno
        }
      }
    }
  }

  /**
   * Finaliza a gravação e retorna os dados do áudio gravado
   */
  public async stopRecording(): Promise<RecordedAudioData> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Nenhuma gravação ativa.'));
      }

      const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      // Parar reconhecimento de voz se ativo
      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
        } catch {}
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Converter para base64
          const base64 = await AudioRecorderService.blobToBase64(audioBlob);

          // Liberar trilhas de áudio do microfone
          if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
          }

          resolve({
            blob: audioBlob,
            base64,
            mimeType,
            durationSeconds,
            audioUrl,
            transcript: this.currentTranscript || undefined
          });
        } catch (err) {
          reject(err);
        } finally {
          this.mediaRecorder = null;
          this.audioChunks = [];
        }
      };

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Cancela a gravação descartando qualquer áudio
   */
  public cancelRecording(): void {
    if (this.speechRecognition) {
      try { this.speechRecognition.stop(); } catch {}
      this.speechRecognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch {}
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.currentTranscript = '';
  }

  /**
   * Processa um arquivo de áudio carregado pelo usuário
   */
  public static async processAudioFile(file: File): Promise<RecordedAudioData> {
    const audioUrl = URL.createObjectURL(file);
    const base64 = await AudioRecorderService.blobToBase64(file);

    return {
      blob: file,
      base64,
      mimeType: file.type || 'audio/webm',
      durationSeconds: 0,
      audioUrl
    };
  }

  /**
   * Helper para converter Blob em Base64 puro (sem o prefixo data:audio/...)
   */
  public static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove prefixo data:*/*;base64, se existir
        const base64Data = result.split(',')[1] || result;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

