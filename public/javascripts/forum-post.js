document.addEventListener('DOMContentLoaded', () => {
  const LIMITE_CARACTERES = 280;
  const campo = document.getElementById('corpo');
  const contador = document.getElementById('contador-corpo');

  if (!campo || !contador) return;

  function atualizarContador(limitarEntrada = false) {
    const caracteres = Array.from(campo.value);
    if (limitarEntrada && caracteres.length > LIMITE_CARACTERES) {
      campo.value = caracteres.slice(0, LIMITE_CARACTERES).join('');
    }

    const total = Array.from(campo.value).length;
    contador.textContent = `${total}/${LIMITE_CARACTERES} caracteres`;
    contador.classList.toggle('limite-excedido', total > LIMITE_CARACTERES);
  }

  campo.addEventListener('input', () => atualizarContador(true));
  atualizarContador();
});
