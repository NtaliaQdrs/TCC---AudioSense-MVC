// ─── CHAVES DO LOCALSTORAGE ────────────────────────────────────────────────
// theme          : 'Claro' | 'Escuro' | 'Sistema'
// fontScale      : '80' a '150'  (%, aplicado como font-size no html)
// contrastLevel  : '100' a '200' (filter: contrast() no body)
// lineHeight     : '12' a '25'   (×0.1 = valor real, ex: '15' = 1.5)
// contrast       : 'Padrão' | 'Alto contraste' | 'Preto e branco' (modos fixos FAB)
// reduceMotion   : 'true' | 'false'
// cursorLarge    : 'true' | 'false'
// audioSpeed     : string numérico (ex: '10' = 1.0x)
// autoplay       : 'true' | 'false'
// narrator       : 'Padrão' | 'Masculino' | 'Feminino'
// notif_*        : 'true' | 'false'

// ─── HELPER ───────────────────────────────────────────────────────────────

function salvarPreferencia(chave, valor) {
  localStorage.setItem(chave, valor);
  aplicarPreferenciasSalvas();
  if (typeof sincronizarBotoesAtivos === 'function') sincronizarBotoesAtivos();
}

// ─── APLICAR PREFERÊNCIAS ─────────────────────────────────────────────────

