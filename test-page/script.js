
document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('status');
    const console = document.getElementById('console');
    const repoUrl = document.getElementById('repoUrl');
    const branchSelect = document.getElementById('branchSelect');
    const cloneBtn = document.getElementById('cloneBtn');
    const pullBtn = document.getElementById('pullBtn');
    const pushBtn = document.getElementById('pushBtn');

    function log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${timestamp}] ${message}`;
        console.appendChild(entry);
        console.scrollTop = console.scrollHeight;
    }

    function updateStatus(message) {
        status.textContent = message;
    }

    cloneBtn.addEventListener('click', async () => {
        const url = repoUrl.value.trim();
        if (!url) {
            log('Por favor, insira uma URL de repositório válida', 'error');
            return;
        }

        updateStatus('Clonando repositório...');
        log(`Iniciando clone de ${url}`);
        
        try {
            // Simulando operação de clone
            await new Promise(resolve => setTimeout(resolve, 2000));
            log('Repositório clonado com sucesso!', 'success');
            updateStatus('Pronto');
        } catch (error) {
            log(`Erro ao clonar: ${error.message}`, 'error');
            updateStatus('Erro');
        }
    });

    pullBtn.addEventListener('click', async () => {
        updateStatus('Atualizando repositório...');
        log('Iniciando pull...');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            log('Pull realizado com sucesso!', 'success');
            updateStatus('Pronto');
        } catch (error) {
            log(`Erro no pull: ${error.message}`, 'error');
            updateStatus('Erro');
        }
    });

    pushBtn.addEventListener('click', async () => {
        updateStatus('Enviando alterações...');
        log('Iniciando push...');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            log('Push realizado com sucesso!', 'success');
            updateStatus('Pronto');
        } catch (error) {
            log(`Erro no push: ${error.message}`, 'error');
            updateStatus('Erro');
        }
    });
});
