
(() => {
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  fetch('/site-content.json', { cache: 'no-cache' })
    .then((r) => r.ok ? r.json() : null)
    .then((data) => {
      if (!data) return;

      // Correctly identify the current page
      const path = location.pathname.replace(/\/+$/, '');
      const last = path.split('/').pop();

      const file = !last
        ? 'index.html'
        : last.includes('.')
          ? last
          : `${last}.html`;

      const page = data.pages?.[file];

      // Hide links to hidden pages
      if (page?.status === 'hidden') {
        document.querySelectorAll('a[href]').forEach((a) => {
          const target = (a.getAttribute('href') || '')
            .split('/')
            .pop();

          if (target === file) a.hidden = true;
        });
      }

      // Show coming soon page
      if (page?.status === 'coming-soon') {
        const main = document.querySelector('main');

        if (main) {
          main.innerHTML = `
            <section class="page-hero">
              <div class="container">
                <span class="eyebrow">Beyond the Beginning</span>
                <h1>Coming soon.</h1>
                <p class="lead">
                  We’re thoughtfully preparing this part of the site.
                  Please check back soon.
                </p>
                <a class="button button-primary" href="/index.html">
                  Return home
                </a>
              </div>
            </section>
          `;
        }

        return;
      }

      // GET INVOLVED: Display volunteer opportunity cards
      if (
        file === 'get-involved.html' &&
        Array.isArray(data.involvementCards)
      ) {
        const host = document.querySelector('#involvement-cards');
        console.log('Page detected:', file);
console.log('Volunteer cards:', data.involvementCards);
console.log('Card container:', host);

        if (host) {
          const cards = data.involvementCards.filter(
            (x) => x.visible !== false
          );

          host.innerHTML = cards.map((x) => `
            <article class="card">
              <div class="icon-disc">
                ${esc(x.icon || '✧')}
              </div>

              <h3>${esc(x.title)}</h3>

              <p>${esc(x.description)}</p>

              ${
                x.buttonText
                  ? `
                    <p>
                      <a
                        class="button button-primary"
                        href="${esc(x.buttonUrl || 'contact.html')}"
                      >
                        ${esc(x.buttonText)}
                      </a>
                    </p>
                  `
                  : ''
              }
            </article>
          `).join('');
        }
      }

      // RESOURCES: Display resource cards
      if (
        file === 'resources.html' &&
        Array.isArray(data.resources)
      ) {
        const host = document.querySelector('.resource-list');

        if (host) {
          host.innerHTML = data.resources
            .filter((x) => x.visible !== false)
            .map((x) => `
              <article class="resource">

                ${
                  x.image
                    ? `
                      <div>
                        <img
                          src="${esc(x.image)}"
                          alt="${esc(x.caption || x.title)}"
                          style="width:100%;max-width:180px;border-radius:12px;object-fit:cover"
                        >
                        <p class="small muted">
                          ${esc(x.caption)}
                        </p>
                      </div>
                    `
                    : ''
                }

                <div>
                  <span class="small-label">
                    ${esc(x.category)}
                  </span>

                  <h3>${esc(x.title)}</h3>

                  <p>${esc(x.description)}</p>
                </div>

                <a
                  href="${esc(x.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit resource ↗
                </a>

              </article>
            `)
            .join('');
        }
      }
    })
    .catch((error) => {
      console.error('Website content loading error:', error);
    });
})();
