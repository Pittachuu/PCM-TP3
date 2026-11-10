// Gestão de UI
class UIManager {
    constructor(app) {
        this.app = app;
        this.visualizationEngine = app.visualizationEngine;
        this.audioProcessor = app.audioProcessor;
        
        // Nome mostrado na etiqueta de cada propriedade
        this.propertyLabels = {
            sensitivity: 'Sensibilidade',
            barCount: 'Número de barras',
            barSpacing: 'Espaçamento entre barras',
            showGrid: 'Grelha (0 = não, 1 = sim)'
        };

        // Intervalo (mínimo, máximo e passo) do slider de cada propriedade
        this.propertyRanges = {
            sensitivity: { min: 0.1, max: 3, step: 0.1 },
            barCount: { min: 16, max: 256, step: 1 },
            barSpacing: { min: 0, max: 10, step: 1 },
            showGrid: { min: 0, max: 1, step: 1 }
        };

        // Inicializar interface
        this.setupEventListeners();
        this.setupAudioLevels();
        this.updatePropertiesPanel();
    }
    
    updatePropertiesPanel() {
        console.log('Atualizando painel de propriedades...');
        const container = document.getElementById('properties-container');
        container.innerHTML = '';
        const properties = this.visualizationEngine.getVisualizationProperties();

        for (const property in properties) {
            const range = this.propertyRanges[property] || { min: 0, max: 1, step: 0.01 };
            const control = this.createPropertyControl(property, properties[property], range.min, range.max, range.step);
            container.appendChild(control);
        }
    }
    
    updateAudioInfo(info, isError = false) {
        const audioStatus = document.getElementById('audioStatus');
        const audioLevel = document.getElementById('audioLevel');
        
        if (isError) {
            audioStatus.textContent = `Erro: ${info}`;
            audioStatus.style.color = '#f72585';
        } else {
            audioStatus.textContent = `Áudio: ${info.status || 'Ativo'}`;
            audioStatus.style.color = '#e6e6e6';
            audioLevel.textContent = `Nível: ${info.level || 0}%`;
        }
    }
    
    setButtonStates(playing) {
        const startMicBtn = document.getElementById('startMic');
        const stopAudioBtn = document.getElementById('stopAudio');
        
        startMicBtn.disabled = playing;
        stopAudioBtn.disabled = !playing;
    }
    
    showError(message) {
        const errorModal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
        
        // Fechar modal ao clicar no X
        document.querySelector('.close').onclick = () => {
            errorModal.classList.add('hidden');
        };
        
        // Fechar modal ao clicar fora
        window.onclick = (event) => {
            if (event.target === errorModal) {
                errorModal.classList.add('hidden');
            }
        };
    }
    
    setupEventListeners() {
        document.getElementById('startMic').addEventListener('click', () => {
            this.app.startMicrophone();
        });
        
        document.getElementById('stopAudio').addEventListener('click', () => {
            this.app.stopAudio();
        });
        
        document.getElementById('audioFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.app.loadAudioFile(e.target.files[0]);
            }
        });
        
        document.getElementById('visualizationType').addEventListener('change', (e) => {
            this.app.setVisualization(e.target.value);
        });
        
        document.getElementById('exportPNG').addEventListener('click', () => {
            this.app.exportManager.exportAsPNG();
        });
        
        document.getElementById('exportJPEG').addEventListener('click', () => {
            this.app.exportManager.exportAsJPEG(0.9);
        });
    }
    
    setupAudioLevels() {
        this.levelIntervalId = setInterval(() => {
            if (this.audioProcessor.isPlaying) {
                const level = Math.round(this.audioProcessor.calculateAudioLevel() * 100);
                document.getElementById('audioLevel').textContent = `Nível: ${level}%`;
            } else if (this.visualizationEngine.isRunning && !this.app.isStarting) {
                // O áudio acabou sozinho (a animação ainda estava ligada)
                this.app.stopAudio();
                this.updateAudioInfo({ status: 'Áudio terminado' });
            }
        }, 100);
    }
    
    createPropertyControl(property, value, min, max, step) {
        const container = document.createElement('div');
        container.className = 'property-control';
        
        const label = document.createElement('label');
        label.textContent = this.propertyLabels[property] || property;
        label.htmlFor = `prop-${property}`;
        
        const input = document.createElement('input');
        input.type = 'range';
        input.id = `prop-${property}`;
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        
        input.addEventListener('input', (e) => {
            this.visualizationEngine.updateVisualizationProperty(property, parseFloat(e.target.value));
        });
        
        container.appendChild(label);
        container.appendChild(input);
        
        return container;
    }
}