import App from './App.js';

// Inicialização da aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    
    // Expor app globalmente para debugging (remover em produção)
    window.app = app;
});
