function reComputeTheme() {
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const theme = localStorage.theme || 'auto';
  document
    .querySelectorAll('.theme-button')
    .forEach((btn) => btn.classList.remove('active'));
  document
    .querySelectorAll(`[data-theme="${theme}"]`)
    .forEach((el) => el.classList.add('active'));
}

function addThemeEventListeners() {
  const themeButtons = document.querySelectorAll('.theme-button');
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      themeButtons.forEach((btn) => btn.classList.remove('active'));
      document.querySelectorAll(`[data-theme="${button.dataset.theme}"]`)
        .forEach((el) => el.classList.add('active'));

      if (button.dataset.theme === 'auto') {
        localStorage.removeItem('theme');
        reComputeTheme();
      } else {
        localStorage.theme = button.dataset.theme;
        document.documentElement.classList.toggle(
          'dark',
          button.dataset.theme === 'dark'
        );
      }
    });
  });
}

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => reComputeTheme());

window.matchMedia('(min-width: 768px)').addEventListener('change', () => {
  addThemeEventListeners();
  reComputeTheme();
});

reComputeTheme();

document.addEventListener('DOMContentLoaded', () => {
  addThemeEventListeners();
  reComputeTheme();

  const openBtn = document.getElementById('nav-open-btn');
  const closeBtn = document.getElementById('nav-close-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function toggleMobileMenu() {
    mobileMenu.classList.toggle('open');
  }

  openBtn?.addEventListener('click', toggleMobileMenu);
  closeBtn?.addEventListener('click', toggleMobileMenu);
});
