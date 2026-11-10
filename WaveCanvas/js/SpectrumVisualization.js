// Visualizações Concretas
class SpectrumVisualization extends AudioVisualization {
    constructor(canvas, audioProcessor) {
        super(canvas, audioProcessor);
        this.name = 'Espectro de Frequências';
        // Inicializar propriedades específicas
        this.properties.barCount = 64;
        this.properties.barSpacing = 2;
        this.properties.showGrid = 1;
    }
    
    draw() {
        this.clearCanvas();

        if (this.properties.showGrid) {
            this.drawGrid();
        }
        this.drawBars();
    }

    drawBars() {
        const data = this.audioProcessor ? this.audioProcessor.getFrequencyData() : this.testData;
        const normalized = this.applySensitivity(this.normalizeData(data), this.properties.sensitivity);
        const usableBins = Math.floor(normalized.length * 0.5);
        const barCount = Math.floor(this.properties.barCount);
        const slotWidth = this.canvas.width / barCount;
        const barWidth = Math.max(slotWidth - this.properties.barSpacing, 1);
        
        this.ctx.fillStyle = this.createGradient();
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * usableBins);
            const barHeight = (normalized[dataIndex] || 0) * this.canvas.height;
            const x = i * slotWidth;
            const y = this.canvas.height - barHeight;
            
            this.ctx.fillRect(x, y, barWidth, barHeight);
        }
    }
    
    getProperties() {
        return super.getProperties();
    }
}