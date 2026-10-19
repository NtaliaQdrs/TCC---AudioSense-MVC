document.addEventListener('DOMContentLoaded', () => {

    async function carregarContador(url, elementoId) {
        const elemento = document.getElementById(elementoId);
        if (!elemento) return;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Resposta HTTP ${response.status}`);
            const data = await response.json();
            const total = Number(data.total);
            if (!Number.isFinite(total)) throw new Error('Total de estatísticas inválido.');
            elemento.textContent = new Intl.NumberFormat('pt-BR').format(total);
        } catch (error) {
            elemento.textContent = '—';
            console.error(`Erro ao carregar estatística ${url}:`, error);
        }
    }

    Promise.all([
        carregarContador('/estatisticas/contar-discentes', 'total-discentes'),
        carregarContador('/estatisticas/contar-docentes', 'total-docentes'),
        carregarContador('/estatisticas/contar-audiovisual', 'total-audiovisual'),
        carregarContador('/estatisticas/contar-materiais', 'total-materiais')
    ]);
});