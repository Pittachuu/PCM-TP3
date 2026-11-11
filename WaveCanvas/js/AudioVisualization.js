// Classe Abstrata Base para Visualizações
class AudioVisualization {
    constructor(canvas, audioProcessor) {
        if (this.constructor === AudioVisualization) {
            throw new Error('AudioVisualization é uma classe abstrata e não pode ser instanciada diretamente.');
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioProcessor = audioProcessor;
        this.name = 'Visualização';
        this.properties = {};
        this.testData = new Uint8Array(256);
        this.frameCount = 0;
        this.audioLevel = audioProcessor ? 0 : 0.5;
        
        // Inicializar dados de teste
        for (let i = 0; i < this.testData.length; i++) {
            this.testData[i] = Math.sin(i / 10) * 128 + 128;
        }

        this.properties.sensitivity = 1;
        this.properties.intensity = 0.5;
    }
    
    draw() {
        throw new Error('Método draw() deve ser implementado pela subclasse.');
    }
    
    update() {
        this.frameCount++;

        if (this.audioProcessor) {
            this.audioProcessor.update();
            this.audioLevel = this.lerp(this.audioLevel, this.audioProcessor.calculateAudioLevel(), 0.2);
        }
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    
    getProperties() {
        return this.properties;
    }
    
    updateProperty(property, value) {
        if (this.properties.hasOwnProperty(property)) {
            this.properties[property] = value;
        }
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Desenha uma grelha de linhas ténues no fundo do canvas.
     *
     * @returns {void}
     */
    drawGrid() {
        const step = 50;
        this.ctx.beginPath();
        for (let x = 0; x <= this.canvas.width; x += step) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        for (let y = 0; y <= this.canvas.height; y += step) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.strokeStyle = "rgba(76, 201, 240, 0.15)";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    /**
     * Cria um gradiente vertical (de baixo para cima) com as cores indicadas.
     *
     * @param {string[]} [colors] - Cores do gradiente, da base para o topo (por defeito, a paleta da visualização).
     * @returns {CanvasGradient} Gradiente pronto a usar em fillStyle ou strokeStyle.
     */
    createGradient(colors = this.getPalette()) {
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / Math.max(colors.length - 1, 1), colors[i]);
        }
        return gradient;
    }
    
    /**
     * Converte dados de áudio para valores entre 0 e 1.
     *
     * @param {Uint8Array|number[]} data - Dados de áudio a normalizar.
     * @param {number} [min=0] - Valor mínimo esperado nos dados.
     * @param {number} [max=255] - Valor máximo esperado nos dados.
     * @returns {number[]} Valores normalizados.
     */
    normalizeData(data, min = 0, max = 255) {
        return Array.from(data).map(value => (value - min) / (max - min));
    }

    /**
     * Multiplica os dados pela sensibilidade, limitando o resultado a 1.
     *
     * @param {number[]} data - Dados já normalizados (0 a 1).
     * @param {number} sensitivity - Multiplicador (1 = normal).
     * @returns {number[]} Dados com a sensibilidade aplicada.
     */
    applySensitivity(data, sensitivity) {
        return data.map(value => Math.min(value * sensitivity, 1));
    }

    /**
     * Acrescenta às propriedades as três cores da paleta (base, meio e topo).
     * Cada visualização que usa a paleta chama este método no construtor.
     *
     * @returns {void}
     */
    addColorProperties() {
        this.properties.colorLow = '#4361ee';
        this.properties.colorMid = '#4cc9f0';
        this.properties.colorHigh = '#f72585';
    }

    /**
     * Devolve a paleta atual (base, meio e topo). Se a visualização não tiver
     * cores próprias, usa as cores por defeito do projeto.
     *
     * @returns {string[]} Três cores em formato #rrggbb.
     */
    getPalette() {
        return [
            this.properties.colorLow || '#4361ee',
            this.properties.colorMid || '#4cc9f0',
            this.properties.colorHigh || '#f72585'
        ];
    }

    /**
     * Opacidade do desenho. A intensidade diz o quanto o volume influencia:
     * com intensidade 0 é sempre 1; com intensidade 1 vai de 0.35 (silêncio)
     * a 1 (volume alto).
     *
     * @returns {number} Opacidade entre 0.35 e 1.
     */
    getIntensityAlpha() {
        const boost = Math.min(this.audioLevel * 3, 1);
        return 1 - this.properties.intensity * 0.65 * (1 - boost);
    }

    /**
     * Brilho (sombra) ajustado ao volume: com volume alto o brilho aumenta
     * e com volume baixo diminui, tanto mais quanto maior a intensidade.
     *
     * @param {number} baseGlow - Brilho definido pelo utilizador.
     * @returns {number} Brilho a usar neste frame.
     */
    getGlowAmount(baseGlow) {
        const boost = Math.min(this.audioLevel * 3, 1);
        return baseGlow * (1 + this.properties.intensity * (boost - 0.5));
    }

    /**
     * Interpolação linear entre dois valores.
     *
     * @param {number} start - Valor inicial.
     * @param {number} end - Valor final.
     * @param {number} t - Fração do caminho (0 = start, 1 = end).
     * @returns {number} Valor intermédio.
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Aproxima, aos poucos, os valores anteriores dos valores novos
     * (para as animações não darem saltos).
     *
     * @param {number[]|null} previous - Valores do frame anterior.
     * @param {number[]} target - Valores novos.
     * @param {number} smoothing - Suavização de 0 (sem suavizar) a 0.95 (muito lento).
     * @returns {number[]} Valores suavizados.
     */
    smoothData(previous, target, smoothing) {
        if (!previous || previous.length !== target.length) {
            return target.slice();
        }
        return target.map((value, i) => this.lerp(previous[i], value, 1 - smoothing));
    }

    /**
     * Converte uma cor #rrggbb para rgba(...) com a transparência indicada.
     *
     * @param {string} hex - Cor em formato #rrggbb.
     * @param {number} alpha - Transparência de 0 a 1.
     * @returns {string} Cor em formato rgba(r, g, b, a).
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
