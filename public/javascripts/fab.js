// fab.js
// Depende de accessibility.js (já carregado antes no layout).

// ─── ABRIR / FECHAR PAINEL ────────────────────────────────────────────────

function inicializarFab() {
  const fabBtn = document.getElementById('fab-btn');
  const fabPanel = document.getElementById('fab-panel');
  const fabClose = document.getElementById('fab-close');
  if (!fabBtn || !fabPanel) return;

  fabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const aberto = fabPanel.classList.toggle('fab-panel--open');
    fabPanel.hidden = !aberto;
    fabBtn.setAttribute('aria-expanded', aberto);

    if (aberto) {
      fabPanel.querySelector('button, a[href], input, [tabindex]:not([tabindex="-1"])')?.focus();
    }
  });

  if (fabClose) {
    fabClose.addEventListener('click', () => {
      fabPanel.classList.remove('fab-panel--open');
      fabPanel.hidden = true;
      fabBtn.setAttribute('aria-expanded', 'false');
      fabBtn.focus();
    });
  }

  document.addEventListener('click', (e) => {
    if (!fabPanel.contains(e.target) && e.target !== fabBtn) {
      fabPanel.classList.remove('fab-panel--open');
      fabPanel.hidden = true;
      fabBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    const aberto = fabPanel.classList.contains('fab-panel--open');
    if (!aberto) return;

    if (e.key === 'Escape') {
      fabPanel.classList.remove('fab-panel--open');
      fabPanel.hidden = true;
      fabBtn.setAttribute('aria-expanded', 'false');
      fabBtn.focus();
      return;
    }

  });
}

// ─── ANUNCIAR MUDANÇAS PARA LEITOR DE TELA ────────────────────────────────

const _rotulos = {
  theme: 'Tema',
  fontScale: 'Tamanho da fonte',
  contrast: 'Contraste',
  underlineLinks: 'Sublinhar textos e links',
  readableFont: 'Fonte legível',
  readingGuide: 'Guia de leitura',
  reduceMotion: 'Reduzir animação',
};

function _anunciar(texto) {
  const live = document.getElementById('fab-live');
  if (live) live.textContent = texto;
}

// ─── SINCRONIZAR BOTÕES DO FAB ────────────────────────────────────────────

function sincronizarFab() {
  const theme = localStorage.getItem('theme') || 'Sistema';
  const fontScale = localStorage.getItem('fontScale') || '100';
  const contrast = localStorage.getItem('contrast') || 'Padrão';
  const audioSpeed = localStorage.getItem('audioSpeed') || '10';

  // Botões de grupo (valor único: theme, fontScale, contrast)
  document.querySelectorAll('#fab-panel [data-fab-chave]').forEach((btn) => {
    const chave = btn.dataset.fabChave;
    const valor = btn.dataset.fabValor;

    let ativo = false;
    if (chave === 'theme') ativo = theme === valor;
    if (chave === 'contrast') ativo = contrast === valor;
    if (chave === 'fontScale') ativo = fontScale === valor;

    btn.classList.toggle('fab-btn-opt--active', ativo);
    btn.setAttribute('aria-pressed', ativo);
  });

  // Botões de alternância (ligado/desligado): underlineLinks, readableFont,
  // readingGuide, reduceMotion
  document.querySelectorAll('#fab-panel [data-fab-toggle]').forEach((btn) => {
    const chave = btn.dataset.fabToggle;
    const ativo = localStorage.getItem(chave) === 'true';
    btn.classList.toggle('fab-btn-opt--active', ativo);
    btn.setAttribute('aria-pressed', ativo);
  });

  const sliderFab = document.getElementById('fab-slider-speed');
  const labelFab = document.getElementById('fab-label-speed');
  if (sliderFab) {
    sliderFab.value = audioSpeed;
    if (labelFab) labelFab.textContent = (parseInt(audioSpeed) / 10).toFixed(1) + 'x';
  }
}

// ─── GUIA DE LEITURA — segue o cursor quando ativa ────────────────────────

function _inicializarGuiaDeLeitura() {
  const guia = document.getElementById('fab-reading-guide');
  if (!guia) return;

  document.addEventListener('mousemove', (e) => {
    if (localStorage.getItem('readingGuide') !== 'true') return;
    guia.style.top = e.clientY - 21 + 'px';
  });
}

// ─── CONECTAR EVENTOS DO FAB ──────────────────────────────────────────────

function inicializarEventosFab() {
  // Botões de grupo (valor único)
  document.querySelectorAll('#fab-panel [data-fab-chave]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chave = btn.dataset.fabChave;
      const valor = btn.dataset.fabValor;
      salvarPreferencia(chave, valor);
      sincronizarFab();
      _anunciar(`${_rotulos[chave] || chave}: ${valor}`);
      if (typeof sincronizarBotoesAtivos === 'function') sincronizarBotoesAtivos();
      if (typeof sincronizarSliders === 'function') sincronizarSliders();
    });
  });

  // Botões de alternância (ligado/desligado)
  document.querySelectorAll('#fab-panel [data-fab-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chave = btn.dataset.fabToggle;
      const ativoAtual = localStorage.getItem(chave) === 'true';
      const novoValor = !ativoAtual;
      salvarPreferencia(chave, String(novoValor));
      sincronizarFab();
      _anunciar(`${_rotulos[chave] || chave} ${novoValor ? 'ativado' : 'desativado'}`);
    });
  });

  // Restaurar padrões
  const resetBtn = document.getElementById('fab-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const chaves = [
        'theme', 'fontScale', 'contrast', 'contrastLevel', 'lineHeight',
        'underlineLinks', 'readableFont', 'readingGuide', 'reduceMotion',
        'cursorLarge',
      ];
      chaves.forEach((c) => localStorage.removeItem(c));
      aplicarPreferenciasSalvas();
      sincronizarFab();
      _anunciar('Preferências de acessibilidade restauradas ao padrão');
    });
  }

  const sliderFab = document.getElementById('fab-slider-speed');
  const labelFab = document.getElementById('fab-label-speed');
  if (sliderFab) {
    sliderFab.addEventListener('input', () => {
      localStorage.setItem('audioSpeed', sliderFab.value);
      if (labelFab) labelFab.textContent = (parseInt(sliderFab.value) / 10).toFixed(1) + 'x';
    });
  }
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  inicializarFab();
  sincronizarFab();
  inicializarEventosFab();
  _inicializarGuiaDeLeitura();
});

window.addEventListener('storage', (e) => {
  const chavesMonitoradas = [
    'theme', 'fontScale', 'contrast', 'audioSpeed',
    'underlineLinks', 'readableFont', 'readingGuide', 'reduceMotion',
  ];
  if (chavesMonitoradas.includes(e.key)) {
    sincronizarFab();
  }
});