document.querySelectorAll('.btn-responder').forEach(btn => {
  btn.addEventListener('click', () => {
    const form = document.getElementById(btn.dataset.target);
    const abrir = form.style.display === 'none' || form.style.display === '';
    form.style.display = abrir ? 'flex' : 'none';
    btn.setAttribute('aria-expanded', String(abrir));
    if (abrir) {
      const textarea = form.querySelector('textarea');
      if (textarea) textarea.focus();
    }
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
        botao.innerHTML = `<i class="bi ${icone}" aria-hidden="true"></i>  ${data.curtidas}`;
        botao.dataset.curtido = data.curtido;
      }
    } catch (err) {
      console.error('Erro ao curtir:', err);
    }
  });
});