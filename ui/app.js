const menuButton = document.querySelector('.menu');
const mobileNav = document.querySelector('.mobile-nav');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '✕' : '☰';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = '☰';
    });
  });
}

const searchButton = document.querySelector('.search');
if (searchButton) {
  let searchPanel;
  const closeSearch = () => {
    if (searchPanel) searchPanel.remove();
    searchPanel = null;
    searchButton.setAttribute('aria-expanded', 'false');
  };

  searchButton.addEventListener('click', () => {
    if (searchPanel) {
      closeSearch();
      return;
    }

    searchPanel = document.createElement('form');
    searchPanel.className = 'site-search';
    searchPanel.setAttribute('role', 'search');
    searchPanel.innerHTML = '<label for="site-search-input">Search AIOU Coaching</label><div class="site-search-row"><input id="site-search-input" type="search" placeholder="Search tools, assignments, guides…" autocomplete="off"><button type="submit">Search</button><button type="button" class="search-close" aria-label="Close search">×</button></div><p class="search-status" aria-live="polite"></p>';
    document.querySelector('header').appendChild(searchPanel);
    searchButton.setAttribute('aria-expanded', 'true');

    const input = searchPanel.querySelector('input');
    const status = searchPanel.querySelector('.search-status');
    input.focus();

    searchPanel.querySelector('.search-close').addEventListener('click', closeSearch);
    searchPanel.addEventListener('submit', event => {
      event.preventDefault();
      const query = input.value.trim().toLocaleLowerCase();
      if (!query) {
        status.textContent = 'Enter a word or topic to search.';
        input.focus();
        return;
      }
      const candidates = [...document.querySelectorAll('main section, main article, main details')];
      const matches = candidates.filter(el => el.textContent.toLocaleLowerCase().includes(query));
      if (!matches.length) {
        status.textContent = 'No matching content found. Try a shorter keyword.';
        return;
      }
      status.textContent = matches.length + ' matching section(s) found.';
      matches[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
      matches[0].classList.add('search-match');
      window.setTimeout(() => matches[0].classList.remove('search-match'), 1800);
    });

    searchPanel.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeSearch();
    });
  });
}
