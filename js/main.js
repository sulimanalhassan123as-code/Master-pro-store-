// Add this to the very top of js/main.js
window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
}

// Check if JSON loads
fetch('apps.json')
  .then(response => {
    if (!response.ok) throw new Error("JSON file not found (404)");
    return response.json();
  })
  .catch(err => alert("Data Error: " + err.message));

// Database State
let allApps = [];
let currentCategoryContext = null;

// Hardcoded Categories mapping
const categoriesData = [
  { id: 'islamic', name: '🕌 Islamic Apps', icon: '🕌', updated: 'Updated Afternoon' },
  { id: 'cybersecurity', name: '🛡️ Cybersecurity Apps', icon: '🛡️', updated: 'Updated Evening' },
  { id: 'tech', name: '💻 Tech Apps', icon: '💻', updated: 'Updated Recently' },
  { id: 'games', name: '🎮 Games', icon: '🎮', updated: 'Updated Recently' }
];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupThemeSwitcher();
  setupSearch();
  
  try {
    const res = await fetch('apps.json');
    allApps = await res.json();
    renderHome();
  } catch (err) {
    console.error("Failed to load apps:", err);
  }
});

// View Router
function showView(viewId) {
  document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active-view'));
  document.getElementById(viewId).classList.add('active-view');
  window.scrollTo(0, 0);
}

// 1. Render Home View
function renderHome() {
  // Featured Apps
  document.getElementById('trending-container').innerHTML = createMiniCards(allApps.filter(a => a.isTrending));
  document.getElementById('downloaded-container').innerHTML = createMiniCards(allApps.filter(a => a.isMostDownloaded));
  document.getElementById('new-container').innerHTML = createMiniCards(allApps.filter(a => a.isNew));

  // Category Grid
  const catHtml = categoriesData.map(cat => {
    const count = allApps.filter(a => a.category === cat.id).length;
    return `
      <div class="category-card" onclick="openCategory('${cat.id}')">
        <h4>${cat.name}</h4>
        <p class="sub-text">📦 ${count} Apps Available</p>
        <p class="sub-text">⏰ ${cat.updated}</p>
      </div>
    `;
  }).join('');
  document.getElementById('category-cards-container').innerHTML = catHtml;
}

function createMiniCards(appsArray) {
  if(appsArray.length === 0) return `<p class="sub-text">None currently</p>`;
  return appsArray.map(app => `
    <div class="mini-app-card" onclick="openAppDetail('${app.id}')">
      <img src="${app.icon}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><rect width=\'60\' height=\'60\' fill=\'#ccc\'/></svg>'">
      <p style="font-size: 0.8rem; font-weight: bold;">${app.title.substring(0, 12)}</p>
    </div>
  `).join('');
}

// 2. Open Category View
function openCategory(catId) {
  currentCategoryContext = catId;
  const categoryInfo = categoriesData.find(c => c.id === catId);
  const appsInCat = allApps.filter(a => a.category === catId);
  
  document.getElementById('cat-view-title').innerText = categoryInfo.name;
  document.getElementById('cat-view-count').innerText = `Total Apps: ${appsInCat.length}`;
  
  const listContainer = document.getElementById('cat-view-list');
  if (appsInCat.length === 0) {
    listContainer.innerHTML = `<div style="text-align: center; padding: 40px;">🚀 Apps coming soon. Stay tuned!</div>`;
  } else {
    listContainer.innerHTML = createVerticalList(appsInCat);
  }
  
  showView('category-view');
}

function createVerticalList(appsArray) {
  return appsArray.map(app => `
    <div class="app-list-item" onclick="openAppDetail('${app.id}')">
      <div class="logo-3d-container" style="width: 60px; height: 60px; margin: 0;">
        <div class="logo-flipper">
          <div class="logo-front"><img src="${app.icon}" onerror="this.style.display='none'"></div>
          <div class="logo-back"><img src="${app.iconBack}" onerror="this.style.display='none'"></div>
        </div>
      </div>
      <div class="app-list-info">
        <h4 style="margin-bottom: 5px;">${app.title}</h4>
        <div class="app-stats-row">👍 ${app.likes} | 📥 ${app.installs} | 💬 ${app.comments}</div>
        <div class="app-actions">
          <button class="btn-install" onclick="event.stopPropagation(); window.open('${app.url}', '_blank')">Install</button>
          <button class="btn-open" onclick="event.stopPropagation(); window.open('${app.url}', '_blank')">Open</button>
        </div>
      </div>
    </div>
  `).join('');
}

// 3. Open App Detail View
function openAppDetail(appId) {
  const app = allApps.find(a => a.id === appId);
  if(!app) return;

  const content = `
    <div class="detail-header">
      <img src="${app.icon}" style="width: 100px; height: 100px; border-radius: 20px;">
      <div>
        <h2>${app.title}</h2>
        <p class="sub-text">Never Hide Tech Empire</p>
      </div>
    </div>
    
    <div class="detail-stats">
      <div><b>${app.likes}</b><br><span class="sub-text">Likes 👍</span></div>
      <div><b>${app.installs}</b><br><span class="sub-text">Installs 📥</span></div>
      <div><b>${app.comments}</b><br><span class="sub-text">Comments 💬</span></div>
    </div>

    <div class="app-actions" style="margin-bottom: 20px;">
      <button class="btn-install" style="flex: 1; padding: 15px;" onclick="window.open('${app.url}', '_blank')">Install Application</button>
      <button class="btn-open" style="flex: 1; padding: 15px;" onclick="window.open('${app.url}', '_blank')">Open Web App</button>
    </div>
    
    <p style="line-height: 1.5;">${app.desc}</p>
  `;

  document.getElementById('detail-view-content').innerHTML = content;

  // Related Apps
  const related = allApps.filter(a => a.category === app.category && a.id !== app.id);
  document.getElementById('related-apps-list').innerHTML = 
    related.length > 0 ? createVerticalList(related) : `<p class="sub-text">No related apps found.</p>`;

  showView('app-detail-view');
}

function goBackToCategory() {
  if (currentCategoryContext) {
    openCategory(currentCategoryContext);
  } else {
    showView('home-view');
  }
}

// 4. Search System
function setupSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (term.length === 0) {
      showView('home-view');
      return;
    }

    // Filter Categories
    const foundCats = categoriesData.filter(c => c.name.toLowerCase().includes(term));
    const catHtml = foundCats.map(c => `
      <div style="padding: 10px; border-bottom: 1px solid var(--border); cursor: pointer;" onclick="openCategory('${c.id}')">
        • ${c.name}
      </div>
    `).join('');
    document.getElementById('search-cat-list').innerHTML = catHtml || '<p class="sub-text">No categories found.</p>';

    // Filter Apps
    const foundApps = allApps.filter(a => a.title.toLowerCase().includes(term) || a.category.toLowerCase().includes(term));
    document.getElementById('search-app-list').innerHTML = foundApps.length > 0 ? createVerticalList(foundApps) : '<p class="sub-text">No apps found.</p>';

    showView('search-view');
  });
}

// 5. Theme Switcher
function setupThemeSwitcher() {
  document.getElementById('theme-select').addEventListener('change', (e) => {
    document.body.setAttribute('data-theme', e.target.value);
  });
}
