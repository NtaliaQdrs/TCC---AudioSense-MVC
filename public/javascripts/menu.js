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
    // ABAS NO DROPDOWN
    // =============================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            tabBtns.forEach(b => {
                b.classList.remove('tab-active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanes.forEach(pane => {
                pane.classList.remove('tab-pane-active');
                pane.setAttribute('hidden', '');
            });

            btn.classList.add('tab-active');
            btn.setAttribute('aria-selected', 'true');

            const pane = document.getElementById(tabName + '-tab');
            if (pane) {
                pane.classList.add('tab-pane-active');
                pane.removeAttribute('hidden');
            }
        });
    });

    // =============================
    // MENU PERFIL
    // =============================
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const aberto = profileDropdown.classList.toggle('show');
            profileBtn.setAttribute('aria-expanded', aberto);
        });
    }

    // =============================
    // MENU CATEGORIAS
    // =============================
    if (categoryToggle && categoryDropdown) {
        categoryToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const aberto = categoryDropdown.classList.toggle('active');
            categoryToggle.setAttribute('aria-expanded', aberto);

            const icon = categoryToggle.querySelector('i');
            if (icon) {
                if (aberto) {
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
        if (profileDropdown && !e.target.closest('.profile-menu')) {
            profileDropdown.classList.remove('show');
            profileBtn?.setAttribute('aria-expanded', 'false');
        }

        if (categoryDropdown && !categoryDropdown.contains(e.target) && !categoryToggle.contains(e.target)) {
            categoryDropdown.classList.remove('active');
            categoryToggle?.setAttribute('aria-expanded', 'false');
            const icon = categoryToggle?.querySelector('i');
            if (icon) icon.classList.replace('bi-x', 'bi-grid-3x3-gap-fill');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const perfilAberto = profileDropdown?.classList.contains('show');
            const categoriasAberto = categoryDropdown?.classList.contains('active');

            profileDropdown?.classList.remove('show');
            profileBtn?.setAttribute('aria-expanded', 'false');

            categoryDropdown?.classList.remove('active');
            categoryToggle?.setAttribute('aria-expanded', 'false');
            const icon = categoryToggle?.querySelector('i');
            if (icon) icon.classList.replace('bi-x', 'bi-grid-3x3-gap-fill');

            // Devolve o foco pro botão que estava aberto
            if (perfilAberto) profileBtn?.focus();
            else if (categoriasAberto) categoryToggle?.focus();
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
        if (minhasAudiodescricoes) minhasAudiodescricoes.style.display = 'none';
        if (meusMateriais) meusMateriais.style.display = 'none';
        if (adminPainel) adminPainel.style.display = 'none';

        if (!usuarioLogado) return;

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
                link.removeAttribute('aria-current');
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

            const tab = document.getElementById('notifications-tab');
            if (!tab) return;

            if (notificacoes.length === 0) {
                tab.innerHTML = '<p style="padding: 15px; color: #666; font-size: 14px;">Nenhuma notificação.</p>';
                return;
            }

            const itens = notificacoes.map(n => `
            <a class="dropdown-item nao-lida" href="${n.link || '#'}" data-notif-id="${n.id}">
                <div class="notif-content">
                <p class="notif-title">${n.titulo}</p>
                <p class="notif-desc">${n.mensagem}</p>
                <p class="notif-time">${new Date(n.data_criacao).toLocaleDateString('pt-BR')}</p>
                </div>
            </a>
            `).join('');

            tab.innerHTML = itens + `
            <hr class="dropdown-divider">
            <button type="button" class="dropdown-item" onclick="marcarTodasLidas()" style="text-align: center; font-size: 12px; width: 100%; background: none; border: none; cursor: pointer;">
                Marcar todas como lidas
            </button>
            `;

        } catch (err) {
            console.error('Erro ao carregar notificações:', err);
        }
    }

    window.marcarTodasLidas = async function () {
        await fetch('/notificacoes/marcar-lidas', { method: 'POST' });
        carregarNotificacoes();
    };

    if (profileBtn) {
        profileBtn.addEventListener('click', carregarNotificacoes);
    }
    if (usuarioLogado) {
        carregarNotificacoes();
    }
    atualizarInterfaceUsuario();
    destacarLinkAtivo();

});
// Marca uma notificação como lida ao clicar nela (antes de navegar)
document.getElementById('notifications-tab')?.addEventListener('click', (e) => {
    const item = e.target.closest('[data-notif-id]');
    if (!item) return;
    const id = item.dataset.notifId;
    fetch(`/notificacoes/${id}/marcar-lida`, { method: 'POST', keepalive: true });
});
