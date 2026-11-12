// Visualização Circular (funcionalidade avançada)
class CircularVisualization extends AudioVisualization {
    constructor(canvas, audioProcessor) {
        super(canvas, audioProcessor);
        this.name = 'Visualização Circular';
        // Inicializar propriedades específicas
        this.properties.barCount = 90;
        this.properties.innerRadius = 0.3;
        this.properties.rotationSpeed = 0.5;
        this.properties.glow = 8;
        this.properties.smoothing = 0.6;
        this.addColorProperties();
        this.smoothedBars = [];
        this.rotation = 0;
    }

    update() {
        super.update();
        this.rotation += this.properties.rotationSpeed * 0.01;
    }

    draw() {
        this.clearCanvas();
        this.ctx.save();
        this.ctx.globalAlpha = this.getIntensityAlpha();
        this.drawRadialBars();
        this.ctx.restore();
    }

    drawRadialBars() {
        const data = this.audioProcessor ? this.audioProcessor.getFrequencyData() : this.testData;
        const normalized = this.applySensitivity(this.normalizeData(data), this.properties.sensitivity);
        const usableBins = Math.floor(normalized.length * 0.5);
        const barCount = Math.floor(this.properties.barCount);
        const half = Math.floor(barCount / 2);

        const targets = [];
        for (let i = 0; i < half; i++) {
            const dataIndex = Math.floor((i / half) * usableBins);
            targets.push(normalized[dataIndex] || 0);
        }
        this.smoothedBars = this.smoothData(this.smoothedBars, targets, this.properties.smoothing);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.95;
        const innerRadius = maxRadius * this.properties.innerRadius;
        const maxLength = maxRadius - innerRadius;
        const palette = this.getPalette();

        const gradient = this.ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, innerRadius + maxLength * this.gradientReach);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(0.5, palette[1]);
        gradient.addColorStop(1, palette[2]);

        this.ctx.save();
        this.ctx.shadowColor = palette[1];
        this.ctx.shadowBlur = this.getGlowAmount(this.properties.glow);

        // Anel interior
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, innerRadius * 0.92, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.hexToRgba(palette[0], 0.6);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Barras
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = Math.max((2 * Math.PI * innerRadius / barCount) * 0.6, 1);
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();

        for (let i = 0; i < barCount; i++) {
            const value = this.smoothedBars[Math.min(i, barCount - 1 - i, half - 1)];
            const angle = (i / barCount) * Math.PI * 2 + this.rotation - Math.PI / 2;
            const length = Math.max(value * maxLength, 2);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            this.ctx.moveTo(centerX + cos * innerRadius, centerY + sin * innerRadius);
            this.ctx.lineTo(centerX + cos * (innerRadius + length), centerY + sin * (innerRadius + length));
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    getProperties() {
        return super.getProperties();
    }
}
