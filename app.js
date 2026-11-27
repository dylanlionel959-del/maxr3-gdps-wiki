(() => {
  const WIKI_VERSION = '26.12-beta.1';
  const NEXT_VERSION = '27.01';
  const DEFAULT_GDPS_VERSION = '2.208 / 2.2081';

  const state = {
    wikiVersion: WIKI_VERSION,
    gdpsVersion: DEFAULT_GDPS_VERSION,
    lastUpdated: 'December 2026',
    articleIds: [],
    indexArticles: [],
    cache: new Map()
  };

  function replayLiquidEnter(el) {
    if (!el) return;
    el.classList.remove('liquid-enter');
    void el.offsetWidth;
    el.classList.add('liquid-enter');
  }

  // --- 1. Local Timezone Clock & Year-End 2026 Countdown ---
  function initHolidayCountdown() {
    const tzEl = document.getElementById('user-timezone');
    const clockEl = document.getElementById('user-local-clock');
    const countdownEl = document.getElementById('year-end-countdown');

    let userTimeZone = 'Local Time';
    try {
      userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
    } catch (_) {
      userTimeZone = 'Local Time';
    }
    if (tzEl) tzEl.textContent = userTimeZone;

    const pad = (n) => String(n).padStart(2, '0');

    function updateTimers() {
      const now = new Date();

      if (clockEl) {
        try {
          clockEl.textContent = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        } catch (_) {
          clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        }
      }

      const endOf2026 = new Date(2027, 0, 1, 0, 0, 0, 0);
      const diffMs = endOf2026.getTime() - now.getTime();

      if (!countdownEl) return;

      if (diffMs <= 0) {
        countdownEl.textContent = `2026 Ended • Welcome to v${NEXT_VERSION}!`;
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      countdownEl.textContent = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    }

    updateTimers();
    setInterval(updateTimers, 1000);
  }

  // --- 2. Subtle Liquid Snowfall with Gentle Wave Drift ---
  function initSnowEffect() {
    const canvas = document.getElementById('snow-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const flakeCount = Math.min(48, Math.floor(width / 28));
    const flakes = Array.from({ length: flakeCount }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.5 + Math.random() * 2.8,
      speedY: 0.35 + Math.random() * 0.72,
      swayAmp: 0.25 + Math.random() * 0.45,
      swaySpeed: 0.008 + Math.random() * 0.012,
      phase: idx * 0.7,
      alpha: 0.35 + Math.random() * 0.5
    }));

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (const f of flakes) {
        f.phase += f.swaySpeed;
        f.y += f.speedY;
        f.x += Math.sin(f.phase) * f.swayAmp;

        if (f.y > height) {
          f.y = -6;
          f.x = Math.random() * width;
        }
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(animate);
    }

    animate();
  }

  // --- 3. Template Variable Interpolation ---
  function interpolateVariables(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/\{\{\s*WIKI_VERSION\s*\}\}/g, state.wikiVersion)
      .replace(/\{\{\s*GDPS_VERSION\s*\}\}/g, state.gdpsVersion)
      .replace(/\{\{\s*NEXT_VERSION\s*\}\}/g, NEXT_VERSION);
  }

  // --- 4. Safe JSON Fetcher ---
  async function fetchJsonSafe(url) {
    try {
      const response = await fetch(`${url}?v=${encodeURIComponent(WIKI_VERSION)}`, {
        cache: 'no-store'
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  // --- 5. Built-in Fallback Main Page ---
  function getFallbackMainPage() {
    return {
      id: 'main-page',
      title: 'Main Page',
      subtitle: 'From Maxr3 GDPS Wiki, the free encyclopedia',
      hideToc: true,
      summary: `
        <div class="liquid-glass liquid-sheen rounded-2xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="relative z-10">
            <div class="font-serifWiki text-2xl text-slate-900">Welcome to <b>Maxr3 GDPS Wiki</b>,</div>
            <div class="text-xs text-slate-600 mt-1">the collaborative encyclopedia dedicated to the <b>Maxr3 Geometry Dash Private Server</b>.</div>
          </div>
          <div class="relative z-10 text-left sm:text-right text-xs text-slate-700 space-y-1 bg-white/65 border border-white rounded-xl px-3.5 py-2.5">
            <div>GDPS Version: <b>${state.gdpsVersion}</b></div>
            <div>Wiki Engine: <code>${state.wikiVersion}</code></div>
            <div>Next Major: <code>${NEXT_VERSION}</code></div>
            <div>Host: <code>mr3gdps1938.ps.fhgdps.com</code></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div class="liquid-glass rounded-2xl border border-emerald-300/60 bg-emerald-50/65 p-4">
            <h3 class="font-bold text-sm text-emerald-950 mb-1.5 flex items-center gap-1.5">🎄 Holiday Liquid Glass Preview</h3>
            <p class="text-xs leading-relaxed text-slate-700 mb-0">
              Explore Maxr3 GDPS players, rated levels, and server rules in our animated Liquid Glass interface as we close out <b>2026</b> and prepare for version <b>${NEXT_VERSION}</b>.
            </p>
          </div>
          <div class="liquid-glass rounded-2xl border border-rose-300/60 bg-rose-50/65 p-4">
            <h3 class="font-bold text-sm text-rose-950 mb-1.5 flex items-center gap-1.5">🧭 Quick Navigation</h3>
            <ul class="text-xs space-y-1 mb-0 text-slate-700">
              <li><b>Players &amp; Staff:</b> <a href="#maxr3">Maxr3</a></li>
              <li><b>Featured Level:</b> <a href="#pink-wave">Pink Wave</a></li>
              <li><b>Policies:</b> <a href="#server-rules">Server Rules</a></li>
            </ul>
          </div>
        </div>
      `,
      sections: [
        {
          heading: 'About Maxr3 GDPS',
          content:
            '<p><b>Maxr3 GDPS</b> is a Geometry Dash Private Server running on version <b>{{GDPS_VERSION}}</b>, featuring custom levels, a dedicated Demon List, community events, and this automated JSON-driven Wiki.</p>'
        }
      ],
      categories: ['Maxr3 GDPS', 'Main Portal', '26.12-beta.1']
    };
  }

  // --- 6. Load Index & Article Registry ---
  async function loadMetadata() {
    const [articlesList, indexData] = await Promise.all([
      fetchJsonSafe('data/articles.json'),
      fetchJsonSafe('data/index.json')
    ]);

    if (indexData && typeof indexData === 'object') {
      state.gdpsVersion = indexData.gdpsVersion || DEFAULT_GDPS_VERSION;
      state.lastUpdated = indexData.lastUpdated || 'December 2026';
      if (Array.isArray(indexData.articles)) {
        state.indexArticles = indexData.articles;
      }
    }

    const combinedIds = new Set(['main-page']);
    if (Array.isArray(articlesList)) {
      articlesList.forEach((id) => {
        if (typeof id === 'string' && id.trim()) combinedIds.add(id.trim());
      });
    }
    state.indexArticles.forEach((entry) => {
      if (entry && typeof entry.id === 'string' && entry.id.trim()) {
        combinedIds.add(entry.id.trim());
      }
    });

    state.articleIds = Array.from(combinedIds);

    const footerUpdated = document.getElementById('footer-last-updated');
    if (footerUpdated) footerUpdated.textContent = `Updated ${state.lastUpdated}`;

    renderSidebar();
  }

  function formatSlugTitle(slug) {
    const found = state.indexArticles.find((a) => a && a.id === slug);
    if (found && found.title) return found.title;
    return slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function renderSidebar() {
    const listEl = document.getElementById('sidebar-article-list');
    const countBadge = document.getElementById('article-count-badge');
    if (!listEl) return;

    if (countBadge) countBadge.textContent = String(state.articleIds.length);

    if (state.articleIds.length === 0) {
      listEl.innerHTML = '<li class="text-xs text-slate-500 px-2 py-1">No articles found.</li>';
      return;
    }

    const currentSlug = getCurrentSlug();
    listEl.innerHTML = state.articleIds
      .map((slug) => {
        const active = slug === currentSlug;
        const activeClasses = active
          ? 'bg-emerald-600/15 text-emerald-950 font-semibold border border-emerald-400/40 shadow-sm'
          : 'text-slate-700 hover:bg-white/75';
        return `
          <li>
            <a href="#${encodeURIComponent(slug)}" class="liquid-nav-item block px-2.5 py-1.5 rounded-xl truncate ${activeClasses}">
              ${escapeHtml(formatSlugTitle(slug))}
            </a>
          </li>
        `;
      })
      .join('');
  }

  // --- 7. Render Infobox & Article ---
  function renderInfobox(infobox) {
    if (!infobox || typeof infobox !== 'object') return '';

    const title = escapeHtml(interpolateVariables(infobox.title || 'Information'));
    const imageHtml = infobox.image
      ? `<div class="p-3 bg-white/50 border-b border-white/80 text-center">
           <img src="${escapeHtml(infobox.image)}" alt="${title}" class="mx-auto max-h-48 rounded-xl object-cover shadow-sm" />
           ${infobox.caption ? `<div class="text-[11px] text-slate-600 mt-1.5">${interpolateVariables(infobox.caption)}</div>` : ''}
         </div>`
      : '';

    const groupsHtml = Array.isArray(infobox.groups)
      ? infobox.groups
          .map((group) => {
            const header = group.header
              ? `<div class="bg-gradient-to-r from-emerald-600/15 to-rose-600/15 px-3 py-1.5 text-xs font-bold text-slate-800 border-y border-white/80">${escapeHtml(group.header)}</div>`
              : '';
            const rows = Array.isArray(group.rows)
              ? group.rows
                  .map(
                    (row) => `
                    <div class="grid grid-cols-12 px-3 py-2 text-xs border-b border-slate-200/50 last:border-b-0">
                      <div class="col-span-5 font-semibold text-slate-700">${escapeHtml(row.label || '')}</div>
                      <div class="col-span-7 text-slate-900 break-words">${interpolateVariables(row.value || '')}</div>
                    </div>`
                  )
                  .join('')
              : '';
            return header + rows;
          })
          .join('')
      : '';

    return `
      <aside class="wiki-infobox w-full sm:w-72 sm:float-right sm:ml-6 mb-5">
        <div class="bg-gradient-to-r from-emerald-700/85 to-rose-700/85 text-white px-3.5 py-2.5 text-center font-serifWiki font-bold text-sm">
          ${title}
        </div>
        ${imageHtml}
        <div>${groupsHtml}</div>
      </aside>
    `;
  }

  function renderToc(sections) {
    if (!Array.isArray(sections) || sections.length < 2) return '';
    const items = sections
      .map((sec, idx) => {
        const heading = sec.heading || `Section ${idx + 1}`;
        return `<li><a href="#sec-${idx}" class="text-blue-700 hover:underline">${idx + 1}. ${escapeHtml(heading)}</a></li>`;
      })
      .join('');

    return `
      <div class="liquid-glass rounded-2xl p-3.5 mb-5 inline-block min-w-[220px]">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Contents</div>
        <ol class="text-xs space-y-1 list-none pl-0 mb-0">${items}</ol>
      </div>
    `;
  }

  async function renderArticle(slug) {
    const titleEl = document.getElementById('article-title');
    const subtitleEl = document.getElementById('article-subtitle');
    const contentEl = document.getElementById('article-content');
    const catBox = document.getElementById('article-categories-box');
    const catList = document.getElementById('article-categories');

    renderSidebar();

    let article = state.cache.get(slug);
    if (!article) {
      article = await fetchJsonSafe(`data/${encodeURIComponent(slug)}.json`);
      if (article) {
        state.cache.set(slug, article);
      }
    }

    if (!article && slug === 'main-page') {
      article = getFallbackMainPage();
    }

    if (!article) {
      if (titleEl) titleEl.textContent = 'Article Not Found';
      if (subtitleEl) subtitleEl.textContent = 'Maxr3 GDPS Wiki • 26.12-beta.1';
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="rounded-2xl border border-rose-300/70 bg-rose-50/70 p-5 text-sm text-rose-950">
            <p class="font-bold mb-1">The requested page ("${escapeHtml(slug)}") does not exist yet.</p>
            <p class="mb-0 text-xs">You can generate it using the GitHub Actions workflows or return to the <a href="#main-page">Main Page</a>.</p>
          </div>
        `;
        replayLiquidEnter(contentEl);
      }
      if (catBox) catBox.classList.add('hidden');
      return;
    }

    if (titleEl) titleEl.textContent = interpolateVariables(article.title || formatSlugTitle(slug));
    if (subtitleEl) {
      subtitleEl.textContent = interpolateVariables(
        article.subtitle || 'From Maxr3 GDPS Wiki, the free encyclopedia'
      );
    }

    const infoboxHtml = renderInfobox(article.infobox);
    const summaryHtml = article.summary ? `<div class="mb-4">${interpolateVariables(article.summary)}</div>` : '';
    const tocHtml = article.hideToc ? '' : renderToc(article.sections);

    const sectionsHtml = Array.isArray(article.sections)
      ? article.sections
          .map(
            (sec, idx) => `
            <section id="sec-${idx}" class="mt-6">
              <h2 class="font-serifWiki text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-300/70 pb-1.5 mb-3">
                ${escapeHtml(interpolateVariables(sec.heading || ''))}
              </h2>
              <div>${interpolateVariables(sec.content || '')}</div>
            </section>`
          )
          .join('')
      : '';

    if (contentEl) {
      contentEl.innerHTML = `${infoboxHtml}${summaryHtml}${tocHtml}${sectionsHtml}`;
      replayLiquidEnter(contentEl);
    }

    if (Array.isArray(article.categories) && article.categories.length > 0 && catBox && catList) {
      catList.innerHTML = article.categories
        .map(
          (cat) =>
            `<span class="px-2.5 py-0.5 rounded-full bg-white/80 border border-white text-slate-700 font-medium transition hover:bg-white">${escapeHtml(
              interpolateVariables(cat)
            )}</span>`
        )
        .join('');
      catBox.classList.remove('hidden');
      replayLiquidEnter(catBox);
    } else if (catBox) {
      catBox.classList.add('hidden');
    }
  }

  // --- 8. Search & Navigation ---
  function initSearch() {
    const input = document.getElementById('wiki-search');
    const resultsBox = document.getElementById('search-results');
    if (!input || !resultsBox) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        resultsBox.classList.add('hidden');
        resultsBox.innerHTML = '';
        return;
      }

      const matches = state.articleIds.filter((slug) => {
        const title = formatSlugTitle(slug).toLowerCase();
        return slug.toLowerCase().includes(q) || title.includes(q);
      });

      if (matches.length === 0) {
        resultsBox.innerHTML = `<div class="px-3.5 py-2.5 text-xs text-slate-500">No matching articles.</div>`;
      } else {
        resultsBox.innerHTML = matches
          .map(
            (slug) => `
            <a href="#${encodeURIComponent(slug)}" class="block px-3.5 py-2 text-xs hover:bg-white/85 transition">
              <div class="font-semibold text-slate-900">${escapeHtml(formatSlugTitle(slug))}</div>
              <div class="text-[11px] text-slate-500">#${escapeHtml(slug)}</div>
            </a>`
          )
          .join('');
      }
      resultsBox.classList.remove('hidden');
      replayLiquidEnter(resultsBox);
    });

    document.addEventListener('click', (e) => {
      if (!resultsBox.contains(e.target) && e.target !== input) {
        resultsBox.classList.add('hidden');
      }
    });
  }

  function getCurrentSlug() {
    const rawHash = window.location.hash.replace(/^#/, '').trim();
    if (!rawHash || rawHash.startsWith('sec-')) return 'main-page';
    return decodeURIComponent(rawHash);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- 9. Bootstrap ---
  async function init() {
    initHolidayCountdown();
    initSnowEffect();
    initSearch();

    const randomBtn = document.getElementById('random-article-btn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        if (state.articleIds.length === 0) return;
        const randomSlug = state.articleIds[Math.floor(Math.random() * state.articleIds.length)];
        window.location.hash = `#${encodeURIComponent(randomSlug)}`;
      });
    }

    await loadMetadata();
    await renderArticle(getCurrentSlug());

    window.addEventListener('hashchange', () => {
      const rawHash = window.location.hash.replace(/^#/, '').trim();
      if (rawHash.startsWith('sec-')) return;
      renderArticle(getCurrentSlug());
      const resultsBox = document.getElementById('search-results');
      if (resultsBox) resultsBox.classList.add('hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
