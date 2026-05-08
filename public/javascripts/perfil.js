/**
 * Script de funcionalidades da página de perfil
 * Gerencia abas de conteúdo, upload de avatar e interações
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // GERENCIAMENTO DE ABAS
  // ============================================

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');

      // Remove classe active de todos os botões e conteúdos
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });

      tabContents.forEach(content => {
        content.classList.remove('active');
      });

      // Adiciona classe active ao botão e conteúdo clicado
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      const activeContent = document.getElementById(`tab-${tabName}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }

      // Log para fins de debug
      console.log(`Aba ativada: ${tabName}`);
    });
  });

  // ============================================
  // NAVEGAÇÃO POR TECLADO NAS ABAS
  // ============================================

  tabButtons.forEach((button, index) => {
    button.addEventListener('keydown', function(e) {
      let targetButton = null;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        targetButton = tabButtons[index - 1] || tabButtons[tabButtons.length - 1];
      } else if (e.key === 'ArrowRight') {
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
  // BOTÃO EDITAR PERFIL
  // ============================================

  const btnEditarPerfil = document.querySelector('.btn-editar-perfil');
  if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener('click', function() {
      console.log('Redirecionando para edição de perfil...');
      window.location.href = '/login/customizar';
    });
  }

  // ============================================
  // UPLOAD DE AVATAR
  // ============================================

  const avatarUploadBtn = document.querySelector('.avatar-upload-btn');
  if (avatarUploadBtn) {
    avatarUploadBtn.addEventListener('click', function() {
      console.log('Abrindo seletor de arquivo para avatar...');
      // Criar input file invisível
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          // Validar tipo de arquivo
          if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida.');
            return;
          }

          // Validar tamanho (máximo 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
          }

          // Criar preview da imagem
          const reader = new FileReader();
          reader.onload = function(event) {
            const avatarImg = document.querySelector('.perfil-avatar img');
            if (avatarImg) {
              avatarImg.src = event.target.result;
              console.log('Avatar atualizado com sucesso');
            }
          };
          reader.readAsDataURL(file);
        }
      });

      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
    });
  }

  // ============================================
  // BOTÕES DE AÇÃO (VER, DOWNLOAD)
  // ============================================

  const btnVer = document.querySelectorAll('.btn-ver');
  btnVer.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const title = this.closest('.audiodescricao-item').querySelector('.item-title').textContent;
      console.log(`Visualizando: ${title}`);
      // Implementar lógica de visualização
    });
  });

  const btnDownload = document.querySelectorAll('.btn-download');
  btnDownload.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const title = this.closest('.material-item').querySelector('.material-title').textContent;
      console.log(`Baixando: ${title}`);
      // Implementar lógica de download
    });
  });

  // ============================================
  // ITENS DO FÓRUM - NAVEGAÇÃO
  // ============================================

  const forumItems = document.querySelectorAll('.forum-item');
  forumItems.forEach(item => {
    item.addEventListener('click', function() {
      const title = this.querySelector('.forum-title').textContent;
      console.log(`Abrindo discussão: ${title}`);
      // Redirecionar para página da discussão
    });
  });

  // ============================================
  // LINK "VER TODAS"
  // ============================================

  const viewAllLinks = document.querySelectorAll('.view-all-link a');
  viewAllLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const tabActive = document.querySelector('.tab-btn.active');
      const tabName = tabActive.getAttribute('data-tab');
      console.log(`Visualizando todos os itens de: ${tabName}`);
      // Implementar navegação para página completa
    });
  });

  // ============================================
  // ACESSIBILIDADE - FOCUS MANAGEMENT
  // ============================================

  // Adicionar suporte a focus visível
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
  });

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  console.log('Página de perfil carregada com sucesso');
});
