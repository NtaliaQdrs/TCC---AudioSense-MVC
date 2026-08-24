/**
 * Script de funcionalidades da página de perfil
 * Gerencia abas de conteúdo, upload de avatar e interações
 */

document.addEventListener("DOMContentLoaded", function () {
  // ============================================
  // GERENCIAMENTO DE ABAS
  // ============================================

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");

      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });

      tabContents.forEach((content) => {
        content.classList.remove("active");
        content.setAttribute("hidden", "");
      });

      this.classList.add("active");
      this.setAttribute("aria-selected", "true");

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
      let targetButton = null;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        targetButton =
          tabButtons[index - 1] || tabButtons[tabButtons.length - 1];
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        targetButton = tabButtons[index + 1] || tabButtons[0];
      }

      if (targetButton) {
        targetButton.focus();
        targetButton.click();
      }
    });
  });


  // ============================================
  // MODAL DE EDIÇÃO DE PERFIL
  // ============================================

  let ultimoFocoModalEditar = null;

  function abrirModalEditar() {
    ultimoFocoModalEditar = document.activeElement;
    document.getElementById("modalEditar").style.display = "flex";
    document.getElementById("novo_nome_usuario")?.focus();
    document.addEventListener("keydown", fecharModalEditarComEsc);
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
    document.getElementById("modalEditar").style.display = "none";
    document.removeEventListener("keydown", fecharModalEditarComEsc);
    if (ultimoFocoModalEditar) {
      ultimoFocoModalEditar.focus();
      ultimoFocoModalEditar = null;
    }
  };

  function fecharModalEditarComEsc(e) {
    if (e.key === "Escape") fecharModalEditar();
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
        document.getElementById("previewAvatar").src = event.target.result;
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