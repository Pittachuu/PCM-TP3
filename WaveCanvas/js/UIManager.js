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
            showGrid: 'Grelha (0 = não, 1 = sim)',
            lineWidth: 'Espessura da linha',
            glow: 'Brilho (glow)',
            particleCount: 'Número de partículas',
            connectionDistance: 'Distância das ligações',
            intensity: 'Intensidade (reação ao volume)',
            colorLow: 'Cor da base',
            colorMid: 'Cor do meio',
            colorHigh: 'Cor do topo',
            smoothing: 'Suavização',
            innerRadius: 'Raio interior',
            rotationSpeed: 'Velocidade de rotação',
            depth: 'Profundidade (linhas)',
            perspective: 'Perspetiva',
            samples: 'Amostras visíveis',
            traceColor: 'Cor do traço'
        };

        // Intervalo (mínimo, máximo e passo) do slider de cada propriedade
        this.propertyRanges = {
            sensitivity: { min: 0.1, max: 3, step: 0.1 },
            barCount: { min: 16, max: 256, step: 1 },
            barSpacing: { min: 0, max: 10, step: 1 },
            showGrid: { min: 0, max: 1, step: 1 },
            lineWidth: { min: 1, max: 10, step: 1 },
            glow: { min: 0, max: 30, step: 1 },
            particleCount: { min: 10, max: 150, step: 1 },
            connectionDistance: { min: 20, max: 200, step: 5 },
            intensity: { min: 0.1, max: 1, step: 0.05 },
            colorLow: { type: 'color' },
            colorMid: { type: 'color' },
            colorHigh: { type: 'color' },
            smoothing: { min: 0, max: 0.95, step: 0.05 },
            innerRadius: { min: 0.1, max: 0.7, step: 0.05 },
            rotationSpeed: { min: -5, max: 5, step: 0.1 },
            depth: { min: 10, max: 60, step: 1 },
            perspective: { min: 0, max: 0.8, step: 0.05 },
            samples: { min: 64, max: 1024, step: 16 },
            traceColor: { type: 'color' }
        };

        // Inicializar interface
        this.setupEventListeners();
        this.setupAudioLevels();
        this.createPreviews();
        this.updatePropertiesPanel();
    }
    
    updatePropertiesPanel() {
        console.log('Atualizando painel de propriedades...');
        const container = document.getElementById('properties-container');
        container.innerHTML = '';
        const properties = this.visualizationEngine.getVisualizationProperties();

        for (const property in properties) {
            const range = this.propertyRanges[property] || { min: 0, max: 1, step: 0.01 };
            let control;

            if (range.type === 'color') {
                control = this.createColorControl(property, properties[property]);
            } else {
                control = this.createPropertyControl(property, properties[property], range.min, range.max, range.step);
            }

            container.appendChild(control);
        }

        this.updatePreviewSelection();
    }

    createPreviews() {
        const container = document.getElementById('visualization-previews');
        container.innerHTML = '';

        this.visualizationEngine.getVisualizationTypes().forEach((item) => {
            const card = document.createElement('button');
            card.className = 'preview-card';
            card.dataset.type = item.key;

            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 70;

            const label = document.createElement('span');
            label.textContent = item.name;

            card.appendChild(canvas);
            card.appendChild(label);
            container.appendChild(card);

            card.addEventListener('click', () => {
                this.app.setVisualization(item.key);
            });

            // Visualização só para a miniatura (sem áudio: usa os dados de teste)
            const preview = new item.VisualizationClass(canvas, null);
            preview.updateProperty('connectionDistance', 25);
            for (let i = 0; i < 40; i++) {
                preview.update();
            }
            preview.draw();
        });
    }

    updatePreviewSelection() {
        const type = this.visualizationEngine.currentType;

        document.querySelectorAll('.preview-card').forEach((card) => {
            card.classList.toggle('active', card.dataset.type === type);
        });
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
        
        document.getElementById('expandBtn').addEventListener('click', () => {
            this.toggleExpanded();
        });
        
        // Esc fecha o gráfico ampliado
        document.addEventListener('keydown', (e) => {
            const area = document.getElementById('visualization-area');
            if (e.key === 'Escape' && area.classList.contains('expanded')) {
                this.toggleExpanded();
            }
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

    toggleExpanded() {
        const area = document.getElementById('visualization-area');
        const button = document.getElementById('expandBtn');
        const expanded = area.classList.toggle('expanded');

        button.title = expanded ? 'Reduzir' : 'Ampliar';
        button.setAttribute('aria-label', expanded ? 'Reduzir gráfico' : 'Ampliar gráfico');

        // O canvas mudou de tamanho: ajusta o desenho ao novo tamanho
        this.visualizationEngine.resize();
    }

    createColorControl(property, value) {
        const container = document.createElement('div');
        container.className = 'property-control';
        
        const label = document.createElement('label');
        label.textContent = this.propertyLabels[property] || property;
        label.htmlFor = `prop-${property}`;
        
        const input = document.createElement('input');
        input.type = 'color';
        input.id = `prop-${property}`;
        input.value = value;
        
        input.addEventListener('input', (e) => {
            this.visualizationEngine.updateVisualizationProperty(property, e.target.value);
        });
        
        container.appendChild(label);
        container.appendChild(input);
        
        return container;
    }
}
