const express = require('express');
const path = require('path');
const app = express();

// Configuração para servir arquivos estáticos da pasta test-page
app.use(express.static('test-page'));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-page/index.html'));
});

// Inicia o servidor com tratamento de erro
const startServer = () => {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor iniciado em http://0.0.0.0:${PORT}`);
    }).on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Porta ${PORT} em uso. Por favor, verifique se não há outro servidor rodando.`);
            process.exit(1);
        } else {
            console.error('Erro ao iniciar servidor:', error);
            process.exit(1);
        }
    });
};

startServer();