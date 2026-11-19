let wikiIndex = [];
let wikiMeta = {
  wikiVersion: 'v1.0.0',
  lastUpdated: 'November 2026',
  gdpsVersion: '2.208 / 2.2081'
};

// Inicializar Wiki y cargar índice + versión
async function initWiki() {
  try {
    const res = await fetch('data/index.json');
    if (res.ok) {
      const data = await res.json();
      wikiIndex = data.articles || [];
      wikiMeta.wikiVersion = data.wikiVersion || wikiMeta.wikiVersion;
      wikiMeta.lastUpdated = data.lastUpdated || wikiMeta.lastUpdated;
      wikiMeta.gdpsVersion = data.gdpsVersion || wikiMeta.gdpsVersion;

      // Actualizar etiquetas de versión en Sidebar y Footer
      const sidebarVer = document.getElementById('wiki-version-sidebar');
      const footerVer = document.getElementById('wiki-version-footer');
      if (sidebarVer) sidebarVer.textContent = wikiMeta.wikiVersion;
      if (footerVer) {
        footerVer.textContent = `${wikiMeta.wikiVersion} • Updated ${wikiMeta.lastUpdated}`;
      }

      populateSidebar();
    }
  } catch (err) {
    console.error('Could not load data/index.json:', err);
  }

  setupSearch();
  loadArticle(window.location.hash);
}

// Llenar lista de artículos en la barra lateral
function populateSidebar() {
  const list = document.getElementById('sidebar-article-list');
  if (!list) return;
  list.innerHTML = '';

  wikiIndex.forEach(item => {
    if (item.id === 'main-page') return;
    list.innerHTML += `<li><a href="#${item.id}" class="hover:underline">${item.title}</a></li>`;
  });
}

// Cargar artículo por ID desde /data/{id}.json
async function loadArticle(hash) {
  const cleanId = (hash || '').replace('#', '').trim() || 'main-page';
  window.scrollTo({ top: 0, behavior: 'instant' });

  try {
    const response = await fetch(`data/${cleanId}.json`);
    if (!response.ok) throw new Error('Article not found');
    const data = await response.json();

    // Título y subtítulo
    document.title = cleanId === 'main-page'
      ? `Maxr3 GDPS Wiki (${wikiMeta.wikiVersion})`
      : `${data.title} - Maxr3 GDPS Wiki`;

    document.getElementById('article-title').textContent = data.title;
    document.getElementById('article-subtitle').textContent =
      data.subtitle || 'From Maxr3 GDPS Wiki, the free encyclopedia';

    // Etiqueta de tipo arriba a la derecha
    const badge = document.getElementById('article-category-badge');
    if (data.infobox && data.infobox.type) {
      badge.textContent = `Template: ${data.infobox.type.toUpperCase()}`;
    } else if (cleanId === 'main-page') {
      badge.textContent = `Wiki ${wikiMeta.wikiVersion}`;
    } else {
      badge.textContent = '';
    }

    // Reemplazar placeholders dinámicos de versión si existen en el JSON
    const processedSummary = (data.summary || '')
      .replace(/\{\{WIKI_VERSION\}\}/g, wikiMeta.wikiVersion)
      .replace(/\{\{GDPS_VERSION\}\}/g, wikiMeta.gdpsVersion);

    document.getElementById('article-summary').innerHTML = processedSummary;

    // Renderizar Infobox
    renderInfobox(data.infobox);

    // Renderizar Tabla de Contenidos y Secciones
    renderSections(data.sections, data.hideToc);

    // Renderizar Categorías al final del artículo
    renderCategories(data.categories);

  } catch (error) {
    document.title = 'Page not found - Maxr3 GDPS Wiki';
    document.getElementById('article-title').textContent = 'Page not found';
    document.getElementById('article-subtitle').textContent = 'From Maxr3 GDPS Wiki, the free encyclopedia';
    document.getElementById('article-summary').innerHTML = `
      <div class="border border-wiki-border bg-wiki-infoboxBg p-4">
        <p><b>Maxr3 GDPS Wiki does not have an article with this exact name yet.</b></p>
        <p class="mb-0">To create it, add <code>data/${cleanId}.json</code> and register it in <code>data/index.json</code>. <a href="#main-page">Return to Main Page</a>.</p>
      </div>`;
    document.getElementById('infobox').classList.add('hidden');
    document.getElementById('toc').classList.add('hidden');
    document.getElementById('article-sections').innerHTML = '';
    document.getElementById('article-categories').classList.add('hidden');
  }
}

