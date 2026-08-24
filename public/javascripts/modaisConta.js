// modais-conta.js
// Controla os modais de Alterar nome / e-mail / senha / excluir conta
// na página de Configurações. Envia os formulários via fetch (sem recarregar a página).

document.addEventListener('DOMContentLoaded', () => {
  const overlays = document.querySelectorAll('.modal-overlay');
  const conteudoPrincipal = document.querySelector('.config-conteudo-principal');
  let elementoComFocoAntes = null;

  // ─── ABRIR MODAL ────────────────────────────────────────────────────────
  document.querySelectorAll('[data-modal]').forEach(gatilho => {
    gatilho.addEventListener('click', () => {
      const modal = document.getElementById(gatilho.dataset.modal);
      if (!modal) return;
      elementoComFocoAntes = gatilho;
      abrirModal(modal);
    });
  });

  // ─── FECHAR MODAL (botão X, Cancelar, clique fora, Esc) ────────────────
  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fecharModal(overlay);
    });
    overlay.querySelectorAll('[data-fechar]').forEach(botao => {
      botao.addEventListener('click', () => fecharModal(overlay));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlays.forEach(overlay => {
        if (!overlay.hidden) fecharModal(overlay);
      });
    }
  });

  // ─── PRENDER O FOCO DENTRO DO MODAL (Tab / Shift+Tab) ───────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const overlayAberto = Array.from(overlays).find(o => !o.hidden);
    if (!overlayAberto) return;

    const focaveis = overlayAberto.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focaveis.length === 0) return;

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  });

  function abrirModal(modal) {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    // Esconde o conteúdo de fundo de leitores de tela e do Tab
    if (conteudoPrincipal) conteudoPrincipal.setAttribute('inert', '');

    const primeiroInput = modal.querySelector('input');
    if (primeiroInput) primeiroInput.focus();
  }

  function fecharModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';

    if (conteudoPrincipal) conteudoPrincipal.removeAttribute('inert');

    // Devolve o foco pro botão que abriu o modal
    if (elementoComFocoAntes) {
      elementoComFocoAntes.focus();
      elementoComFocoAntes = null;
    }

    const form = modal.querySelector('form');
    if (form) {
      form.reset();
      limparFeedback(form);
    }
  }

  function limparFeedback(form) {
    const feedback = form.querySelector('.modal-feedback');
    if (feedback) {
      feedback.textContent = '';
      feedback.className = 'modal-feedback';
    }
  }

  // ─── ENVIO DOS FORMULÁRIOS ──────────────────────────────────────────────
  document.querySelectorAll('.modal-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const endpoint = form.dataset.endpoint;
      const feedback = form.querySelector('.modal-feedback');
      const botaoSubmit = form.querySelector('button[type="submit"]');
      const textoOriginal = botaoSubmit.textContent;

      // Validação simples de confirmação de senha no front (a real é no back-end)
      const novaSenha = form.querySelector('[name="nova_senha"]');
      const confirmarSenha = form.querySelector('[name="confirmar_senha"]');
      if (novaSenha && confirmarSenha && novaSenha.value !== confirmarSenha.value) {
        mostrarFeedback(feedback, 'As senhas não coincidem.', 'erro');
        return;
      }

      // Trava extra contra exclusão acidental: exige digitar a palavra exata
      const textoEsperado = form.dataset.confirmarTexto;
      if (textoEsperado) {
        const campoConfirmacao = form.querySelector('[name="confirmacao_texto"]');
        if (!campoConfirmacao || campoConfirmacao.value.trim() !== textoEsperado) {
          mostrarFeedback(feedback, `Digite exatamente "${textoEsperado}" para confirmar.`, 'erro');
          return;
        }
      }

      const dados = Object.fromEntries(new FormData(form).entries());
      // O texto de confirmação é só validação de UX — não precisa ir pro back-end
      delete dados.confirmacao_texto;

      botaoSubmit.disabled = true;
      botaoSubmit.textContent = 'Enviando...';
      limparFeedback(form);

      try {
        const resposta = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(dados),
        });

        const resultado = await resposta.json().catch(() => ({}));

        if (resposta.ok && resultado.sucesso) {
          mostrarFeedback(feedback, resultado.mensagem || 'Feito!', 'sucesso');

          const redirecionarPara = form.dataset.redirecionar;
          setTimeout(() => {
            if (redirecionarPara) {
              window.location.href = redirecionarPara;
            } else {
              window.location.reload();
            }
          }, 1200);
        } else {
          mostrarFeedback(feedback, resultado.mensagem || resultado.erro || 'Não foi possível concluir a ação.', 'erro');
        }
      } catch (err) {
        console.error('Erro ao enviar formulário:', err);
        mostrarFeedback(feedback, 'Erro de conexão. Tente novamente.', 'erro');
      } finally {
        botaoSubmit.disabled = false;
        botaoSubmit.textContent = textoOriginal;
      }
    });
  });

  function mostrarFeedback(elemento, mensagem, tipo) {
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.className = `modal-feedback modal-feedback--${tipo}`;
  }
});