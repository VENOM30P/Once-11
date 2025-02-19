const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const app = express();

console.log('Iniciando configuração do servidor do painel de controle...');

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    console.log('Recebida requisição para a página inicial');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para inicializar o Git
app.post('/init-git', (req, res) => {
    console.log('Iniciando processo de inicialização do Git...');
    const { exec } = require('child_process'); //Import exec only here
    exec('bash ../init_git.sh', (error, stdout, stderr) => {
        if (error) {
            console.error('Erro ao inicializar Git:', error);
            res.status(500).json({ success: false, message: 'Erro ao inicializar Git: ' + error.message });
            return;
        }
        console.log('Git inicializado com sucesso:', stdout);
        res.json({ success: true, message: 'Repositório Git inicializado com sucesso!' });
    });
});


let serverProcess = null;

function killServerProcess() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
}

app.post('/start-server', (req, res) => {
    try {
        killServerProcess();

        serverProcess = spawn('node', ['server.js'], { 
            cwd: path.join(__dirname, '..'),
            stdio: 'pipe'
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        serverProcess.on('close', (code) => {
            console.log(`Processo do servidor encerrado com código ${code}`);
            serverProcess = null;
        });

        setTimeout(() => {
            if (serverProcess && !serverProcess.killed) {
                const appUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co:3000`;
                res.json({ success: true, message: 'Servidor iniciado com sucesso!', url: appUrl });
            } else {
                res.status(500).json({ success: false, message: 'Erro ao iniciar o servidor' });
            }
        }, 2000);
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        res.status(500).json({ success: false, message: 'Erro ao iniciar o servidor' });
    }
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Painel de controle rodando em http://0.0.0.0:${PORT}`);
});

// Limpeza ao encerrar
process.on('SIGTERM', () => {
    console.log('Recebido sinal SIGTERM, encerrando...');
    killServerProcess();
    server.close(() => {
        console.log('Servidor encerrado');
        process.exit(0);
    });
});