// Renderizar Infobox dinámica estilo Wikipedia
function renderInfobox(infoboxData) {
  const infobox = document.getElementById('infobox');
  const infoboxTitle = document.getElementById('infobox-title');
  const infoboxBody = document.getElementById('infobox-body');

  if (!infoboxData) {
    infobox.classList.add('hidden');
    return;
  }

  infobox.classList.remove('hidden');
  infoboxBody.innerHTML = '';

  const themeColors = {
    level: 'bg-[#cee0f2] text-black',   // Azul clásico niveles
    player: 'bg-[#d4e8d4] text-black',  // Verde suave jugadores/staff
    update: 'bg-[#fce8b2] text-black',  // Dorado actualizaciones
    rules: 'bg-[#f8d7da] text-black',   // Rojo suave políticas/reglas
    default: 'bg-[#eaecf0] text-black'
  };

  const headerClass = themeColors[infoboxData.type] || themeColors.default;
  infoboxTitle.className = `${headerClass} text-center py-1.5 px-2 text-sm font-bold border-b border-wiki-border`;
  infoboxTitle.textContent = infoboxData.title;

  // Imagen principal si existe
  if (infoboxData.image) {
    infoboxBody.innerHTML += `
      <tr>
        <td colspan="2" class="text-center p-2 border-b border-wiki-border bg-white">
          <img src="${infoboxData.image}" alt="${infoboxData.title}" class="mx-auto max-w-full border border-gray-300">
          ${infoboxData.caption ? `<div class="text-[11px] text-wiki-muted mt-1.5 leading-tight">${infoboxData.caption}</div>` : ''}
        </td>
      </tr>`;
  }

  // Soportar formato agrupado (groups) o plano (data)
  const groups = infoboxData.groups || [{ rows: infoboxData.data || [] }];

  groups.forEach(group => {
    if (group.header) {
      infoboxBody.innerHTML += `
        <tr>
          <th colspan="2" class="${headerClass} text-center py-1 px-2 text-xs font-bold border-t border-b border-wiki-border">
            ${group.header}
          </th>
        </tr>`;
    }

    (group.rows || []).forEach(row => {
      infoboxBody.innerHTML += `
        <tr class="border-b border-gray-200">
          <th class="text-left py-1.5 px-2 font-bold align-top w-[38%] bg-wiki-infoboxLabel text-wiki-text">${row.label}</th>
          <td class="py-1.5 px-2 align-top bg-wiki-infoboxBg">${row.value}</td>
        </tr>`;
    });
  });
}

// Renderizar secciones y Tabla de Contenidos (TOC)
function renderSections(sections, hideToc = false) {
  const toc = document.getElementById('toc');
  const tocList = document.getElementById('toc-list');
  const container = document.getElementById('article-sections');

  tocList.innerHTML = '';
  container.innerHTML = '';

  if (!sections || sections.length === 0) {
    toc.classList.add('hidden');
    return;
  }

  if (!hideToc && sections.length >= 2) {
    toc.classList.remove('hidden');
  } else {
    toc.classList.add('hidden');
  }

  sections.forEach((sec, index) => {
    const anchor = `sec-${index}`;

    tocList.innerHTML += `
      <li>
        <a href="javascript:void(0)" onclick="document.getElementById('${anchor}').scrollIntoView({ behavior: 'smooth' })">
          ${sec.heading}
        </a>
      </li>`;

    container.innerHTML += `
      <section id="${anchor}">
        <h2 class="font-serifWiki text-xl font-normal border-b border-wiki-border pb-0.5 mb-2.5 text-black">
          ${sec.heading}
        </h2>
        <div>${sec.content}</div>
      </section>`;
  });
}

// Renderizar barra inferior de categorías
function renderCategories(categories) {
  const box = document.getElementById('article-categories');
  const list = document.getElementById('categories-list');

  if (!categories || categories.length === 0) {
    box.classList.add('hidden');
    return;
  }

  box.classList.remove('hidden');
  list.innerHTML = categories
    .map(cat => `<span class="hover:underline cursor-pointer">${cat}</span>`)
    .join(' <span class="text-gray-400 mx-1">|</span> ');
}

// Buscador en vivo estilo Wikipedia
function setupSearch() {
  const input = document.getElementById('search-input');
  const resultsBox = document.getElementById('search-results');

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      resultsBox.classList.add('hidden');
      return;
    }

    const matches = wikiIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );

    if (matches.length === 0) {
      resultsBox.innerHTML = `<div class="px-3 py-2 text-wiki-muted">No results matching "${input.value}"</div>`;
    } else {
      resultsBox.innerHTML = matches.map(item => `
        <a href="#${item.id}" onclick="document.getElementById('search-results').classList.add('hidden'); document.getElementById('search-input').value='';"
           class="block px-3 py-2 hover:bg-[#eaf3ff] border-b border-gray-100 last:border-none">
          <div class="font-bold text-wiki-link">${item.title}</div>
          <div class="text-[11px] text-wiki-muted truncate">${item.description || ''}</div>
        </a>
      `).join('');
    }

    resultsBox.classList.remove('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !resultsBox.contains(e.target)) {
      resultsBox.classList.add('hidden');
    }
  });
}

// Cargar un artículo aleatorio
function loadRandomArticle() {
  const articles = wikiIndex.filter(a => a.id !== 'main-page');
  if (articles.length === 0) return;
  const random = articles[Math.floor(Math.random() * articles.length)];
  window.location.hash = `#${random.id}`;
}

// Mostrar/ocultar sidebar en móviles
function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden');
  sidebar.classList.toggle('fixed');
  sidebar.classList.toggle('inset-y-0');
  sidebar.classList.toggle('left-0');
  sidebar.classList.toggle('bg-wiki-bg');
  sidebar.classList.toggle('z-50');
  sidebar.classList.toggle('border-r');
  sidebar.classList.toggle('border-gray-300');
}

window.addEventListener('hashchange', () => loadArticle(window.location.hash));
window.addEventListener('DOMContentLoaded', initWiki);
