document.addEventListener('DOMContentLoaded', () => {
  const buscaInput = document.getElementById('buscaInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.ad-card');

  let filtroAtivo = 'todos';

  function aplicarFiltros() {
    const termo = buscaInput.value.toLowerCase();

    cards.forEach((card) => {
      const titulo = (card.dataset.titulo || '').toLowerCase();
      const tipo = card.dataset.tipo;

      const bateFiltro = filtroAtivo === 'todos' || tipo === filtroAtivo;
      const bateBusca = titulo.includes(termo);

      card.style.display = (bateFiltro && bateBusca) ? '' : 'none';
    });
  }

  if (buscaInput) {
    buscaInput.addEventListener('input', aplicarFiltros);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filtroAtivo = btn.dataset.filtro;
      aplicarFiltros();
    });
  });
});