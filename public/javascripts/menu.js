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
    // ABAS NO DROPDOWN (NOVO)
    // =============================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            // Remove ativa de todos
            tabBtns.forEach(b => {
                b.classList.remove('tab-active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanes.forEach(pane => {
                pane.classList.remove('tab-pane-active');
            });

            // Ativa o clicado
            btn.classList.add('tab-active');
            btn.setAttribute('aria-selected', 'true');

            const pane = document.getElementById(tabName + '-tab');
            if (pane) {
                pane.classList.add('tab-pane-active');
            }
        });
    });

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


    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Tem certeza que deseja sair da sua conta?")) {
                window.location.href = '/usuario/logout';
            }
        });
    }
    // =============================
    // GESTÃO DE ESTADO DO USUÁRIO
    // =============================
    function atualizarInterfaceUsuario() {
        if (!usuarioLogado) return;

        const tipo = usuarioLogado.tipo_usuario;
        const isAdmin = usuarioLogado.is_admin;

        if (tipo === 'docente') {
            if (meusMateriais) meusMateriais.style.display = 'flex';
            if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'none';
            if (adminPainel) {
                adminPainel.style.display = 'flex';
                adminPainel.href = isAdmin ? '/painelAdmin1/painel-admin' : '/painelAdmin1';
            }
        } else if (tipo === 'discente') {
            if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'flex';
            if (meusMateriais) meusMateriais.style.display = 'none';
            if (adminPainel) adminPainel.style.display = 'none';
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