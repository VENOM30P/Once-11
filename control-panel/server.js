const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();

// Variável global para armazenar a porta atual
let currentPort = null;

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para obter a porta atual
app.get('/current-port', (req, res) => {
    res.json({ port: currentPort || 3000 });
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
    try {
        // Se existe um processo anterior, tenta matá-lo
        if (serverProcess) {
            console.log('Killing existing server process...');
            serverProcess.kill();
            serverProcess = null;
        }

        const serverPath = path.join(__dirname, '..', 'server.js');
        console.log('Starting server from path:', serverPath);

        // Inicia o novo processo do servidor
        serverProcess = exec(`node ${serverPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Server process error:', error);
                return;
            }
            if (stdout) console.log('Server output:', stdout);
            if (stderr) console.error('Server stderr:', stderr);
        });

        // Configura handlers para o processo
        serverProcess.on('error', (error) => {
            console.error('Server process error:', error);
            serverProcess = null;
        });

        // Aguarda um momento para verificar se o servidor iniciou
        setTimeout(() => {
            if (serverProcess && !serverProcess.killed) {
                console.log('Server started successfully');
                res.json({ success: true, message: 'Servidor iniciado na porta 3000!' });
            } else {
                console.error('Server failed to start');
                res.json({ success: false, message: 'Erro ao iniciar servidor' });
            }
        }, 2000);

    } catch (error) {
        console.error('Error in start-server route:', error);
        res.json({ success: false, message: 'Erro ao iniciar servidor: ' + error.message });
    }
});

// Array de portas para tentar
const PORTS = [3001, 3002, 3003, 3004, 3005];
let currentPortIndex = 0;

// Função para tentar iniciar o servidor em uma porta específica
const tryPort = (port) => {
    console.log(`Tentando iniciar servidor na porta ${port}...`);
    return app.listen(port, '0.0.0.0', () => {
        currentPort = port;
        console.log(`Painel de controle rodando em http://0.0.0.0:${port}`);
    });
};

// Função para tentar a próxima porta disponível
const startServer = () => {
    if (currentPortIndex >= PORTS.length) {
        console.error('Não foi possível encontrar uma porta disponível');
        process.exit(1);
        return;
    }

    const port = PORTS[currentPortIndex];
    const server = tryPort(port);

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.log(`Porta ${port} em uso, tentando próxima porta...`);
            currentPortIndex++;
            startServer();
        } else {
            console.error('Erro ao iniciar servidor:', error);
            process.exit(1);
        }
    });
};

// Inicia o servidor
startServer();