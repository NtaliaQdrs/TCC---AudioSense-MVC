document.addEventListener('DOMContentLoaded', () => {
  const btnGrid = document.getElementById('btn-grid');
  const btnList = document.getElementById('btn-list');
  const posts = document.querySelector('.forum-posts');


  btnGrid.classList.add('active');

  btnGrid.addEventListener('click', () => {
    posts.classList.remove('list-view');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
  });

  btnList.addEventListener('click', () => {
    posts.classList.add('list-view');
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
  });

  document.querySelectorAll('.btn-curtir').forEach(botao => {
    botao.addEventListener('click', async () => {
      const id = botao.dataset.id;
      try {
        const resp = await fetch(`/forum/${id}/curtir`, { method: 'POST' });
        const data = await resp.json();
        if (resp.ok) {
          const icone = data.curtido ? 'bi-heart-fill' : 'bi-heart';
          botao.innerHTML = `<i class="bi ${icone}"></i>  ${data.curtidas}`;
        }
      } catch (err) {
        console.error('Erro ao curtir:', err);
      }
    });
  });

});