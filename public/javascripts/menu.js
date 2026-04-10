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
    const welcomeAuthBtn = document.getElementById('welcomeAuthBtn');

    // =============================
    // MENU PERFIL (Click e Teclado)
    // =============================
    if (profileBtn && profileDropdown) {
        
        // Abre/Fecha ao clicar
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            profileDropdown.classList.toggle('show');
        });

        // Fecha ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-menu')) {
                profileDropdown.classList.remove('show');
            }
        });

        // Acessibilidade: Fecha com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                profileDropdown.classList.remove('show');
                profileBtn.focus(); // Devolve o foco para o botão
            }
        });
    }

    // =============================
    // LOGOUT
    // =============================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Tem certeza que deseja sair da sua conta?")) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = '/'; // No Express usa-se a rota, não o arquivo .html
            }
        });
    }

    // =============================
    // GESTÃO DE ESTADO DO USUÁRIO
    // =============================
    function atualizarInterfaceUsuario() {
        const token = localStorage.getItem('token');
        const usuarioJson = localStorage.getItem('usuario');
        
        // 1. Verifica se está logado para exibir/esconder botões de login
        if (token) {
            if (welcomeAuthBtn) welcomeAuthBtn.style.display = 'none';
        } else {
            if (welcomeAuthBtn) welcomeAuthBtn.style.display = 'inline-block';
            return; // Se não está logado, para aqui
        }

        // 2. Lógica de tipos de usuário e permissões
        if (usuarioJson) {
            const usuario = JSON.parse(usuarioJson);
            const tipo = usuario?.tipo_usuario;

            // Exibe opções baseado no tipo
            if (tipo === 'docente') {
                if (meusMateriais) meusMateriais.style.display = 'flex';
                //if (adminPanel) adminPanel.style.display = 'flex';
                if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'none';
            } else if (tipo === 'discente') {
                if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'flex';
                if (meusMateriais) meusMateriais.style.display = 'none';
                //if (adminPanel) adminPanel.style.display = 'none';
            }
        }
    }

    // Executa a verificação ao carregar a página
    atualizarInterfaceUsuario();
});