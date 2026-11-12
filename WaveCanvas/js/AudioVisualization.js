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
        this.gradientReach = 0.6;
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
    
    createGradient(colors = this.getPalette()) {
        const topY = this.canvas.height * (1 - this.gradientReach);
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, topY);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / Math.max(colors.length - 1, 1), colors[i]);
        }
        return gradient;
    }
    
    normalizeData(data, min = 0, max = 255) {
        return Array.from(data).map(value => (value - min) / (max - min));
    }

    applySensitivity(data, sensitivity) {
        return data.map(value => Math.min(value * sensitivity, 1));
    }

    addColorProperties() {
        this.properties.colorLow = '#4361ee';
        this.properties.colorMid = '#4cc9f0';
        this.properties.colorHigh = '#f72585';
    }

    getPalette() {
        return [
            this.properties.colorLow || '#4361ee',
            this.properties.colorMid || '#4cc9f0',
            this.properties.colorHigh || '#f72585'
        ];
    }

    getIntensityAlpha() {
        const boost = Math.min(this.audioLevel * 6, 1);
        return 1 - this.properties.intensity * 0.65 * (1 - boost);
    }

    getGlowAmount(baseGlow) {
        const boost = Math.min(this.audioLevel * 6, 1);
        return baseGlow * (1 + this.properties.intensity * (boost * 6 - 0.5));
    }

    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    smoothData(previous, target, smoothing) {
        if (!previous || previous.length !== target.length) {
            return target.slice();
        }
        return target.map((value, i) => this.lerp(previous[i], value, 1 - smoothing));
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
