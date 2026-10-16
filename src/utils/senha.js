export const SENHA_MIN = 8;

// Devolve o texto do erro, ou null se a senha é aceitável
export const validarSenhaNova = (senha) => {
  if (typeof senha !== 'string' || senha.length < SENHA_MIN) {
    return `A senha precisa ter no mínimo ${SENHA_MIN} caracteres.`;
  }
  return null;
};