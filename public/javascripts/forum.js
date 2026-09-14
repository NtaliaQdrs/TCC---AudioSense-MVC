document.addEventListener('DOMContentLoaded', () => {
  const btnGrid = document.getElementById('btn-grid');
  const btnList = document.getElementById('btn-list');
  const posts = document.querySelector('.forum-posts');

  btnGrid.setAttribute('aria-pressed', 'true');
  btnList.setAttribute('aria-pressed', 'false');

  btnGrid.addEventListener('click', () => {
    posts.classList.remove('list-view');
    btnGrid.setAttribute('aria-pressed', 'true');
    btnList.setAttribute('aria-pressed', 'false');
  });

  btnList.addEventListener('click', () => {
    posts.classList.add('list-view');
    btnList.setAttribute('aria-pressed', 'true');
    btnGrid.setAttribute('aria-pressed', 'false');
  });

  document.querySelectorAll('.btn-curtir').forEach(botao => {
    botao.addEventListener('click', async () => {
      const id = botao.dataset.id;
      try {
        const resp = await fetch(`/forum/${id}/curtir`, { method: 'POST' });
        const data = await resp.json();
        if (resp.ok) {
          const icone = data.curtido ? 'bi-heart-fill' : 'bi-heart';
          botao.innerHTML = `<i class="bi ${icone}" aria-hidden="true"></i>  ${data.curtidas}`;
          botao.dataset.curtido = data.curtido;
        }
      } catch (err) {
        console.error('Erro ao curtir:', err);
      }
    });
  });

  // ORDENAÇÃO: Recentes / Populares
  const btnRecentes = document.getElementById('btn-recentes');
  const btnPopulares = document.getElementById('btn-populares');
  const status = document.getElementById('ordenacao-status');

  function ordenarPosts(criterio, botaoClicado) {
    const cards = Array.from(document.querySelectorAll('.post-card'));

    cards.sort((a, b) => {
      if (criterio === 'recentes') {
        const dataA = new Date(a.dataset.dataPostagem);
        const dataB = new Date(b.dataset.dataPostagem);
        return dataB - dataA;
      } else {
        const curtidasA = Number(a.dataset.curtidas) || 0;
        const curtidasB = Number(b.dataset.curtidas) || 0;
        return curtidasB - curtidasA;
      }
    });

    cards.forEach(card => posts.appendChild(card));

    [btnRecentes, btnPopulares].forEach(btn => btn.setAttribute('aria-pressed', 'false'));
    botaoClicado.setAttribute('aria-pressed', 'true');

    if (status) {
      const nomeCriterio = criterio === 'recentes' ? 'mais recentes' : 'mais populares';
      status.textContent = `Tópicos ordenados por ${nomeCriterio}`;
    }
  }

  btnRecentes.addEventListener('click', () => ordenarPosts('recentes', btnRecentes));
  btnPopulares.addEventListener('click', () => ordenarPosts('populares', btnPopulares));
});