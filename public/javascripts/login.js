
// Função para mostrar/esconder senha
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input || !button) return;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        button.setAttribute('aria-label', inputId === 'confirmSenha' ? 'Ocultar confirmação de senha' : 'Ocultar senha');
        icon?.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        input.type = 'password';
        button.setAttribute('aria-label', inputId === 'confirmSenha' ? 'Mostrar confirmação de senha' : 'Mostrar senha');
        icon?.classList.replace('bi-eye-slash', 'bi-eye');
    }
}

document.getElementById("btn-cancel").addEventListener("click", function () {
    window.history.back();
});
