(() => {
  const root = document.documentElement;
  const theme = localStorage.getItem('theme');
  const contrast = localStorage.getItem('contrast');

  root.classList.remove('dark-theme', 'light-theme', 'high-contrast', 'high-contrast-dark', 'black-white');

  if (contrast === 'Alto contraste escuro') {
    root.classList.add('dark-theme', 'high-contrast', 'high-contrast-dark');
  } else if (contrast === 'Alto contraste') {
    root.classList.add('light-theme', 'high-contrast');
  } else {
    const dark = theme === 'Escuro' ||
      ((!theme || theme === 'Sistema') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.add(dark ? 'dark-theme' : 'light-theme');
    if (contrast === 'Preto e branco') root.classList.add('black-white');
  }
})();
