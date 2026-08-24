// configuracoes.js
// Específico da página de configurações.
// Depende de accessibility.js (já carregado antes no layout).

// ─── MAPEAMENTO DE BOTÕES → CHAVE/VALOR ───────────────────────────────────
// Apenas tema e narrador ainda usam botões nesta página.
// Fonte, contraste e espaçamento viraram sliders.

const MAPEAMENTO_BOTOES = {
   // Tema
  'Claro':          { chave: 'theme',        valor: 'Claro' },
  'Escuro':         { chave: 'theme',        valor: 'Escuro' },
  'Sistema':        { chave: 'theme',        valor: 'Sistema' },
  // Narrador
  'Masculino': { chave: 'narrator', valor: 'Masculino' },
  'Feminino':  { chave: 'narrator', valor: 'Feminino' },
};

// ─── SINCRONIZAR BOTÕES ATIVOS ────────────────────────────────────────────

function sincronizarBotoesAtivos() {
  const valores = {
    theme:    localStorage.getItem('theme')    || 'Sistema',
    narrator: localStorage.getItem('narrator') || 'Padrão',
  };

  document.querySelectorAll('.button-group').forEach(grupo => {
    grupo.querySelectorAll('.group-btn').forEach(btn => {
      const label         = btn.querySelector('span:last-child')?.textContent?.trim();
      const chaveExplicita = btn.dataset.chave;

      let ativo = false;
      if (chaveExplicita) {
        ativo = valores[chaveExplicita] === label;
      } else if (label && MAPEAMENTO_BOTOES[label]) {
        const { chave, valor } = MAPEAMENTO_BOTOES[label];
        ativo = valores[chave] === valor;
      }

      btn.classList.toggle('active', ativo);
      btn.setAttribute('aria-pressed', ativo);
    });
  });
}

// ─── SINCRONIZAR TOGGLES ──────────────────────────────────────────────────

function sincronizarToggles() {
  const toggles = {
    'toggle-reduce-motion':      { chave: 'reduceMotion',        padrao: 'false' },
    'toggle-cursor-large':       { chave: 'cursorLarge',         padrao: 'false' },
    'toggle-autoplay':           { chave: 'autoplay',            padrao: 'true'  },
    'toggle-notif-novas-ads':    { chave: 'notif_novas_ads',     padrao: 'true'  },
    'toggle-notif-correcoes':    { chave: 'notif_correcoes',     padrao: 'true'  },
    'toggle-notif-forum':        { chave: 'notif_forum',         padrao: 'false' },
    'toggle-notif-email-semanal':{ chave: 'notif_email_semanal', padrao: 'false' },
  };

  Object.entries(toggles).forEach(([id, { chave, padrao }]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const ativo = (localStorage.getItem(chave) ?? padrao) === 'true';
    el.checked = ativo;
    el.setAttribute('aria-checked', ativo);
  });
}

// ─── SINCRONIZAR SLIDERS ──────────────────────────────────────────────────

function sincronizarSliders() {
  // Fonte (80–150, padrão 100)
  const sliderFonte = document.getElementById('slider-fonte');
  if (sliderFonte) {
    const val = localStorage.getItem('fontScale') || '100';
    sliderFonte.value = val;
    sliderFonte.setAttribute('aria-valuenow', val);
    atualizarLabel('label-fonte', val + '%');
  }

  // Contraste (100–200, padrão 100)
  const sliderContraste = document.getElementById('slider-contraste');
  if (sliderContraste) {
    const val = localStorage.getItem('contrastLevel') || '100';
    sliderContraste.value = val;
    sliderContraste.setAttribute('aria-valuenow', val);
    atualizarLabel('label-contraste', val + '%');
  }

  // Espaçamento (12–25, padrão 15 = 1.5)
  const sliderEspacamento = document.getElementById('slider-espacamento');
  if (sliderEspacamento) {
    const val = localStorage.getItem('lineHeight') || '15';
    sliderEspacamento.value = val;
    sliderEspacamento.setAttribute('aria-valuenow', val);
    atualizarLabel('label-espacamento', (parseInt(val) / 10).toFixed(1));
  }
}

function atualizarLabel(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

// ─── CONECTAR EVENTOS ─────────────────────────────────────────────────────

function inicializarBotoes() {
  // Botões (tema + narrador)
  document.querySelectorAll('.group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const label          = btn.querySelector('span:last-child')?.textContent?.trim();
      const chaveExplicita = btn.dataset.chave;

      if (chaveExplicita) {
        salvarPreferencia(chaveExplicita, label);
      } else if (label && MAPEAMENTO_BOTOES[label]) {
        const { chave, valor } = MAPEAMENTO_BOTOES[label];
        salvarPreferencia(chave, valor);
      }

      sincronizarBotoesAtivos();
    });
  });

    // Slider de fonte
  const sliderFonte = document.getElementById('slider-fonte');
  if (sliderFonte) {
    sliderFonte.addEventListener('input', () => {
      salvarPreferencia('fontScale', sliderFonte.value);
      sliderFonte.setAttribute('aria-valuenow', sliderFonte.value);
      atualizarLabel('label-fonte', sliderFonte.value + '%');
    });
  }

  // Slider de contraste
  const sliderContraste = document.getElementById('slider-contraste');
  if (sliderContraste) {
    sliderContraste.addEventListener('input', () => {
      salvarPreferencia('contrastLevel', sliderContraste.value);
      sliderContraste.setAttribute('aria-valuenow', sliderContraste.value);
      atualizarLabel('label-contraste', sliderContraste.value + '%');
    });
  }

  // Slider de espaçamento
  const sliderEspacamento = document.getElementById('slider-espacamento');
  if (sliderEspacamento) {
    sliderEspacamento.addEventListener('input', () => {
      salvarPreferencia('lineHeight', sliderEspacamento.value);
      sliderEspacamento.setAttribute('aria-valuenow', sliderEspacamento.value);
      atualizarLabel('label-espacamento', (parseInt(sliderEspacamento.value) / 10).toFixed(1));
    });
  }

  // Toggles booleanos
  const togglesBooleanos = {
    'toggle-reduce-motion':      'reduceMotion',
    'toggle-cursor-large':       'cursorLarge',
    'toggle-autoplay':           'autoplay',
    'toggle-notif-novas-ads':    'notif_novas_ads',
    'toggle-notif-correcoes':    'notif_correcoes',
    'toggle-notif-forum':        'notif_forum',
    'toggle-notif-email-semanal':'notif_email_semanal',
  };

    Object.entries(togglesBooleanos).forEach(([id, chave]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        salvarPreferencia(chave, el.checked ? 'true' : 'false');
        el.setAttribute('aria-checked', el.checked);
      });
    });

  // Botão fechar dica
  const closeTip = document.querySelector('.close-tip');
  if (closeTip) {
    closeTip.addEventListener('click', () => {
      document.querySelector('.accessibility-tip')?.remove();
    });
  }
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  sincronizarBotoesAtivos();
  sincronizarToggles();
  sincronizarSliders();
  inicializarBotoes();
});

// Sincroniza se outra aba mudar uma preferência
window.addEventListener('storage', (e) => {
  const chavesMonitoradas = [
    'theme', 'fontScale', 'contrastLevel', 'lineHeight',
    'reduceMotion', 'cursorLarge', 'autoplay', 'narrator',
    'notif_novas_ads', 'notif_correcoes', 'notif_forum', 'notif_email_semanal',
  ];
  if (chavesMonitoradas.includes(e.key)) {
    sincronizarBotoesAtivos();
    sincronizarToggles();
    sincronizarSliders();
  }
});