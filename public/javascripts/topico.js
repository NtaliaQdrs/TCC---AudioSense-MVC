document.querySelectorAll('.btn-responder').forEach(btn => {
  btn.addEventListener('click', () => {
    const form = document.getElementById(btn.dataset.target);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });
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