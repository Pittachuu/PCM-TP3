// Visualização em 3D Simulada (funcionalidade avançada)
class Spectrum3DVisualization extends AudioVisualization {
    constructor(canvas, audioProcessor) {
        super(canvas, audioProcessor);
        this.name = 'Espectro 3D';
        // Inicializar propriedades específicas
        this.properties.depth = 30;
        this.properties.barCount = 64;
        this.properties.perspective = 0.5;
        this.properties.smoothing = 0.5;
        this.addColorProperties();
        this.history = [];
        this.smoothedRow = [];
    }

    update() {
        super.update();
        if (this.frameCount % 2 === 0) {
            this.pushRow();
        }
    }

    pushRow() {
        const data = this.audioProcessor ? this.audioProcessor.getFrequencyData() : this.testData;
        const normalized = this.applySensitivity(this.normalizeData(data), this.properties.sensitivity);
        const usableBins = Math.floor(normalized.length * 0.5);
        const barCount = Math.floor(this.properties.barCount);

        const targets = [];
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * usableBins);
            targets.push(normalized[dataIndex] || 0);
        }
        this.smoothedRow = this.smoothData(this.smoothedRow, targets, this.properties.smoothing);

        this.history.push(this.smoothedRow.slice());
        while (this.history.length > Math.floor(this.properties.depth)) {
            this.history.shift();
        }
    }

    draw() {
        this.clearCanvas();
        this.ctx.save();
        this.drawRows();
        this.ctx.restore();
    }

    drawRows() {
        const rows = this.history;
        if (rows.length === 0) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const depth = Math.max(Math.floor(this.properties.depth), 2);
        const css = getComputedStyle(this.canvas).backgroundColor;
        const background = (!css || css === 'rgba(0, 0, 0, 0)' || css === 'transparent') ? '#0f3460' : css;

        this.ctx.strokeStyle = this.createGradient();
        this.ctx.lineWidth = 1.5;
        this.ctx.lineJoin = 'round';

        for (let r = 0; r < rows.length; r++) {
            const z = Math.min((rows.length - 1 - r) / (depth - 1), 1);
            const scale = 1 - z * this.properties.perspective;
            const rowWidth = width * 0.9 * scale;
            const left = (width - rowWidth) / 2;
            const baseline = height * (0.92 - z * 0.45);
            const peak = height * 0.4 * scale;

            // Preenche por baixo da linha para tapar as linhas de trás
            this.traceRow(rows[r], left, rowWidth, baseline, peak);
            this.ctx.lineTo(left + rowWidth, baseline);
            this.ctx.lineTo(left, baseline);
            this.ctx.closePath();
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = background;
            this.ctx.fill();

            // Traça a linha (mais transparente quanto mais ao fundo)
            this.traceRow(rows[r], left, rowWidth, baseline, peak);
            this.ctx.globalAlpha = this.getIntensityAlpha() * (1 - z * 0.75);
            this.ctx.shadowColor = this.properties.colorMid;
            this.ctx.shadowBlur = this.getGlowAmount(10);
            this.ctx.stroke();
        }
    }

    traceRow(row, left, rowWidth, baseline, peak) {
        this.ctx.beginPath();
        for (let i = 0; i < row.length; i++) {
            const x = left + (i / (row.length - 1)) * rowWidth;
            const y = baseline - row[i] * peak;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
    }

    getProperties() {
        return super.getProperties();
    }
}
