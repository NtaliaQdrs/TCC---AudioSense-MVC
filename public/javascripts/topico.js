function usuarioEstaLogado() {
  return typeof usuarioLogado !== 'undefined' && !!usuarioLogado;
}

function mostrarAvisoLogin(botaoOrigem) {
  const existente = document.getElementById('aviso-login');
  if (existente) existente.remove();

  const aviso = document.createElement('div');
  aviso.id = 'aviso-login';
  aviso.className = 'aviso-login';
  aviso.setAttribute('role', 'alert');
  aviso.innerHTML = `
    <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
    <p>Você precisa estar logado para curtir um post.</p>
    <a href="/usuario" class="aviso-login-link">Fazer login</a>
    <button type="button" class="aviso-login-fechar" aria-label="Fechar aviso">
      <i class="bi bi-x-lg" aria-hidden="true"></i>
    </button>
  `;
  document.body.appendChild(aviso);

  function fechar() {
    aviso.remove();
    document.removeEventListener('keydown', aoApertarEsc);
    if (botaoOrigem) botaoOrigem.focus();
  }

  function aoApertarEsc(e) {
    if (!document.body.contains(aviso)) {
      document.removeEventListener('keydown', aoApertarEsc);
      return;
    }
    if (e.key === 'Escape') fechar();
  }

  aviso.querySelector('.aviso-login-fechar').addEventListener('click', fechar);
  document.addEventListener('keydown', aoApertarEsc);
  aviso.querySelector('.aviso-login-link').focus();
}

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
    if (!usuarioEstaLogado()) {
      mostrarAvisoLogin(botao);
      return;
    }

    const id = botao.dataset.id;
    try {
      const resp = await fetch(`/forum/${id}/curtir`, { method: 'POST' });

      if (resp.redirected || resp.status === 401 || resp.status === 403) {
        mostrarAvisoLogin(botao);
        return;
      }

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