// Classe principal da aplicação
class App {
    constructor() {
        this.audioProcessor = new AudioProcessor();
        this.visualizationEngine = new VisualizationEngine('audioCanvas', this.audioProcessor);
        this.uiManager = new UIManager(this);
        this.exportManager = new ExportManager(this.visualizationEngine);
        
        // Inicialização
        this.init();
    }
    
    init() {
        console.log('App inicializada');
        this.isStarting = false;
        this.uiManager.setButtonStates(false);
        this.uiManager.updateAudioInfo({ status: 'Parado' });
    }
    
    async startMicrophone() {
        console.log('Iniciando microfone...');

        if (this.isStarting) {
            return
        };

        this.isStarting = true;
        this.uiManager.updateAudioInfo({ status: 'A ligar o microfone...' });
        this.uiManager.setButtonStates(true);

        try {
            await this.audioProcessor.startMicrophone();
            this.visualizationEngine.start();
            this.uiManager.updateAudioInfo({ status: 'Microfone ativo' });
        } catch (error) {
            console.error('Erro no microfone:', error);
            let message = `Erro no microfone: ${error.message}`;

            if (error.name === 'NotAllowedError') {
                message = 'Permissão do microfone negada.';
            } else if (error.name === 'NotFoundError') {
                message = 'Nenhum microfone encontrado.';
            }

            this.uiManager.setButtonStates(false);
            this.uiManager.updateAudioInfo('Microfone não ligou', true);
            this.uiManager.showError(message);
        } finally {
            this.isStarting = false;
        }
    }
    
    async loadAudioFile(file) {
        console.log('Carregando ficheiro de áudio...');

        if (this.isStarting) {
            return
        };

        this.isStarting = true;
        this.uiManager.updateAudioInfo({ status: `A carregar ${file.name}...` });
        this.uiManager.setButtonStates(true);

        try {
            await this.audioProcessor.loadAudioFile(file);
            this.visualizationEngine.start();
            this.uiManager.updateAudioInfo({ status: `A tocar: ${file.name}` });
        } catch (error) {
            console.error('Erro ao carregar o ficheiro:', error);
            this.uiManager.setButtonStates(false);
            this.uiManager.updateAudioInfo('Ficheiro não carregou', true);
            this.uiManager.showError(`Erro ao carregar o ficheiro: ${error.message}`);
        } finally {
            this.isStarting = false;
        }
    }
    
    stopAudio() {
        console.log('Parando áudio...');
        this.audioProcessor.stop();
        this.visualizationEngine.stop();
        this.uiManager.setButtonStates(false);
        this.uiManager.updateAudioInfo({ status: 'Parado' });
    }
    
    setVisualization(type) {
        console.log(`Definindo visualização: ${type}`);
        const success = this.visualizationEngine.setVisualization(type);
        
        if (success) {
            this.uiManager.updatePropertiesPanel();
        } else {
            this.uiManager.showError(`A visualização "${type}" não existe.`);
        }
    }
    
    exportFrame() {
        console.log('Exportando frame...');
        this.exportManager.exportAsPNG();
    }

    destroy() {
        console.log('Destruindo aplicação...');
        this.audioProcessor.stop();
        this.visualizationEngine.stop();
    }
}