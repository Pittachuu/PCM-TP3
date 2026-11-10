// Processamento de Áudio


/**
 * Gere a Web Audio API: captura de áudio (microfone ou ficheiro) e
 * análise em tempo real, fornecendo dados de frequência e de forma de onda.
 */
class AudioProcessor {
    /**
     * Cria o processador de áudio no estado inicial (sem áudio a tocar).
     * As propriedades são preenchidas quando o áudio é iniciado.
     */
    constructor() {
        /** @type {AudioContext|null} Contexto de áudio onde vivem todos os nós. */
        this.audioContext = null;
        /** @type {AnalyserNode|null} Nó que analisa o som. */
        this.analyser = null;
        /** @type {MediaStream|null} Stream do microfone (só quando se usa o microfone). */
        this.mediaStream = null;
        /** @type {Uint8Array} Intensidade de cada frequência (0 a 255). */
        this.frequencyData = new Uint8Array();
        /** @type {Uint8Array} Amostras da forma de onda (0 a 255, silêncio = 128). */
        this.waveformData = new Uint8Array();
        /** @type {boolean} Indica se há áudio a ser processado. */
        this.isPlaying = false;
        /** @type {AudioBufferSourceNode|null} Fonte do ficheiro de áudio em reprodução. */
        this.sourceNode = null;
    }
    
    /**
     * Inicia a captura de áudio do microfone.
     * Pede permissão ao utilizador e liga o microfone ao analisador.
     *
     * @async
     * @returns {Promise<void>} Resolve quando o microfone está ativo.
     * @throws {Error} Se o utilizador recusar a permissão ou não existir microfone.
     */
    async startMicrophone() {
        console.log('Iniciando captura do microfone...');
        this.stop();
        this.audioContext = new AudioContext();
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.setupAnalyser(source);
        this.isPlaying = true;
    }
    
    /**
     * Cria o analisador e os arrays de dados com o tamanho certo.
     * É chamado uma vez ao iniciar cada fonte de áudio (microfone ou ficheiro).
     *
     * @param {AudioNode} source - Fonte de áudio a ligar ao analisador.
     * @returns {void}
     */
    setupAnalyser(source) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        source.connect(this.analyser);
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.waveformData = new Uint8Array(this.analyser.fftSize);
    }
    
    /**
     * Carrega um ficheiro de áudio (por exemplo WAV), descodifica-o e começa
     * a tocá-lo, ligando-o ao analisador e às colunas.
     *
     * @async
     * @param {File} file - Ficheiro escolhido no input de ficheiro.
     * @returns {Promise<void>} Resolve quando a reprodução arranca (não quando acaba).
     * @throws {Error} Se o ficheiro não puder ser lido ou descodificado.
     */
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
    
    /**
     * Para o áudio atual: desliga o microfone, fecha o contexto de áudio
     * e repõe os dados em silêncio (frequência a 0 e forma de onda a 128).
     *
     * @returns {void}
     */
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
    
    /**
     * Atualiza os arrays de frequência e de forma de onda com o som do momento.
     * Deve ser chamado uma vez por frame, antes de desenhar.
     *
     * @returns {void}
     */
    update() {
        if (!this.analyser) {
            return;
        }

        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.waveformData);
    }
    
    /**
     * Devolve os dados de frequência (preenchidos pelo update()).
     *
     * @returns {Uint8Array} Intensidade de cada frequência, de 0 a 255.
     */
    getFrequencyData() {
        return this.frequencyData;
    }
    
    /**
     * Devolve os dados da forma de onda (preenchidos pelo update()).
     *
     * @returns {Uint8Array} Amostras de 0 a 255, onde 128 é o silêncio.
     */
    getWaveformData() {
        return this.waveformData;
    }
    
    /**
     * Calcula o nível de volume do momento (RMS da forma de onda).
     *
     * @returns {number} Valor entre 0 (silêncio) e 1 (máximo).
     */
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