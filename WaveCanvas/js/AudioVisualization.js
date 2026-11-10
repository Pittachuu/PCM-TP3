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
        
        // Inicializar dados de teste
        for (let i = 0; i < this.testData.length; i++) {
            this.testData[i] = Math.sin(i / 10) * 128 + 128;
        }

        this.properties.sensitivity = 1;
    }
    
    draw() {
        throw new Error('Método draw() deve ser implementado pela subclasse.');
    }
    
    update() {
        this.frameCount++;

        if (this.audioProcessor) {
            this.audioProcessor.update();
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
     * @param {string[]} [colors] - Cores do gradiente, da base para o topo.
     * @returns {CanvasGradient} Gradiente pronto a usar em fillStyle ou strokeStyle.
     */
    createGradient(colors = ['#4361ee', '#4cc9f0', '#f72585']) {
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
}
