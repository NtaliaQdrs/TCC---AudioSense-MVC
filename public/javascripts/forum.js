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

});