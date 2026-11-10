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
        this.currentVisualization = this.visualizations.get('spectrum');
    }
    
    /**
     * Muda a visualização atual.
     *
     * @param {string} type - Chave da visualização ('spectrum', 'waveform' ou 'particles').
     * @returns {boolean} true se a visualização existe, false caso contrário.
     */
    setVisualization(type) {
        console.log(`Definindo visualização: ${type}`);
        const visualization = this.visualizations.get(type);

        if (!visualization) {
            return false; // Devolver boolean indicando sucesso
        }

        this.currentVisualization = visualization;
        return true;
    }
    
    /**
     * Inicia o loop de animação (se ainda não estiver a correr).
     *
     * @returns {void}
     */
    start() {
        console.log('Iniciando motor de visualização...');

        if (this.isRunning) {
            return
        };

        this.isRunning = true;
        this.animate();
    }

    /**
     * Desenha um frame e pede ao browser o frame seguinte (é o loop).
     *
     * @returns {void}
     */
    animate() {
        if (!this.isRunning) {
            return
        };

        this.currentVisualization.update();
        this.currentVisualization.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Para o loop de animação. O último frame fica no ecrã.
     *
     * @returns {void}
     */
    stop() {
        console.log('Parando motor de visualização...');
        this.isRunning = false;

        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Ajusta o tamanho de desenho do canvas ao tamanho com que aparece no ecrã.
     *
     * @returns {void}
     */
    resize() {
        this.currentVisualization.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    }
    
    /**
     * Devolve as propriedades da visualização atual.
     *
     * @returns {Object} Objeto com nome e valor de cada propriedade.
     */
    getVisualizationProperties() {
        return this.currentVisualization.getProperties();
    }

    /**
     * Altera uma propriedade da visualização atual.
     *
     * @param {string} property - Nome da propriedade.
     * @param {number} value - Novo valor.
     * @returns {void}
     */
    updateVisualizationProperty(property, value) {
        console.log(`Atualizando propriedade: ${property} = ${value}`);
        this.currentVisualization.updateProperty(property, value);
    }
}