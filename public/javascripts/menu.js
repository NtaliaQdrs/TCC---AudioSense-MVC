document.addEventListener('DOMContentLoaded', () => {

    // =============================
    // ELEMENTOS
    // =============================
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const minhasAudiodescricoes = document.getElementById('minhasAudiodescricoes');
    const meusMateriais = document.getElementById('meusMateriais');
    const adminPainel = document.getElementById('adminPainel');
    const welcomeAuthBtn = document.getElementById('welcomeAuthBtn');

    const categoryToggle = document.getElementById('categoryToggle');
    const categoryDropdown = document.getElementById('categoryDropdown');

    // =============================
    // MENU PERFIL
    // =============================
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Evita que o clique no botão feche o menu imediatamente pelo evento global
            profileDropdown.classList.toggle('show');
        });
    }

    // =============================
    // MENU CATEGORIAS
    // =============================
    if (categoryToggle && categoryDropdown) {
        categoryToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            categoryDropdown.classList.toggle('active');

            const icon = categoryToggle.querySelector('i');
            if (icon) {
                if (categoryDropdown.classList.contains('active')) {
                    icon.classList.replace('bi-grid-3x3-gap-fill', 'bi-x');
                } else {
                    icon.classList.replace('bi-x', 'bi-grid-3x3-gap-fill');
                }
            }
        });
    }

    // =============================
    // FECHAR MENUS AO CLICAR FORA OU ESC
    // =============================
    document.addEventListener('click', (e) => {
        // Fecha Perfil
        if (profileDropdown && !e.target.closest('.profile-menu')) {
            profileDropdown.classList.remove('show');
        }

        // Fecha Categorias
        if (categoryDropdown && !categoryDropdown.contains(e.target) && !categoryToggle.contains(e.target)) {
            categoryDropdown.classList.remove('active');
            const icon = categoryToggle?.querySelector('i');
            if (icon) icon.classList.replace('bi-x', 'bi-grid-3x3-gap-fill');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            profileDropdown?.classList.remove('show');
            categoryDropdown?.classList.remove('active');
            // Opcional: voltar o ícone das categorias ao normal
            const icon = categoryToggle?.querySelector('i');
            if (icon) icon.classList.replace('bi-x', 'bi-grid-3x3-gap-fill');
        }
    });

    // =============================
    // LOGOUT
    // =============================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Tem certeza que deseja sair da sua conta?")) {
                localStorage.clear(); // Limpa tudo de uma vez
                window.location.href = '/';
            }
        });
    }

    // =============================
    // GESTÃO DE ESTADO DO USUÁRIO
    // =============================
    function atualizarInterfaceUsuario() {
        const token = localStorage.getItem('token');
        const usuarioJson = localStorage.getItem('usuario');

        /* if (!token) {
            if (welcomeAuthBtn) welcomeAuthBtn.style.display = 'inline-block';
            // Esconde o botão de perfil se não estiver logado
            if (profileBtn) profileBtn.style.display = 'none';
            return;
        }*/

        // if (welcomeAuthBtn) welcomeAuthBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'flex';

        if (usuarioJson) {
            try {
                const usuario = JSON.parse(usuarioJson);
                const tipo = usuario?.tipo_usuario;

                if (tipo === 'docente') {
                    if (meusMateriais) meusMateriais.style.display = 'flex';
                    if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'none';
                } else if (tipo === 'discente') {
                    if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'flex';
                    if (meusMateriais) meusMateriais.style.display = 'none';
                }
            } catch (err) {
                console.error("Erro ao processar dados do usuário", err);
            }
        }
    }

    function destacarLinkAtivo() {
        const todosOsLinks = document.querySelectorAll('.sub-menu a, .menu-links a');
        const currentUrl = window.location.href.replace(/\/$/, "");

        todosOsLinks.forEach(link => {
            const linkHref = link.href.replace(/\/$/, "");

            if (linkHref === currentUrl) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Chama diretamente, pois já estamos dentro do DOMContentLoaded
    atualizarInterfaceUsuario();
    destacarLinkAtivo();
});

    


