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
        // Fecha Perfil — mas não bloqueia cliques em links dentro do dropdown
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
    // Esconde tudo por padrão
    if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'none';
    if (meusMateriais) meusMateriais.style.display = 'none';
    if (adminPainel) adminPainel.style.display = 'none'; // ← adiciona isso

    if (!usuarioLogado) return; // se não logado, para aqui

    const tipo = usuarioLogado.tipo_usuario;
    const isAdmin = usuarioLogado.is_admin;

    if (tipo === 'docente') {
        if (meusMateriais) meusMateriais.style.display = 'flex';
        if (adminPainel) {
            adminPainel.style.display = 'flex';
            adminPainel.href = isAdmin ? '/painelAdmin1/painel-admin' : '/painelAdmin1';
        }
    } else if (tipo === 'discente') {
        if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'flex';
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

    // =============================
    // NOTIFICAÇÕES
    // =============================

    async function carregarNotificacoes() {
        try {
            const res = await fetch('/notificacoes');
            if (!res.ok) return;

            const data = await res.json();
            const { notificacoes, naoLidas } = data;

            // Atualiza os badges
            const badgeSino = document.getElementById('badge-notificacoes');
            const badgePerfil = document.getElementById('badge-perfil');

            if (badgeSino) {
                badgeSino.textContent = naoLidas;
                badgeSino.style.display = naoLidas > 0 ? 'inline' : 'none';
            }
            if (badgePerfil) {
                badgePerfil.textContent = naoLidas;
                badgePerfil.style.display = naoLidas > 0 ? 'inline' : 'none';
            }

            // Preenche a lista de notificações
            const tab = document.getElementById('notifications-tab');
            if (!tab) return;

            if (notificacoes.length === 0) {
                tab.innerHTML = '<p style="padding: 15px; color: #666; font-size: 14px;">Nenhuma notificação.</p>';
                return;
            }

            const itens = notificacoes.map(n => `
                <a class="dropdown-item nao-lida" href="${n.link || '#'}" role="menuitem">
                    <div class="notif-content">
                    <p class="notif-title">${n.titulo}</p>
                    <p class="notif-desc">${n.mensagem}</p>
                    <p class="notif-time">${new Date(n.data_criacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                </a>
                `).join('');

            tab.innerHTML = itens + `
            <hr class="dropdown-divider">
            <a class="dropdown-item" href="#" onclick="marcarTodasLidas()" style="text-align: center; font-size: 12px;">
                Marcar todas como lidas
            </a>
            `;

        } catch (err) {
            console.error('Erro ao carregar notificações:', err);
        }
    }

    window.marcarTodasLidas = async function () {
        await fetch('/notificacoes/marcar-lidas', { method: 'POST' });
        carregarNotificacoes();
    };

    // Carrega ao abrir o dropdown também
    if (profileBtn) {
        profileBtn.addEventListener('click', carregarNotificacoes);
    }
    // Chama diretamente, pois já estamos dentro do DOMContentLoaded
    if (usuarioLogado) {
        carregarNotificacoes();
    }
    atualizarInterfaceUsuario();
    destacarLinkAtivo();
});