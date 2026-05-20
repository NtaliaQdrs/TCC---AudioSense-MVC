document.addEventListener('DOMContentLoaded', () => {

async function carregarEstatisticas() {
        try {
            const responseDiscentes = await fetch('http://localhost:3000/estatisticas/contar-discentes' );
            if (responseDiscentes.ok) {
                const data = await responseDiscentes.json();
                const el = document.getElementById('total-discentes');
                if (el) el.textContent = data.total || 0;
            }

            const responseDocentes = await fetch('http://localhost:3000/estatisticas/contar-docentes' );

            if (responseDocentes.ok) {
                const data = await responseDocentes.json();
                const el = document.getElementById('total-docentes');
                if (el) el.textContent = data.total || 0;
            }

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    carregarEstatisticas();
    });