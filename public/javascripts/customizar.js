// Preview da foto antes de salvar
document.getElementById('foto-upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById('preview').src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

});

document.getElementById("btn-cancel").addEventListener("click", function () {
    window.history.back();
});

