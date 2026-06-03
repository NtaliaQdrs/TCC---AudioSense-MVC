function aplicarPreferenciasSalvas() {
  const fontSize = localStorage.getItem('fontSize');
  const contrast = localStorage.getItem('contrast');
  const theme = localStorage.getItem('theme');
  const html = document.documentElement;

  // 1. Aplicar classes ao HTML
  if (fontSize) {
    html.classList.remove('font-small', 'font-medium', 'font-large');
    if (fontSize === 'Pequeno') html.classList.add('font-small');
    else if (fontSize === 'Médio') html.classList.add('font-medium');
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

  // 2. Forçar estilos específicos para garantir que funcionem em todas as telas
  const styleId = 'accessibility-styles';
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  let css = '';

  // Forçar Tamanho de Fonte
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

  // Forçar Alto Contraste
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

function anunciarTituloDaPagina() {
  const tituloPrincipal = document.querySelector('h1, h2');
  if (tituloPrincipal) {
    if (!tituloPrincipal.hasAttribute('tabindex')) {
      tituloPrincipal.setAttribute('tabindex', '-1');
    }
    setTimeout(() => {
      tituloPrincipal.focus();
    }, 100);
  }
}

// Executa imediatamente
aplicarPreferenciasSalvas();

document.addEventListener('DOMContentLoaded', () => {
  anunciarTituloDaPagina();
  aplicarPreferenciasSalvas();
});

// Listener para mudanças no localStorage (caso mude em uma aba e queira refletir na outra)
window.addEventListener('storage', (e) => {
  if (['fontSize', 'contrast', 'theme'].includes(e.key)) {
    aplicarPreferenciasSalvas();
  }
});
