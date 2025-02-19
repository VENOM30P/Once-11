const express = require('express');
const { exec } = require('child_process');
const path = require('path');
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

// Gerenciamento do processo do servidor da aplicação
let serverProcess = null;

// Função para matar o processo do servidor se existir
const killServerProcess = () => {
    if (serverProcess) {
        try {
            console.log('Finalizando processo do servidor existente...');
            serverProcess.kill();
            serverProcess = null;
        } catch (error) {
            console.error('Erro ao finalizar processo:', error);
        }
    }
};

app.post('/start-server', async (req, res) => {
    console.log('Iniciando servidor da aplicação...');
    try {
        // Mata processo anterior se existir
        await killServerProcess();

        const serverPath = path.join(__dirname, '..', 'server.js');
        console.log('Iniciando servidor do caminho:', serverPath);

        // Inicia o novo processo do servidor
        serverProcess = exec(`node ${serverPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Erro no processo do servidor:', error);
                return;
            }
            console.log('Saída do servidor:', stdout);
            if (stderr) console.error('Erro do servidor:', stderr);
        });

        // Configura handlers para o processo
        serverProcess.on('error', (error) => {
            console.error('Erro no processo do servidor:', error);
            serverProcess = null;
        });

        // Verifica se o servidor iniciou corretamente e redireciona
        setTimeout(() => {
            if (serverProcess && !serverProcess.killed) {
                console.log('Servidor iniciado com sucesso na porta 3000');
                const appUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
                res.json({ success: true, message: 'Servidor iniciado com sucesso!', url: appUrl });
            } else {
                console.error('Falha ao iniciar o servidor');
                res.status(500).json({ success: false, message: 'Erro ao iniciar o servidor' });
            }
        }, 2000);

    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        res.status(500).json({ success: false, message: 'Erro ao iniciar servidor: ' + error.message });
    }
});

// Inicia o servidor do painel de controle na porta 8080
const PORT = 8080;

console.log('Tentando iniciar o servidor na porta', PORT);

// Verifica se a porta está em uso antes de tentar iniciar
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Painel de controle rodando em http://0.0.0.0:${PORT}`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} já está em uso. Por favor, verifique se não há outro servidor rodando.`);
        process.exit(1);
    } else {
        console.error('Erro ao iniciar o painel de controle:', error);
        process.exit(1);
    }
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