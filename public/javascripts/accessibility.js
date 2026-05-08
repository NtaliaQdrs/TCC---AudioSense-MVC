

function anunciarTituloDaPagina() {
  // Encontra o primeiro h1 ou h2 da página
  const tituloPrincipal = document.querySelector('h1, h2');

  if (tituloPrincipal) {
    // Adiciona tabindex="-1" para permitir foco programático
    // sem entrar na ordem de tabulação normal
    if (!tituloPrincipal.hasAttribute('tabindex')) {
      tituloPrincipal.setAttribute('tabindex', '-1');
    }

    // Pequeno delay para garantir que o DOM está completamente pronto
    // Isso é importante para que o leitor de tela processe corretamente
    setTimeout(() => {
      tituloPrincipal.focus();
    }, 100);
  }
}

document.addEventListener('DOMContentLoaded', anunciarTituloDaPagina);
window.addEventListener('pageshow', anunciarTituloDaPagina);
