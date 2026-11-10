// Visualizações Concretas
class ParticleVisualization extends AudioVisualization {
    constructor(canvas, audioProcessor) {
        super(canvas, audioProcessor);
        this.name = 'Partículas';
        this.particles = [];
        this.lastTime = 0;
        
        // Inicializar propriedades específicas
        this.properties.particleCount = 50;
        this.properties.connectionDistance = 100;

        // Inicializar partículas
        this.initParticles();

        // Tamanho do canvas quando as partículas foram criadas
        this.lastWidth = this.canvas.width;
        this.lastHeight = this.canvas.height;
        
    }
    
    draw() {
        this.clearCanvas();
        this.drawParticles();
        this.drawConnections();
    }
    
        update() {
        super.update();
        this.adaptToCanvas();
        this.updateParticles();
    }
    
    adaptToCanvas() {
        if (this.canvas.width === this.lastWidth && this.canvas.height === this.lastHeight){ 
            return
        };

        for (const p of this.particles) {
            p.x = (p.x / this.lastWidth) * this.canvas.width;
            p.y = (p.y / this.lastHeight) * this.canvas.height;
        }

        this.lastWidth = this.canvas.width;
        this.lastHeight = this.canvas.height;
    }

    getProperties() {
        return super.getProperties();
    }
    
    initParticles() {
        for (let i = 0; i < this.properties.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        };
    }

    updateProperty(property, value) {
        super.updateProperty(property, value);
        if (property === 'particleCount') {
            this.adjustParticleCount();
        }
    }

    adjustParticleCount() {
        const target = Math.floor(this.properties.particleCount);
        while (this.particles.length > target) {
            this.particles.pop();
        }
        while (this.particles.length < target) {
            this.particles.push(this.createParticle());
        }
    }
    
    updateParticles() {
        const data = this.audioProcessor ? this.audioProcessor.getFrequencyData() : this.testData;
        const audioLevel = this.audioProcessor ? this.audioProcessor.calculateAudioLevel() : 0.5;
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Mover partícula
            p.x += p.vx;
            p.y += p.vy;
            
            // Rebater nas bordas
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            // Aplicar influência do áudio
            if (data.length > 0) {
                const freqIndex = Math.floor(i / this.particles.length * data.length * 0.5);
                const intensity = Math.min(data[freqIndex] / 255 * this.properties.sensitivity, 1);
                
                p.vx += (Math.random() - 0.5) * intensity * 0.5;
                p.vy += (Math.random() - 0.5) * intensity * 0.5;
                
                // Limitar velocidade
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const maxSpeed = 2 + audioLevel * 3;
                if (speed > maxSpeed) {
                    p.vx = (p.vx / speed) * maxSpeed;
                    p.vy = (p.vy / speed) * maxSpeed;
                }
            }
        }
    }
    
    drawParticles() {
        for (const p of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        }
    }
    
    drawConnections() {
        const maxDistance = this.properties.connectionDistance;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = 1 - distance / maxDistance;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(76, 201, 240, ${opacity * 0.5})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
}