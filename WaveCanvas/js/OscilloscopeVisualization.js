// Osciloscópio (visualização extra)
class OscilloscopeVisualization extends AudioVisualization {
    constructor(canvas, audioProcessor) {
        super(canvas, audioProcessor);
        this.name = 'Osciloscópio';
        // Inicializar propriedades específicas
        this.properties.samples = 512;
        this.properties.lineWidth = 2;
        this.properties.glow = 12;
        this.properties.showGrid = 1;
        this.properties.traceColor = '#39ff14';
    }

    draw() {
        this.clearCanvas();
        this.ctx.save();
        this.ctx.globalAlpha = this.getIntensityAlpha();

        if (this.properties.showGrid) {
            this.drawGraticule();
        }

        this.drawTrace();
        this.ctx.restore();
    }

    drawGraticule() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const color = this.properties.traceColor;
        const divisionsX = 10;
        const divisionsY = 8;

        this.ctx.save();
        this.ctx.lineWidth = 1;

        // Linhas da quadrícula
        this.ctx.beginPath();
        for (let i = 0; i <= divisionsX; i++) {
            this.ctx.moveTo((i / divisionsX) * width, 0);
            this.ctx.lineTo((i / divisionsX) * width, height);
        }
        for (let j = 0; j <= divisionsY; j++) {
            this.ctx.moveTo(0, (j / divisionsY) * height);
            this.ctx.lineTo(width, (j / divisionsY) * height);
        }
        this.ctx.strokeStyle = this.hexToRgba(color, 0.15);
        this.ctx.stroke();

        // Eixos centrais com marcas pequenas
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        this.ctx.lineTo(width, height / 2);
        this.ctx.moveTo(width / 2, 0);
        this.ctx.lineTo(width / 2, height);
        for (let i = 0; i <= divisionsX * 5; i++) {
            const x = (i / (divisionsX * 5)) * width;
            this.ctx.moveTo(x, height / 2 - 4);
            this.ctx.lineTo(x, height / 2 + 4);
        }
        for (let j = 0; j <= divisionsY * 5; j++) {
            const y = (j / (divisionsY * 5)) * height;
            this.ctx.moveTo(width / 2 - 4, y);
            this.ctx.lineTo(width / 2 + 4, y);
        }
        this.ctx.strokeStyle = this.hexToRgba(color, 0.35);
        this.ctx.stroke();

        this.ctx.restore();
    }

    findTrigger(data, samples) {
        for (let i = 1; i < data.length - samples; i++) {
            if (data[i - 1] < 128 && data[i] >= 128) {
                return i;
            }
        }
        return 0;
    }

    drawTrace() {
        const data = this.audioProcessor ? this.audioProcessor.getWaveformData() : this.testData;
        const samples = Math.min(Math.floor(this.properties.samples), data.length);
        if (samples < 2) return;

        const start = this.findTrigger(data, samples);
        const width = this.canvas.width;
        const centerY = this.canvas.height / 2;

        this.ctx.save();
        this.ctx.strokeStyle = this.properties.traceColor;
        this.ctx.lineWidth = this.properties.lineWidth;
        this.ctx.lineJoin = 'round';
        this.ctx.shadowColor = this.properties.traceColor;
        this.ctx.shadowBlur = this.getGlowAmount(this.properties.glow);

        this.ctx.beginPath();
        for (let i = 0; i < samples; i++) {
            const value = (data[start + i] - 128) / 128;
            const amplitude = Math.max(-1, Math.min(1, value * this.properties.sensitivity));
            const x = (i / (samples - 1)) * width;
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
