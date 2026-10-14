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
      if (!usuarioEstaLogado()) {
        mostrarAvisoLogin(botao);
        return;
      }

      const id = botao.dataset.id;
      try {
        const resp = await fetch(`/forum/${id}/curtir`, { method: 'POST' });

        // Sessão expirada: o middleware de auth devolve 401/403 ou redireciona pro login
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
});