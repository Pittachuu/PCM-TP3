// Motor de Visualização
class VisualizationEngine {
    constructor(canvasId, audioProcessor) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.visualizations = new Map();
        this.currentVisualization = null;
        this.animationId = null;
        this.isRunning = false;
        
        // Inicializar visualizações
        this.initVisualizations(audioProcessor);
        
        // Ajustar o tamanho do canvas e mantê-lo ajustado
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    initVisualizations(audioProcessor) {
        this.visualizations.set('spectrum', new SpectrumVisualization(this.canvas, audioProcessor));
        this.visualizations.set('waveform', new WaveformVisualization(this.canvas, audioProcessor));
        this.visualizations.set('particles', new ParticleVisualization(this.canvas, audioProcessor));
        this.visualizations.set('circular', new CircularVisualization(this.canvas, audioProcessor));
        this.visualizations.set('spectrum3d', new Spectrum3DVisualization(this.canvas, audioProcessor));
        this.visualizations.set('oscilloscope', new OscilloscopeVisualization(this.canvas, audioProcessor));
        this.currentVisualization = this.visualizations.get('spectrum');
        this.currentType = 'spectrum';
    }
    
    setVisualization(type) {
        console.log(`Definindo visualização: ${type}`);
        const visualization = this.visualizations.get(type);

        if (!visualization) {
            return false; // Devolver boolean indicando sucesso
        }

        this.currentVisualization = visualization;
        this.currentType = type;
        return true;
    }
    
    start() {
        console.log('Iniciando motor de visualização...');

        if (this.isRunning) {
            return
        };

        this.isRunning = true;
        this.animate();
    }

    animate() {
        if (!this.isRunning) {
            return
        };

        this.currentVisualization.update();
        this.currentVisualization.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    stop() {
        console.log('Parando motor de visualização...');
        this.isRunning = false;

        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resize() {
        this.currentVisualization.resize(this.canvas.clientWidth, this.canvas.clientHeight);

        // Mudar o tamanho apaga o canvas; se a animação está parada, redesenha
        if (!this.isRunning) {
            this.currentVisualization.draw();
        }
    }

    getVisualizationTypes() {
        return Array.from(this.visualizations.entries()).map(([key, visualization]) => ({
            key: key,
            name: visualization.name,
            VisualizationClass: visualization.constructor
        }));
    }

    getVisualizationProperties() {
        return this.currentVisualization.getProperties();
    }

    updateVisualizationProperty(property, value) {
        console.log(`Atualizando propriedade: ${property} = ${value}`);
        this.currentVisualization.updateProperty(property, value);
    }
}