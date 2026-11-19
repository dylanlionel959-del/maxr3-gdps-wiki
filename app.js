let wikiIndex = [];
let availableArticleIds = [];
let wikiMeta = {
  wikiVersion: '26.11',
  lastUpdated: '19 November 2026',
  gdpsVersion: '2.208 / 2.2081'
};

// Formatear un slug como "pink-wave" en "Pink Wave" si falta en index.json
function formatTitleFromId(id) {
  return String(id)
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Inicializar Wiki, cargar versión, índice y data/articles.json
async function initWiki() {
  try {
    const res = await fetch('data/index.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      wikiIndex = Array.isArray(data.articles) ? data.articles : [];
      wikiMeta.wikiVersion = data.wikiVersion || wikiMeta.wikiVersion;
      wikiMeta.lastUpdated = data.lastUpdated || wikiMeta.lastUpdated;
      wikiMeta.gdpsVersion = data.gdpsVersion || wikiMeta.gdpsVersion;

      const sidebarVer = document.getElementById('wiki-version-sidebar');
      const footerVer = document.getElementById('wiki-version-footer');
      if (sidebarVer) sidebarVer.textContent = wikiMeta.wikiVersion;
      if (footerVer) {
        footerVer.textContent = `${wikiMeta.wikiVersion} • Updated ${wikiMeta.lastUpdated}`;
      }
    }
  } catch (err) {
    console.warn('Could not load data/index.json:', err);
  }

  // Leer data/articles.json con la lista de IDs disponibles
  try {
    const articlesRes = await fetch('data/articles.json', { cache: 'no-store' });
    if (articlesRes.ok) {
      const ids = await articlesRes.json();
      if (Array.isArray(ids)) {
        availableArticleIds = ids.map(id => String(id).trim()).filter(Boolean);

        // Asegurar que todo ID en articles.json exista también en wikiIndex
        availableArticleIds.forEach(id => {
          const exists = wikiIndex.some(item => item && item.id === id);
          if (!exists) {
            wikiIndex.push({
              id,
              title: formatTitleFromId(id),
              description: `Article in Maxr3 GDPS Wiki (${id})`
            });
          }
        });

        // Filtrar wikiIndex para que solo conserve artículos listados en articles.json
        wikiIndex = wikiIndex.filter(item => item && availableArticleIds.includes(item.id));
      }
    }
  } catch (err) {
    console.warn('Could not load data/articles.json:', err);
  }

  populateSidebar();
  setupSearch();
  await loadArticle(window.location.hash);
}
