// fab.js
// Depende de accessibility.js (já carregado antes no layout).

// ─── ABRIR / FECHAR PAINEL ────────────────────────────────────────────────

function inicializarFab() {
  const fabBtn   = document.getElementById('fab-btn');
  const fabPanel = document.getElementById('fab-panel');
  if (!fabBtn || !fabPanel) return;

  fabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const aberto = fabPanel.classList.toggle('fab-panel--open');
    fabBtn.setAttribute('aria-expanded', aberto);
  });

  document.addEventListener('click', (e) => {
    if (!fabPanel.contains(e.target) && e.target !== fabBtn) {
      fabPanel.classList.remove('fab-panel--open');
      fabBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fabPanel.classList.remove('fab-panel--open');
      fabBtn.setAttribute('aria-expanded', 'false');
      fabBtn.focus();
    }
  });
}

// ─── SINCRONIZAR BOTÕES DO FAB ────────────────────────────────────────────

function sincronizarFab() {
  const theme      = localStorage.getItem('theme')        || 'Sistema';
  const fontScale  = localStorage.getItem('fontScale')    || '100';
  const contrast   = localStorage.getItem('contrast')     || 'Padrão';
  const audioSpeed = localStorage.getItem('audioSpeed')   || '10';

  document.querySelectorAll('#fab-panel [data-fab-chave]').forEach(btn => {
    const chave = btn.dataset.fabChave;
    const valor = btn.dataset.fabValor;

    let ativo = false;
    if (chave === 'theme')      ativo = theme === valor;
    if (chave === 'contrast')   ativo = contrast === valor;
    if (chave === 'fontScale')  ativo = fontScale === valor;

    btn.classList.toggle('fab-btn-opt--active', ativo);
    btn.setAttribute('aria-pressed', ativo);
  });

  const sliderFab = document.getElementById('fab-slider-speed');
  const labelFab  = document.getElementById('fab-label-speed');
  if (sliderFab) {
    sliderFab.value = audioSpeed;
    if (labelFab) labelFab.textContent = (parseInt(audioSpeed) / 10).toFixed(1) + 'x';
  }
}

// ─── CONECTAR EVENTOS DO FAB ──────────────────────────────────────────────

function inicializarEventosFab() {
  document.querySelectorAll('#fab-panel [data-fab-chave]').forEach(btn => {
    btn.addEventListener('click', () => {
      const chave = btn.dataset.fabChave;
      const valor = btn.dataset.fabValor;
      salvarPreferencia(chave, valor);
      sincronizarFab();
      if (typeof sincronizarBotoesAtivos === 'function') sincronizarBotoesAtivos();
      if (typeof sincronizarSliders === 'function') sincronizarSliders();
    });
  });

  const sliderFab = document.getElementById('fab-slider-speed');
  const labelFab  = document.getElementById('fab-label-speed');
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
});

window.addEventListener('storage', (e) => {
  if (['theme', 'fontScale', 'contrast', 'audioSpeed'].includes(e.key)) {
    sincronizarFab();
  }
});