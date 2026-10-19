/**
 * Script de funcionalidades da página de perfil
 * Gerencia abas de conteúdo, upload de avatar e interações
 */

document.addEventListener("DOMContentLoaded", function () {
  // ============================================
  // GERENCIAMENTO DE ABAS
  // ============================================

  const perfilTabs = document.querySelector(".perfil-tabs");
  const tabButtons = perfilTabs?.querySelectorAll('[role="tab"]') || [];
  const tabContents = perfilTabs?.querySelectorAll('[role="tabpanel"]') || [];

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");

      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
        btn.tabIndex = -1;
      });

      tabContents.forEach((content) => {
        content.classList.remove("active");
        content.setAttribute("hidden", "");
      });

      this.classList.add("active");
      this.setAttribute("aria-selected", "true");
      this.tabIndex = 0;

      const activeContent = document.getElementById(`tab-${tabName}`);
      if (activeContent) {
        activeContent.classList.add("active");
        activeContent.removeAttribute("hidden");
      }

      console.log(`Aba ativada: ${tabName}`);
    });
  });

  // ============================================
  // NAVEGAÇÃO POR TECLADO NAS ABAS
  // ============================================

  tabButtons.forEach((button, index) => {
    button.addEventListener("keydown", function (e) {
      let targetIndex;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        targetIndex = (index + 1) % tabButtons.length;
      } else if (e.key === "Home") {
        targetIndex = 0;
      } else if (e.key === "End") {
        targetIndex = tabButtons.length - 1;
      }

      if (targetIndex !== undefined) {
        e.preventDefault();
        const targetButton = tabButtons[targetIndex];
        targetButton.focus();
        targetButton.click();
      }
    });
  });


  // ============================================
  // MODAL DE EDIÇÃO DE PERFIL
  // ============================================

  let ultimoFocoModalEditar = null;
  let elementosInertModalEditar = [];

  function abrirModalEditar() {
    const modal = document.getElementById("modalEditar");
    ultimoFocoModalEditar = document.activeElement;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    bloquearFundoModalEditar(modal);
    document.getElementById("novo_nome_usuario")?.focus();
    document.addEventListener("keydown", fecharModalEditarComEsc);
    document.addEventListener("keydown", prenderFocoModalEditar);
  }

  const btnEditarPerfil = document.querySelector(".btn-editar-perfil");
  if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener("click", abrirModalEditar);
  }
  const avatarUploadBtn = document.querySelector('.avatar-upload-btn');
  if (avatarUploadBtn) {
    avatarUploadBtn.addEventListener('click', function () {
      abrirModalEditar();
      setTimeout(() => document.getElementById('novaFoto').click(), 100);
    });
  }

  window.fecharModalEditar = function () {
    const modal = document.getElementById("modalEditar");
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    elementosInertModalEditar.forEach(el => el.removeAttribute("inert"));
    elementosInertModalEditar = [];
    document.removeEventListener("keydown", fecharModalEditarComEsc);
    document.removeEventListener("keydown", prenderFocoModalEditar);
    if (ultimoFocoModalEditar) {
      ultimoFocoModalEditar.focus();
      ultimoFocoModalEditar = null;
    }
  };

  function fecharModalEditarComEsc(e) {
    if (e.key === "Escape") fecharModalEditar();
  }

  function bloquearFundoModalEditar(modal) {
    elementosInertModalEditar = [];
    let node = modal;
    while (node && node !== document.body) {
      const parent = node.parentElement;
      if (parent) {
        Array.from(parent.children).forEach(irmao => {
          if (irmao === node || ['SCRIPT', 'STYLE', 'LINK'].includes(irmao.tagName) || irmao.hasAttribute('inert')) return;
          irmao.setAttribute('inert', '');
          elementosInertModalEditar.push(irmao);
        });
      }
      node = parent;
    }
  }

  function prenderFocoModalEditar(event) {
    if (event.key !== 'Tab') return;
    const modal = document.getElementById('modalEditar');
    const dialog = modal.querySelector('[role="dialog"]');
    const focaveis = Array.from(modal.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);
    if (!focaveis.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (event.shiftKey && (document.activeElement === primeiro || document.activeElement === dialog)) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && (document.activeElement === ultimo || !modal.contains(document.activeElement))) {
      event.preventDefault();
      primeiro.focus();
    }
  }

  // Fecha modal ao clicar fora
  document
    .getElementById("modalEditar")
    ?.addEventListener("click", function (e) {
      if (e.target === this) fecharModalEditar();
    });

  // Preview da nova foto
  document.getElementById("novaFoto")?.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const preview = document.getElementById("previewAvatar");
        preview.src = event.target.result;
        preview.alt = `Prévia da foto de perfil selecionada: ${file.name}`;
      };
      reader.readAsDataURL(file);
    }
  });

  // ============================================
  // BOTÕES DE AÇÃO (VER, DOWNLOAD)
  // ============================================

  const btnDownload = document.querySelectorAll(".btn-download");
  btnDownload.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const title =
        this.closest(".material-item").querySelector(
          ".material-title",
        ).textContent;
      console.log(`Baixando: ${title}`);
      // Implementar lógica de download
    });
  });

  // ============================================
  // ITENS DO FÓRUM - NAVEGAÇÃO
  // ============================================

  const forumItems = document.querySelectorAll(".forum-item");
  forumItems.forEach((item) => {
    item.addEventListener("click", function () {
      const title = this.querySelector(".forum-title").textContent;
      console.log(`Abrindo discussão: ${title}`);
    });
  });

  // ============================================
  // LINK "VER TODAS"
  // ============================================

  const viewAllLinks = document.querySelectorAll(".view-all-link a");
  viewAllLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Só bloqueia links sem destino real ainda (href="#")
      if (this.getAttribute("href") === "#") {
        e.preventDefault();
        const tabActive = document.querySelector(".tab-btn.active");
        const tabName = tabActive.getAttribute("data-tab");
        console.log(`Visualizando todos os itens de: ${tabName} (ainda não implementado)`);
      }
      // Os que já têm href real (/forum, /biblioteca) navegam normalmente
    });
  });

  // ============================================
  // ACESSIBILIDADE - FOCUS MANAGEMENT
  // ============================================

  document.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      document.body.classList.add("keyboard-nav");
    }
  });

  document.addEventListener("mousedown", function () {
    document.body.classList.remove("keyboard-nav");
  });

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  console.log("Página de perfil carregada com sucesso");
});