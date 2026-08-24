// ─── CHAVES DO LOCALSTORAGE ────────────────────────────────────────────────
// theme          : 'Claro' | 'Escuro' | 'Sistema'
// fontScale      : '80' a '150'  (%, aplicado via estilo inline em cada elemento)
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

// ─── ESCALA DE FONTE (NOVO) ─────────────────────────────────────────────
// Por que via estilo inline e não via <style> com seletor de tag:
// uma regra de CLASSE em qualquer lugar do seu CSS (ex: .stat-value,
// .menu-links a) tem especificidade maior que uma regra de TAG (p, span,
// a...), mesmo as duas usando !important — então a regra de tag sempre
// perde para qualquer componente com classe própria. Estilo inline com
// !important, por outro lado, tem prioridade sobre !important de
// stylesheet, independente da especificidade da classe. É o único jeito
// de garantir 100% de cobertura sem precisar listar cada seletor do site.

const FONT_ORIGINAL_ATTR = 'data-font-original';
let _fontScaleAtual = 100;

function _elegivelParaEscala(el) {
  return !(el.closest && el.closest('.fab-container'));
}

// 1ª passada: só LÊ e guarda o tamanho original — não escala nada ainda.
// Precisa ser um passo isolado: se lêssemos e escalássemos elemento por
// elemento na mesma passada, ao chegar num filho que herda o font-size do
// pai (não tem valor próprio), a leitura já viria contaminada pelo pai que
// acabou de ser aumentado segundos antes — e isso composta a cada nível de
// aninhamento (é o motivo da sidebar ter ficado gigante: mais camadas
// aninhadas = mais composição).
function _guardarTamanhosOriginais(elementos) {
  elementos.forEach((el) => {
    if (!_elegivelParaEscala(el)) return;
    if (el.hasAttribute(FONT_ORIGINAL_ATTR)) return;
    const computado = parseFloat(getComputedStyle(el).fontSize);
    if (!computado) return;
    el.setAttribute(FONT_ORIGINAL_ATTR, computado);
  });
}

// 2ª passada: aplica a escala usando SEMPRE o valor original já guardado
// (nunca lê getComputedStyle de novo aqui).
function _aplicarEscalaGuardada(elementos, fator) {
  elementos.forEach((el) => {
    if (!_elegivelParaEscala(el)) return;
    const original = el.getAttribute(FONT_ORIGINAL_ATTR);
    if (original === null) return;
    el.style.setProperty('font-size', (parseFloat(original) * fator) + 'px', 'important');
  });
}

function aplicarEscalaFonte(fontScale) {
  _fontScaleAtual = fontScale;

  if (fontScale === 100) {
    document.querySelectorAll('[' + FONT_ORIGINAL_ATTR + ']').forEach((el) => {
      el.style.removeProperty('font-size');
    });
    return;
  }

  const fator = fontScale / 100;
  const elementos = document.querySelectorAll('body, body *');
  _guardarTamanhosOriginais(elementos);
  _aplicarEscalaGuardada(elementos, fator);
}

// Cobre elementos inseridos DEPOIS (conteúdo carregado via fetch/AJAX,
// componentes que renderizam tarde, modais abertos dinamicamente, etc.)
const _fontObserver = new MutationObserver((mutations) => {
  if (_fontScaleAtual === 100) return;
  const fator = _fontScaleAtual / 100;
  for (const m of mutations) {
    m.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      const elementos = [node, ...node.querySelectorAll('*')];
      _guardarTamanhosOriginais(elementos);
      _aplicarEscalaGuardada(elementos, fator);
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  _fontObserver.observe(document.body, { childList: true, subtree: true });
});

// ─── APLICAR PREFERÊNCIAS ─────────────────────────────────────────────────

function aplicarPreferenciasSalvas() {
  const theme = localStorage.getItem('theme');
  const contrast = localStorage.getItem('contrast');
  const fontScale = parseInt(localStorage.getItem('fontScale')) || 100;
  const contrastLevel = parseInt(localStorage.getItem('contrastLevel')) || 100;
  const lineHeight = parseInt(localStorage.getItem('lineHeight')) || 15;
  const reduceMotion = localStorage.getItem('reduceMotion');
  const cursorLarge = localStorage.getItem('cursorLarge');
  const underlineLinks = localStorage.getItem('underlineLinks');
  const readableFont = localStorage.getItem('readableFont');
  const readingGuide = localStorage.getItem('readingGuide');
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
  html.classList.toggle('underline-links', underlineLinks === 'true');
  html.classList.toggle('readable-font', readableFont === 'true');
  html.classList.toggle('reading-guide-on', readingGuide === 'true');

  // ── Escala de fonte (agora via estilo inline, ver função acima) ───────
  aplicarEscalaFonte(fontScale);

  // ── CSS injetado (tudo que NÃO é font-size continua igual) ────────────
  const styleId = 'accessibility-styles';
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  let css = '';

  css += `
  *, *::before, *::after {
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }
`;

  // Ajustes de layout em fontes grandes (evita quebra/overflow no menu) —
  // continuam como estavam, isso é layout, não é a escala de fonte em si.
  if (fontScale >= 120) {
    css += `
    .top-bar { height: auto !important; min-height: 10px !important; padding: 10px 0 !important; }
    .menu-links { gap: 110px !important; margin-left: 110px !important; }
    .search-box1 { width: 260px !important; }
    #profileBtn {
      width: auto !important;
      min-width: 150px !important;
      padding: 12px 22px !important;
      height: 50px !important;
    }
    #profileBtn span { display: inline !important; }
    .menu-right { gap: 50px !important; margin-left: 120px !important; }
    .sub-menu { padding: 20px 0 !important; }
    .sub-menu nav { gap: 30px !important; padding: 0 40px !important; flex-wrap: wrap !important; margin-top: 15px !important; }
    .sub-menu a { min-width: 180px !important; padding: 14px 24px !important; height: auto !important; }
  `;
  }
  if (fontScale >= 130) {
    css += `
    .menu-links { display: none !important; }
    .category-toggle { display: block !important; }
    .search-box1 { display: none !important; }
    .sub-menu { display: none !important; }
  `;
  }

  // ── Modos de contraste ────────────────────────────────────────────────
  if (contrast === 'Alto contraste') {
    

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
        gap: 10px !important;
      }
      .welcome-container, .stats-container, .learning-extra-container,
      .extra-card, .collab-box, .learning-item, .main-config-card,
      .material-card, .forum-item, .audiodescricao-item, .projeto-card,
      .user-card, .stat-card, .card, .container, .containercust, .post-card {
        background-color: #b8b4b4 !important;
        border-color: #000000 !important;
      }
    `;
  } else if (contrast === 'Preto e branco') {
    

    css += `
      html { filter: grayscale(100%) contrast(${Math.max(contrastLevel, 110)}%) !important; }
    `;
  } else {
    

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
  p, .control-info p, .config-header p, .title-text p, .welcome-description,
  .learning-subtitle, .stat-value, .extra-card p, .collab-box p {
    color: rgb(${Math.round(102 - 60 * fator)}, ${Math.round(102 - 60 * fator)}, ${Math.round(102 - 60 * fator)}) !important;
  }
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
    'reduceMotion', 'cursorLarge', 'audioSpeed',
    'underlineLinks', 'readableFont', 'readingGuide'
  ];
  if (chavesMonitoradas.includes(e.key)) {
    aplicarPreferenciasSalvas();
    if (typeof sincronizarBotoesAtivos === 'function') sincronizarBotoesAtivos();
  }
});