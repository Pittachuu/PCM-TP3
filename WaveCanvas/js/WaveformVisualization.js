// Visualizações Concretas
class WaveformVisualization extends AudioVisualization {
    constructor(canvas, audioProcessor) {
        super(canvas, audioProcessor);
        this.name = 'Forma de Onda';
        // Inicializar propriedades específicas
        this.properties.lineWidth = 2;
        this.properties.glow = 10;
        this.properties.showGrid = 1;
        this.addColorProperties();
    }
    
    draw() {
        this.clearCanvas();
        this.ctx.save();
        this.ctx.globalAlpha = this.getIntensityAlpha();

        if (this.properties.showGrid) {
            this.drawGrid();
        }

        this.drawWaveform();
        this.ctx.restore();
    }
    
    drawWaveform() {
        const data = this.audioProcessor ? this.audioProcessor.getWaveformData() : this.testData;
        const samples = this.normalizeData(data, 128, 256);
        const sliceWidth = this.canvas.width / (samples.length - 1);
        const centerY = this.canvas.height / 2;
        
        this.ctx.save();
        this.ctx.strokeStyle = this.createGradient();
        this.ctx.lineWidth = this.properties.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowColor = this.properties.colorMid;
        this.ctx.shadowBlur = this.getGlowAmount(this.properties.glow);
        
        this.ctx.beginPath();

        for (let i = 0; i < samples.length; i++) {
            const amplitude = Math.max(-1, Math.min(1, samples[i] * this.properties.sensitivity));
            const x = i * sliceWidth;
            const y = centerY - amplitude * centerY;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    getProperties() {
        return super.getProperties();
    }
}