function aplicarPreferenciasSalvas() {
  const theme = localStorage.getItem('theme');
  const contrast = localStorage.getItem('contrast');
  const fontScale = parseInt(localStorage.getItem('fontScale')) || 100;
  const contrastLevel = parseInt(localStorage.getItem('contrastLevel')) || 100;
  const lineHeight = parseInt(localStorage.getItem('lineHeight')) || 15;
  const reduceMotion = localStorage.getItem('reduceMotion');
  const cursorLarge = localStorage.getItem('cursorLarge');
  const html = document.documentElement;

  // ── Tema ──────────────────────────────────────────────────────────────
  html.classList.remove('dark-theme', 'light-theme');
  if (theme === 'Escuro') {
    html.classList.add('dark-theme');
  } else if (theme === 'Claro') {
    html.classList.add('light-theme');
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark-theme');
    } else {
      html.classList.add('light-theme');
    }
  }

  // ── Contraste fixo (classes CSS) ─────────────────────────────────────
  html.classList.remove('high-contrast', 'black-white');
  if (contrast === 'Alto contraste') html.classList.add('high-contrast');
  else if (contrast === 'Preto e branco') html.classList.add('black-white');

  // ── Outros toggles de classe ──────────────────────────────────────────
  html.classList.toggle('reduce-motion', reduceMotion === 'true');
  html.classList.toggle('cursor-large', cursorLarge === 'true');

  // ── CSS injetado ──────────────────────────────────────────────────────
  const styleId = 'accessibility-styles';
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  let css = '';

  // ── Escala de fonte ───────────────────────────────────────────────────
  const escala = fontScale / 100;
  css += `html { font-size: ${fontScale}% !important; }`;
  css += `
  *, *::before, *::after {
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }
`;
  if (fontScale !== 100) {
    css += `
      body, p, span, a, li, td, th, label, input, button, select, textarea {
        font-size: ${escala}rem !important;
      }
      h1 { font-size: ${(escala * 2.2).toFixed(2)}rem !important; }
      h2 { font-size: ${(escala * 1.8).toFixed(2)}rem !important; }
      h3 { font-size: ${(escala * 1.4).toFixed(2)}rem !important; }
      h4 { font-size: ${(escala * 1.2).toFixed(2)}rem !important; }
    `;
  }
  if (fontScale >= 120) {
  css += `
    .top-bar { height: auto !important; min-height: 10px !important; padding: 10px 0 !important; }
    .menu-links { gap: 110px !important; margin-left: 110px !important; }
    .menu-links a { font-size: 22px !important; }
    .search-box1 { width: 260px !important; }
    .search-box1 input { width: 260px !important; font-size: 18px !important; }
    #profileBtn { 
      width: auto !important; 
      min-width: 150px !important;
      padding: 12px 22px !important;
      height: 50px !important;
    }
    #profileBtn span { 
      display: inline !important;
      font-size: 19px !important; 
    }
    #perfil-logo { font-size: 26px !important; }
    .menu-right { gap: 50px !important; margin-left: 120px !important; }
    .sub-menu { padding: 20px 0 !important; }
    .sub-menu nav { gap: 30px !important; padding: 0 40px !important; flex-wrap: wrap !important; margin-top: 15px !important; }
    .sub-menu a { 
      min-width: 180px !important;
      font-size: 20px !important;
      padding: 14px 24px !important;
      height: auto !important;
    }
  `;
}
if (fontScale >= 130) {
  css += `
    .menu-links { display: none !important; }
    .category-toggle { display: block !important; }
    .search-box1 { display: none !important; }
  `;
}

  // ── Modos de contraste ────────────────────────────────────────────────
  if (contrast === 'Alto contraste') {
    const fab = document.querySelector('.fab-container');
    if (fab && fab.parentElement === document.body) {
      document.documentElement.appendChild(fab);
    }

    css += `
      html {
        filter: contrast(200%) invert(1) !important;
        background-color: #fff !important;
      }
      img, video, canvas, svg image {
        filter: invert(1) !important;
      }
      .fab-container {
      filter: invert(1) contrast(200%) !important;
      position: fixed !important;
      bottom: 28px !important;
      right: 28px !important;
      z-index: 9998 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      gap: 10px !important; }
      fab-btn {
      filter: invert(1) contrast(200%) !important;
      background-color: #000 !important;
      color: #000 !important;
      }
      /* Cards com tom diferente do fundo */
      .welcome-container, .stats-container, .learning-extra-container,
      .extra-card, .collab-box, .learning-item, .main-config-card,
      .material-card, .forum-item, .audiodescricao-item, .projeto-card,
      .user-card, .stat-card, .card, .container, .containercust, , .post-card {
        background-color: #b8b4b4 !important;
        border-color: #000000 !important;
     
  }
    `;

  } else if (contrast === 'Preto e branco') {
    const fab = document.querySelector('.fab-container');
    if (fab && fab.parentElement === document.documentElement) {
      document.body.appendChild(fab);
    }

    css += `
      html { filter: grayscale(100%) contrast(${Math.max(contrastLevel, 110)}%) !important; }
    `;

  } else {
    const fab = document.querySelector('.fab-container');
    if (fab && fab.parentElement === document.documentElement) {
      document.body.appendChild(fab);
    }

    if (contrastLevel !== 100) {
      const fator = (contrastLevel - 100) / 100;
      const r = Math.round(233 - (233 - 150) * fator);
      const g = Math.round(204 - (204 - 100) * fator);
      const b = Math.round(239 - (239 - 180) * fator);

      css += `html { filter: contrast(${contrastLevel}%) !important; }`;
      css += `
    body { background-color: rgb(${r}, ${g}, ${b}) !important; }
    .top-bar { filter: none !important; isolation: isolate; }
    .logo img { filter: none !important; position: static !important; transform: scale(1.5) !important; }
    .sub-menu { filter: none !important; background-color: rgb(${r}, ${g}, ${b}) !important; }
    #profileBtn { background-color: rgb(${r}, ${g}, ${b}) !important; }
  `;
    }
  }

  // ── Espaçamento entre linhas ──────────────────────────────────────────
  const lh = (lineHeight / 10).toFixed(1);
  css += `body, p, li, span, a, h1, h2, h3, h4 { line-height: ${lh} !important; }`;

  // ── Reduzir animações ─────────────────────────────────────────────────
  if (reduceMotion === 'true') {
    css += `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
  }

  // ── Cursor ampliado ───────────────────────────────────────────────────
  if (cursorLarge === 'true') {
    css += `* { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35"><path fill="black" stroke="white" stroke-width="1.5" d="M6 2 L6 26 L11 21 L15 30 L18 28.5 L14 19.5 L21 19.5 Z"/></svg>') 0 0, auto !important; }`;
  }

  styleTag.innerHTML = css;
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

// ─── OUVIR MUDANÇA DE TEMA DO SISTEMA ─────────────────────────────────────

const mq = window.matchMedia('(prefers-color-scheme: dark)');
mq.addEventListener('change', () => {
  const theme = localStorage.getItem('theme');
  if (!theme || theme === 'Sistema') aplicarPreferenciasSalvas();
});

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────

aplicarPreferenciasSalvas();

document.addEventListener('DOMContentLoaded', () => {
  aplicarPreferenciasSalvas();
  anunciarTituloDaPagina();
});

window.addEventListener('storage', (e) => {
  const chavesMonitoradas = [
    'theme', 'contrast', 'fontScale', 'contrastLevel', 'lineHeight',
    'reduceMotion', 'cursorLarge', 'audioSpeed'
  ];
  if (chavesMonitoradas.includes(e.key)) {
    aplicarPreferenciasSalvas();
    if (typeof sincronizarBotoesAtivos === 'function') sincronizarBotoesAtivos();
  }
});