document.addEventListener('DOMContentLoaded', () => {
  const filtros    = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.ad-card');
  const buscaInput = document.getElementById('buscaInput');

  let filtroAtivo = 'todos';
  let termoBusca  = '';

  function aplicarFiltros() {
    cards.forEach(card => {
      const status = card.getAttribute('data-status');
      const titulo = card.getAttribute('data-titulo').toLowerCase();

      const passaFiltro = filtroAtivo === 'todos' || status === filtroAtivo;
      const passaBusca  = titulo.includes(termoBusca);

      card.style.display = (passaFiltro && passaBusca) ? 'flex' : 'none';
    });
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroAtivo = btn.getAttribute('data-filtro');
      aplicarFiltros();
    });
  });

  buscaInput?.addEventListener('input', () => {
    termoBusca = buscaInput.value.toLowerCase();
    aplicarFiltros();
  });
});