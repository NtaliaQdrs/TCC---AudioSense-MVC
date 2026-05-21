
// Função para mostrar/esconder senha
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.target;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}

document.getElementById("btn-cancel").addEventListener("click", function () {
    window.history.back();
});

