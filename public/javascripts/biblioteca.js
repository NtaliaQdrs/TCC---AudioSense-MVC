document.addEventListener('DOMContentLoaded', () => {
  // =============================
  // ELEMENTOS
  // =============================
  const searchInput = document.querySelector('.search-box input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const materialCards = document.querySelectorAll('.material-card');
  const btnInsert = document.querySelector('.btn-insert');
  const btnAudios = document.querySelectorAll('.btn-audio');

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
      // Remove a classe 'active' de todos os botões
      filterBtns.forEach((b) => b.classList.remove('active'));
      // Adiciona a classe 'active' ao botão clicado
      btn.classList.add('active');
    });
  });

  // =============================
  // FUNÇÃO DE FILTRO
  // =============================
  function filterCards(searchTerm) {
    materialCards.forEach((card) => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      const description = card.querySelector('.card-description').textContent.toLowerCase();
      const tags = Array.from(card.querySelectorAll('.tag')).map((tag) => tag.textContent.toLowerCase());

      const matches =
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        tags.some((tag) => tag.includes(searchTerm));

      card.style.display = matches ? 'flex' : 'none';
    });

    // Atualiza a contagem de materiais disponíveis
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
  // BOTÃO INSERIR CONTEÚDO
  // =============================
  if (btnInsert) {
    btnInsert.addEventListener('click', () => {
      // Redireciona para página de inserção (a ser implementada)
      // window.location.href = '/inserir-material';
      alert('Funcionalidade de inserção em desenvolvimento!');
    });
  }

  // =============================
  // BOTÕES DE AUDIODESCRIÇÃO
  // =============================
  btnAudios.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cardTitle = btn.closest('.material-card').querySelector('.card-title').textContent;
      alert(`Reproduzindo audiodescrição de: ${cardTitle}`);
      // Aqui você pode adicionar a lógica de reprodução de áudio
    });
  });
});
