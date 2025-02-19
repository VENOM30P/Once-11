const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/init-git', (req, res) => {
    exec('bash init_git.sh', (error, stdout, stderr) => {
        if (error) {
            console.error('Git init error:', error);
            res.json({ success: false, message: 'Erro ao inicializar Git: ' + error.message });
            return;
        }
        console.log('Git init success:', stdout);
        res.json({ success: true, message: 'Repositório Git inicializado com sucesso!' });
    });
});

let serverProcess = null;

app.post('/start-server', (req, res) => {
    if (serverProcess) {
        res.json({ success: true, message: 'Servidor já está rodando na porta 3000!' });
        return;
    }

    serverProcess = exec('node server.js', (error, stdout, stderr) => {
        if (error) {
            console.error('Server error:', error);
            serverProcess = null;
        }
    });

    // Aguarda um momento para o servidor iniciar
    setTimeout(() => {
        if (serverProcess) {
            res.json({ success: true, message: 'Servidor iniciado na porta 3000!' });
        } else {
            res.json({ success: false, message: 'Erro ao iniciar servidor' });
        }
    }, 1000);
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Painel de controle rodando em http://0.0.0.0:${PORT}`);
});