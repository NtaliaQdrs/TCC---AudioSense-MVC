document.addEventListener('DOMContentLoaded', () => {
 const btnInsert = document.querySelector('.recommend-btn')

 if (btnInsert) {
    btnInsert.addEventListener('click', () => {
      // Redireciona para página de inserção (a ser implementada)
      window.location.href = '/inserir-entretenimento';
      //alert('Funcionalidade de inserção em desenvolvimento!');
    });
  }
});
