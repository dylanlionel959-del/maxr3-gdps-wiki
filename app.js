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
    level: 'bg-[#cee0f2] text-black',   // Blue 
    player: 'bg-[#d4e8d4] text-black',  // No Info
    update: 'bg-[#fce8b2] text-black',  // Dorado actualizaciones
    rules: 'bg-[#f8d7da] text-black',   // Rojo suave políticas/reglas
    default: 'bg-[#eaecf0] text-black'
  };

  const headerClass = themeColors[infoboxData.type] || themeColors.default;
  infoboxTitle.className = `${headerClass} text-center py-1.5 px-2 text-sm font-bold border-b border-wiki-border`;
  infoboxTitle.textContent = infoboxData.title;

  // Imagen principal desde el JSON (URL externa o ruta local)
  if (infoboxData.image && infoboxData.image.trim() !== '') {
    const safeImage = infoboxData.image.trim();
    const safeAlt = (infoboxData.title || 'Infobox image').replace(/"/g, '&quot;');
    const captionHtml = infoboxData.caption
      ? `<div class="text-[11px] text-wiki-muted mt-1.5 leading-tight">${infoboxData.caption}</div>`
      : '';

    infoboxBody.innerHTML += `
      <tr id="infobox-image-row">
        <td colspan="2" class="text-center p-2 border-b border-wiki-border bg-white">
          <img
            src="${safeImage}"
            alt="${safeAlt}"
            loading="lazy"
            onerror="const row = document.getElementById('infobox-image-row'); if (row) row.classList.add('hidden');"
            class="mx-auto max-w-full max-h-56 object-contain border border-gray-300"
          />
          ${captionHtml}
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
