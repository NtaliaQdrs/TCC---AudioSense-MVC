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
  const btnRecentes = document.getElementById('btn-recentes');
  const btnPopulares = document.getElementById('btn-populares');

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

  if (btnRecentes && btnPopulares && posts) {
    const cartoes = Array.from(posts.querySelectorAll('.post-card'));
    const ordemInicial = new Map(cartoes.map((cartao, index) => [cartao, index]));
    const statusOrdenacao = document.getElementById('ordenacao-status');

    function ordenarTopicos(ordem) {
      const recentes = ordem === 'recentes';
      cartoes.sort((a, b) => {
        const dataA = Date.parse(a.dataset.dataPostagem) || 0;
        const dataB = Date.parse(b.dataset.dataPostagem) || 0;
        if (recentes) return dataB - dataA || ordemInicial.get(a) - ordemInicial.get(b);

        const curtidasA = Number(a.dataset.curtidas) || 0;
        const curtidasB = Number(b.dataset.curtidas) || 0;
        return curtidasB - curtidasA || dataB - dataA || ordemInicial.get(a) - ordemInicial.get(b);
      });
      cartoes.forEach(cartao => posts.appendChild(cartao));
      btnRecentes.setAttribute('aria-pressed', String(recentes));
      btnPopulares.setAttribute('aria-pressed', String(!recentes));
      if (statusOrdenacao) {
        statusOrdenacao.textContent = recentes
          ? 'Tópicos ordenados dos mais recentes para os mais antigos.'
          : 'Tópicos ordenados pelos mais curtidos.';
      }
    }

    btnRecentes.addEventListener('click', () => ordenarTopicos('recentes'));
    btnPopulares.addEventListener('click', () => ordenarTopicos('populares'));
  }

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
          botao.setAttribute('aria-pressed', String(data.curtido));
          botao.setAttribute('aria-label', `${data.curtido ? 'Descurtir' : 'Curtir'} tópico`);
        } else {
          const status = document.getElementById('forum-action-status');
          if (status) status.textContent = data.erro || 'Não foi possível atualizar a curtida.';
        }
      } catch (err) {
        console.error('Erro ao curtir:', err);
        const status = document.getElementById('forum-action-status');
        if (status) status.textContent = 'Falha de conexão ao atualizar a curtida. Tente novamente.';
      }
    });
  });
});