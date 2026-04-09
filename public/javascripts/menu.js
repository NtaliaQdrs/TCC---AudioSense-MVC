document.addEventListener('DOMContentLoaded', () => {

    // =============================
    // ELEMENTOS DO MENU DE PERFIL
    // =============================

    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const minhasAudiodescricoes = document.getElementById('minhasAudiodescricoes');
    const meusMateriais = document.getElementById('meusMateriais');
    const adminPanel = document.getElementById('adminPainel');

    // =============================
    // MENU PERFIL
    // =============================

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', () => {
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-menu')) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    // =============================
    // LOGOUT
    // =============================

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const confirmar = confirm("Tem certeza que deseja sair da sua conta?");

            if (confirmar) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = 'index.html';
            }
        });
    }


    // =============================
    // VERIFICAR TIPO DE USUÁRIO
    // =============================

    function verificarTipoUsuario() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const tipoUsuario = usuario?.tipo_usuario;

        if (!tipoUsuario) return;

        if (tipoUsuario === 'docente') {
            if (meusMateriais) meusMateriais.style.display = 'flex';
            if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'none';
        } else if (tipoUsuario === 'discente') {
            if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'flex';
            if (meusMateriais) meusMateriais.style.display = 'none';
        }
    }

    // =============================
    // VERIFICAR PERMISSÕES
    // =============================

    function verificarPermissoes() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const tipoUsuario = usuario?.tipo_usuario;

        if (!adminPanel) return;

        if (tipoUsuario === 'docente') {
            adminPanel.style.display = 'flex';
        } else {
            adminPanel.style.display = 'none';
        }
    }




    


    //Some o botão de login e cadastro se o usuário já estiver logado
    const welcomeAuthBtn = document.getElementById('welcomeAuthBtn');

    function verificarLogin() {
        const token = localStorage.getItem('token');

        if (token) {
            if (welcomeAuthBtn) welcomeAuthBtn.style.display = 'none';
        } else {
            if (welcomeAuthBtn) welcomeAuthBtn.style.display = 'inline-block';
        }
    }


    // =============================
    // EXECUTAR AO CARREGAR
    // =============================

    verificarTipoUsuario();
    verificarPermissoes();
    verificarLogin();


});
