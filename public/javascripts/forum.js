document.addEventListener('DOMContentLoaded', () => {
  const btnGrid = document.getElementById('btn-grid');
  const btnList = document.getElementById('btn-list');
  const posts   = document.querySelector('.forum-posts');


  btnGrid.classList.add('active');

  btnGrid.addEventListener('click', () => {
    posts.classList.remove('list-view');
    btnGrid.classList.add('active');
    btnList.classList.remove('active');
  });

  btnList.addEventListener('click', () => {
    posts.classList.add('list-view');
    btnList.classList.add('active');
    btnGrid.classList.remove('active');
  });

 

});