document.addEventListener('DOMContentLoaded', () => {
  // =============================
  // ELEMENTOS
  // =============================
  const searchInput = document.querySelector('.search-box input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const materialCards = document.querySelectorAll('.material-card');

  // =============================
  // BUSCA
  // =============================
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterCards(searchTerm);
    });
  }

  // =============================
  // FILTROS
  // =============================
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    });
  });

  // =============================
  // FUNÇÃO DE FILTRO
  // =============================
  function filterCards(searchTerm) {
    materialCards.forEach((card) => {
      const titleEl = card.querySelector('.card-title');
      const descriptionEl = card.querySelector('.card-description');

      const title = titleEl ? titleEl.textContent.toLowerCase() : '';
      const description = descriptionEl ? descriptionEl.textContent.toLowerCase() : '';
      const tags = Array.from(card.querySelectorAll('.tag')).map((tag) => tag.textContent.toLowerCase());

      const matches =
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        tags.some((tag) => tag.includes(searchTerm));

      card.style.display = matches ? 'flex' : 'none';
    });

    updateMaterialCount();
  }

  // =============================
  // ATUALIZAR CONTAGEM
  // =============================
  function updateMaterialCount() {
    const visibleCards = Array.from(materialCards).filter(
      (card) => card.style.display !== 'none'
    ).length;

    const materialsTitle = document.querySelector('.materials-title');
    if (materialsTitle) {
      materialsTitle.textContent = `Materiais disponíveis (${visibleCards})`;
    }
  }

  // =============================
  // CLIQUE NO CARD (navega, exceto se for o botão de apagar)
  // =============================
  materialCards.forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.form-apagar-material')) return;
      window.location.href = card.dataset.href;
    });
  });

  // =============================
  // CONFIRMAÇÃO AO APAGAR
  // =============================
  document.querySelectorAll('.form-apagar-material').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const confirmar = confirm('Tem certeza que deseja apagar este material? Essa ação não pode ser desfeita.');
      if (!confirmar) e.preventDefault();
    });
  });
});