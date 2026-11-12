// Processamento de Áudio


class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.frequencyData = new Uint8Array();
        this.waveformData = new Uint8Array();
        this.isPlaying = false;
        this.sourceNode = null;
    }
    
    async startMicrophone() {
        console.log('Iniciando captura do microfone...');
        this.stop();
        this.audioContext = new AudioContext();
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.setupAnalyser(source);
        this.isPlaying = true;
    }
    
    setupAnalyser(source) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        source.connect(this.analyser);
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.waveformData = new Uint8Array(this.analyser.fftSize);
    }
    
    async loadAudioFile(file) {
        console.log('Carregando ficheiro de áudio...');

        this.stop();
        this.audioContext = new AudioContext();

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        this.setupAnalyser(source);
        this.analyser.connect(this.audioContext.destination);

        source.onended = () => {
            if (this.sourceNode === source) {
                this.isPlaying = false;
            }
        };

        this.sourceNode = source;
        source.start();
        this.isPlaying = true;
    }
    
    stop() {
        console.log('Parando processamento de áudio...');
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.sourceNode) {
            this.sourceNode.onended = null;
            this.sourceNode = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
        this.frequencyData.fill(0);
        this.waveformData.fill(128);
        this.isPlaying = false;
    }
    
    update() {
        if (!this.analyser) {
            return;
        }

        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.waveformData);
    }
    
    getFrequencyData() {
        return this.frequencyData;
    }
    
    getWaveformData() {
        return this.waveformData;
    }
    
    calculateAudioLevel() {
        if (this.waveformData.length === 0) {
            return 0;
        }

        let sum = 0;
        for (let i = 0; i < this.waveformData.length; i++) {
            const valor = (this.waveformData[i] - 128) / 128;
            sum += valor * valor;
        }
        return Math.sqrt(sum / this.waveformData.length);
    }
}