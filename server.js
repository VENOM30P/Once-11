
const express = require('express');
const path = require('path');
const app = express();

// Configuração para servir arquivos estáticos
app.use(express.static('test-page'));

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-page/index.html'));
});

// Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
}).on('error', (error) => {
    console.error('Erro ao iniciar servidor:', error);
});
