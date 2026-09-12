document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const navbar = document.querySelector('.navbar');
  const cardsWrapper = document.querySelector('.cards-wrapper');
  const visitorCount = document.getElementById('visitor-count');
  const searchButton = document.querySelector('button[aria-label="Search"]');
  const collapseElement = document.getElementById('fineoNavbar');
  const revealCards = document.querySelectorAll('.hero-card-dark, .announcement-card-dark, .card-horizontal, .video-card, .comm-card');

  if (revealCards.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealCards.forEach(function (card, index) {
      card.classList.add('card-reveal');
      card.style.setProperty('--reveal-delay', `${(index % 4) * 90}ms`);
    });

    const cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, {
      threshold: 0.18,
      rootMargin: '-8% 0px -8% 0px'
    });

    revealCards.forEach(function (card) {
      cardObserver.observe(card);
    });
  }

  if (visitorCount) {
    const storedCount = Number.parseInt(localStorage.getItem('yayasanSabahVisitorCount'), 10);
    const nextCount = Number.isFinite(storedCount) ? storedCount + 1 : 124590;
    localStorage.setItem('yayasanSabahVisitorCount', nextCount.toString());
    visitorCount.textContent = nextCount.toLocaleString('en-US');
  }

  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  body.appendChild(progressBar);

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.title = 'Back to top';
  backToTop.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
  body.appendChild(backToTop);

  function updateScrollControls() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    progressBar.style.width = `${scrollPercent}%`;
    backToTop.classList.toggle('is-visible', window.scrollY > 500);
    if (navbar) {
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    }
  }

  window.addEventListener('scroll', updateScrollControls, { passive: true });
  updateScrollControls();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (collapseElement && collapseElement.classList.contains('show') && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(collapseElement).hide();
      }
    });
  });

  if (cardsWrapper) {
    cardsWrapper.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      const card = cardsWrapper.querySelector('.card-horizontal');
      if (!card) {
        return;
      }

      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      cardsWrapper.scrollBy({
        left: direction * (card.offsetWidth + 24),
        behavior: 'smooth'
      });
    });
  }

  if (searchButton) {
    const searchPanel = document.createElement('div');
    searchPanel.className = 'site-search-panel';
    searchPanel.innerHTML = `
      <div class="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
        <div class="d-flex align-items-center justify-content-between gap-3 mb-3">
          <h2 id="site-search-title" class="h5 mb-0">Search this site</h2>
          <button type="button" class="btn-close btn-close-white" aria-label="Close search"></button>
        </div>
        <label class="visually-hidden" for="site-search-input">Search this site</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent text-info border-secondary"><i class="bi bi-search" aria-hidden="true"></i></span>
          <input id="site-search-input" class="form-control bg-transparent text-white border-secondary" type="search" placeholder="Try services, announcements, maps..." autocomplete="off">
        </div>
        <div class="site-search-results mt-3" aria-live="polite"></div>
      </div>`;
    body.appendChild(searchPanel);

    const searchInput = searchPanel.querySelector('#site-search-input');
    const results = searchPanel.querySelector('.site-search-results');
    const closeButton = searchPanel.querySelector('.btn-close');
    const searchableSections = Array.from(document.querySelectorAll('main section[id]')).map(function (section) {
      const heading = section.querySelector('h1, h2, h3, h4');
      return {
        id: section.id,
        title: heading ? heading.textContent.trim() : section.id.replaceAll('-', ' ')
      };
    });

    function closeSearch() {
      searchPanel.classList.remove('is-open');
      searchInput.value = '';
      results.innerHTML = '';
    }

    function renderResults(query) {
      const matches = searchableSections.filter(function (section) {
        return `${section.title} ${section.id}`.toLowerCase().includes(query.toLowerCase());
      });

      if (!query) {
        results.innerHTML = '<p class="text-white-50 mb-0">Type to find a section.</p>';
        return;
      }

      results.innerHTML = matches.length
        ? matches.map(function (section) {
            return `<a class="site-search-result" href="#${section.id}"><span>${section.title}</span><i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>`;
          }).join('')
        : '<p class="text-white-50 mb-0">No matching sections found.</p>';
    }

    searchButton.addEventListener('click', function () {
      searchPanel.classList.add('is-open');
      searchInput.focus();
      renderResults('');
    });
    closeButton.addEventListener('click', closeSearch);
    searchPanel.addEventListener('click', function (event) {
      if (event.target === searchPanel) {
        closeSearch();
      }
    });
    searchInput.addEventListener('input', function () {
      renderResults(searchInput.value.trim());
    });
    searchPanel.addEventListener('click', function (event) {
      if (event.target.closest('.site-search-result')) {
        closeSearch();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeSearch();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchButton.click();
      }
    });
  }
});
