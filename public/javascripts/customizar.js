// Preview da foto antes de salvar
document.getElementById('foto-upload').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const preview = document.getElementById('preview');
      preview.src = event.target.result;
      preview.alt = `Prévia da foto de perfil selecionada: ${file.name}`;
    };
    reader.readAsDataURL(file);
    document.getElementById('foto-upload-status').textContent = `Foto selecionada: ${file.name}`;
  } else {
    document.getElementById('foto-upload-status').textContent = 'Nenhuma foto selecionada.';
  }

});

document.getElementById("btn-cancel").addEventListener("click", function () {
    window.history.back();
});
