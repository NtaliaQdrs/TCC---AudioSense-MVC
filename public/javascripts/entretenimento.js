document.addEventListener('DOMContentLoaded', () => {
  const btnInsert = document.querySelector('.recommend-btn');

  if (btnInsert) {
    btnInsert.addEventListener('click', () => {
      window.location.href = '/inserir-entretenimento';
    });
  }

  window.filtrarCategoria = function (categoria, botaoClicado) {
    const botoes = document.querySelectorAll('.filter-group .btn-filter');
    botoes.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
    botaoClicado.setAttribute('aria-pressed', 'true');

    const cards = document.querySelectorAll('.extra-card1');
    let visiveis = 0;

    cards.forEach(card => {
      const categoriaCard = card.getAttribute('data-categoria');
      const mostrar = categoria === 'todos' || categoriaCard === categoria;
      card.style.display = mostrar ? '' : 'none';
      if (mostrar) visiveis++;
    });

    const status = document.getElementById('filtro-status');
    const nomeFiltro = botaoClicado.textContent.trim();
    status.textContent = `Mostrando ${visiveis} resultado${visiveis === 1 ? '' : 's'} para ${nomeFiltro}`;
  };
});