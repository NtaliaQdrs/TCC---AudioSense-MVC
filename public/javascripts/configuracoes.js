// ─── APLICAR PREFERÊNCIAS SALVAS ───────────────────────────────────────────

function aplicarPreferenciasSalvas() {
  const fontSize = localStorage.getItem('fontSize');
  const contrast = localStorage.getItem('contrast');
  const theme    = localStorage.getItem('theme');
  const html     = document.documentElement;

  // 1. Classes no <html>
  if (fontSize) {
    html.classList.remove('font-small', 'font-medium', 'font-large');
    if (fontSize === 'Pequeno') html.classList.add('font-small');
    else if (fontSize === 'Médio')  html.classList.add('font-medium');
    else if (fontSize === 'Grande') html.classList.add('font-large');
  }

  if (contrast) {
    html.classList.remove('high-contrast', 'black-white');
    if (contrast === 'Alto contraste') html.classList.add('high-contrast');
    else if (contrast === 'Preto e branco') html.classList.add('black-white');
  }

  if (theme) {
    html.classList.remove('dark-theme', 'light-theme');
    if (theme === 'Escuro') html.classList.add('dark-theme');
    else if (theme === 'Claro') html.classList.add('light-theme');
  }

  // 2. CSS injetado para garantir aplicação em todas as telas
  const styleId = 'accessibility-styles';
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  let css = '';

  if (fontSize === 'Grande') {
    css += `
      body, p, span, a, li, input, button { font-size: 1.2rem !important; }
      h1 { font-size: 3rem !important; }
      h2 { font-size: 2.5rem !important; }
      h3 { font-size: 2rem !important; }
    `;
  } else if (fontSize === 'Pequeno') {
    css += `
      body, p, span, a, li, input, button { font-size: 0.9rem !important; }
    `;
  }

  if (contrast === 'Alto contraste') {
    css += `
      * {
        background-color: #000 !important;
        color: #ffff00 !important;
        border-color: #ffff00 !important;
        text-shadow: none !important;
        box-shadow: none !important;
      }
      a, button { text-decoration: underline !important; }
      img { filter: grayscale(100%) contrast(150%) !important; }
    `;
  } else if (contrast === 'Preto e branco') {
    css += `
      html { filter: grayscale(100%) contrast(110%) !important; }
      body { background-color: #fff !important; color: #000 !important; }
      .top-bar, .footer, .welcome-container, .main-config-card { border: 2px solid #000 !important; }
    `;
  }

  styleTag.innerHTML = css;
}

// ─── SINCRONIZAR BOTÕES ATIVOS COM O LOCALSTORAGE ──────────────────────────

function sincronizarBotoesAtivos() {
  const fontSize = localStorage.getItem('fontSize');
  const contrast = localStorage.getItem('contrast');
  const theme    = localStorage.getItem('theme');

  // Mapeia cada grupo de botões pelo texto do span filho
  const grupos = document.querySelectorAll('.button-group');

  grupos.forEach(grupo => {
    const botoes = grupo.querySelectorAll('.group-btn');
    botoes.forEach(btn => {
      const label = btn.querySelector('span:last-child')?.textContent?.trim();

      const ativo =
        label === fontSize ||
        label === contrast ||
        label === theme;

      btn.classList.toggle('active', ativo);
    });
  });
}

// ─── CONECTAR CLIQUES NOS BOTÕES ───────────────────────────────────────────

function inicializarBotoes() {
  // Grupos de botões: Fonte | Contraste | Tema
  // Identificamos pelo label de cada botão
  const mapeamento = {
    'Pequeno':        () => localStorage.setItem('fontSize', 'Pequeno'),
    'Médio':          () => localStorage.setItem('fontSize', 'Médio'),
    'Grande':         () => localStorage.setItem('fontSize', 'Grande'),
    'Padrão':         () => localStorage.setItem('contrast', 'Padrão'),
    'Alto contraste': () => localStorage.setItem('contrast', 'Alto contraste'),
    'Preto e branco': () => localStorage.setItem('contrast', 'Preto e branco'),
    'Claro':          () => localStorage.setItem('theme', 'Claro'),
    'Escuro':         () => localStorage.setItem('theme', 'Escuro'),
    'Sistema':        () => localStorage.setItem('theme', 'Sistema'),
  };

  document.querySelectorAll('.group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.querySelector('span:last-child')?.textContent?.trim();

      if (mapeamento[label]) {
        mapeamento[label](); // salva no localStorage
        aplicarPreferenciasSalvas();
        sincronizarBotoesAtivos();
      }
    });
  });

  // Slider de velocidade
  const slider = document.querySelector('input[type="range"]');
  if (slider) {
    // Restaurar valor salvo
    const savedSpeed = localStorage.getItem('audioSpeed');
    if (savedSpeed) slider.value = savedSpeed;

    slider.addEventListener('input', () => {
      localStorage.setItem('audioSpeed', slider.value);
    });
  }

  // Botão fechar dica
  const closeTip = document.querySelector('.close-tip');
  if (closeTip) {
    closeTip.addEventListener('click', () => {
      document.querySelector('.accessibility-tip')?.remove();
    });
  }
}

// ─── ANUNCIAR TÍTULO PARA LEITORES DE TELA ────────────────────────────────

function anunciarTituloDaPagina() {
  const tituloPrincipal = document.querySelector('h1, h2');
  if (tituloPrincipal) {
    if (!tituloPrincipal.hasAttribute('tabindex')) {
      tituloPrincipal.setAttribute('tabindex', '-1');
    }
    setTimeout(() => tituloPrincipal.focus(), 100);
  }
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────

aplicarPreferenciasSalvas(); // roda antes do DOMContentLoaded para evitar flash

document.addEventListener('DOMContentLoaded', () => {
  aplicarPreferenciasSalvas();
  sincronizarBotoesAtivos(); // marca o botão certo como active ao carregar
  inicializarBotoes();       // conecta os cliques
  anunciarTituloDaPagina();
});

// Sincroniza entre abas
window.addEventListener('storage', (e) => {
  if (['fontSize', 'contrast', 'theme', 'audioSpeed'].includes(e.key)) {
    aplicarPreferenciasSalvas();
    sincronizarBotoesAtivos();
  }
});