function aplicarPreferenciasSalvas() {
  const fontSize = localStorage.getItem('fontSize');
  const contrast = localStorage.getItem('contrast');
  const theme    = localStorage.getItem('theme');
  const html     = document.documentElement;

  // 1. Aplicar classes ao HTML
  if (fontSize) {
    html.classList.remove('font-small', 'font-medium', 'font-large');
    if (fontSize === 'Pequeno') html.classList.add('font-small');
    else if (fontSize === 'Médio')  html.classList.add('font-medium');
    else if (fontSize === 'Grande') html.classList.add('font-large');
  }

  if (contrast) {
    html.classList.remove('high-contrast', 'black-white');
    if (contrast === 'Alto contraste')      html.classList.add('high-contrast');
    else if (contrast === 'Preto e branco') html.classList.add('black-white');
  }

  if (theme) {
    html.classList.remove('dark-theme', 'light-theme');
    if (theme === 'Escuro') html.classList.add('dark-theme');
    else if (theme === 'Claro') html.classList.add('light-theme');
  }

  // 2. Forçar estilos específicos
  const styleId = 'accessibility-styles';
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  let css = '';

  // Tamanho de fonte
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

  // Alto contraste
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
      .top-bar, .footer, .welcome-container, .main-config-card { border: 2px solid #000 !important; }
    `;
  }

  styleTag.innerHTML = css;

  // 3. Forçar background do body
  const body = document.body;
  if (html.classList.contains('dark-theme')) {
    body.style.backgroundColor = '#1e1e2e';
  } else if (html.classList.contains('black-white')) {
    body.style.backgroundColor = '#E9CCEF';
  } else {
    body.style.backgroundColor = '#E9CCEF';
  }
}

function anunciarTituloDaPagina() {
  const tituloPrincipal = document.querySelector('h1, h2');
  if (tituloPrincipal) {
    if (!tituloPrincipal.hasAttribute('tabindex')) {
      tituloPrincipal.setAttribute('tabindex', '-1');
    }
    setTimeout(() => tituloPrincipal.focus(), 100);
  }
}

aplicarPreferenciasSalvas();

document.addEventListener('DOMContentLoaded', () => {
  anunciarTituloDaPagina();
  aplicarPreferenciasSalvas();
});

window.addEventListener('storage', (e) => {
  if (['fontSize', 'contrast', 'theme'].includes(e.key)) {
    aplicarPreferenciasSalvas();
  }
});