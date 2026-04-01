/* ================================================================
  SULEIMAN PLAY STORE - CORE ENGINE (v2.0 Premium)
  Features: View Routing, Category Filtering, Search, 
  Theme Management, and Social Proof (Reviews/Comments)
================================================================
*/

// 1. GLOBAL STATE & CONFIGURATION
let allApps = [];
let currentCategoryContext = null;

// Categories Metadata for the Home Screen
const categoriesData = [
  { id: 'islamic', name: '🕌 Islamic Apps', icon: '🕌', updated: 'Updated Afternoon' },
  { id: 'cybersecurity', name: '🛡️ Tech & Cyber Security', icon: '🛡️', updated: 'Updated Evening' },
  { id: 'tech', name: '💻 Developer Tools', icon: '💻', updated: 'Updated Recently' },
  { id: 'utility', name: '📦 Useful Utilities', icon: '📦', updated: 'Updated Recently' }
];

// 2. INITIALIZATION (Runs when the page loads)
document.addEventListener('DOMContentLoaded', async () => {
  setupThemeSwitcher();
  setupSearch();
  
  try {
    const res = await fetch('apps.json');
    if (!res.ok) throw new Error("Could not find apps.json");
    allApps = await res.json();
    renderHome();
  } catch (err) {
    console.error("Database Error:", err);
    // Fallback if JSON fails
    document.getElementById('app-container').innerHTML = `<p style="padding:20px; text-align:center;">⚠️ Error loading app database. Please check your apps.json file.</p>`;
  }
});

// 3. NAVIGATION & VIEW ROUTER
function showView(viewId) {
  // Hide all screens
  document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active-view'));
  // Show the requested screen
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active-view');
    window.scrollTo(0, 0); // Reset scroll position to top
  }
}

function goBackToCategory() {
  if (currentCategoryContext) {
    openCategory(currentCategoryContext);
  } else {
    showView('home-view');
  }
}

// 4. RENDERING LOGIC - HOME VIEW
function renderHome() {
  // Render Trending (Horizontal)
  document.getElementById('trending-container').innerHTML = createMiniCards(allApps.filter(a => a.isTrending));
  
  // Render Most Downloaded (Horizontal)
  document.getElementById('downloaded-container').innerHTML = createMiniCards(allApps.filter(a => a.isMostDownloaded));
  
  // Render New Apps (Horizontal)
  document.getElementById('new-container').innerHTML = createMiniCards(allApps.filter(a => a.isNew));

  // Render Category Grid
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

// Helper: Create small square cards for horizontal sections
function createMiniCards(appsArray) {
  if (appsArray.length === 0) return `<p class="sub-text" style="padding:10px;">None available today.</p>`;
  return appsArray.map(app => `
    <div class="mini-app-card" onclick="openAppDetail('${app.id}')">
      <img src="icons/${app.id}-front.png" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\'><rect width=\'60\' height=\'60\' fill=\'#20B2AA\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-size=\'10\'>${app.title.charAt(0)}</text></svg>'">
      <p style="font-size: 0.75rem; font-weight: bold; margin-top:5px;">${app.title}</p>
    </div>
  `).join('');
}

// 5. RENDERING LOGIC - CATEGORY VIEW
function openCategory(catId) {
  currentCategoryContext = catId;
  const categoryInfo = categoriesData.find(c => c.id === catId);
  const appsInCat = allApps.filter(a => a.category === catId);
  
  document.getElementById('cat-view-title').innerText = categoryInfo ? categoryInfo.name : "Category";
  document.getElementById('cat-view-count').innerText = `Total Apps: ${appsInCat.length}`;
  
  const listContainer = document.getElementById('cat-view-list');
  if (appsInCat.length === 0) {
    listContainer.innerHTML = `<div style="text-align: center; padding: 60px;">🚀 Apps coming soon. Stay tuned!</div>`;
  } else {
    listContainer.innerHTML = createVerticalList(appsInCat);
  }
  
  showView('category-view');
}

// Helper: Create the standard vertical app items
function createVerticalList(appsArray) {
  return appsArray.map(app => `
    <div class="app-list-item" onclick="openAppDetail('${app.id}')">
      <div class="logo-3d-container" style="width: 60px; height: 60px; margin: 0;">
        <div class="logo-flipper">
          <div class="logo-front"><img src="icons/${app.id}-front.png" onerror="this.style.display='none'"></div>
          <div class="logo-back"><img src="icons/${app.id}-back.png" onerror="this.style.display='none'"></div>
        </div>
      </div>
      <div class="app-list-info">
        <h4 style="margin-bottom: 5px;">${app.title}</h4>
        <div class="app-stats-row">👍 ${app.likes} | 📥 ${app.installs} | 💬 ${app.comments.length} reviews</div>
        <div class="app-actions">
          <button class="btn-install" onclick="event.stopPropagation(); window.open('${app.url}', '_blank')">Install</button>
          <button class="btn-open" onclick="event.stopPropagation(); window.open('${app.url}', '_blank')">Open</button>
        </div>
      </div>
    </div>
  `).join('');
}

// 6. RENDERING LOGIC - APP DETAIL VIEW (With Social Proof)
function openAppDetail(appId) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;

  const content = `
    <div class="detail-header">
      <img src="icons/${app.id}-front.png" style="width: 100px; height: 100px; border-radius: 20px;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect width=\'100\' height=\'100\' fill=\'#20B2AA\'/></svg>'">
      <div>
        <h2 style="font-size:1.5rem;">${app.title}</h2>
        <p class="sub-text">Never Hide Tech Empire • Verified Developer</p>
      </div>
    </div>
    
    <div class="detail-stats" style="display:flex; justify-content:space-around; background:var(--card-bg); padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;">
      <div><b>${app.likes}</b><br><span class="sub-text">Likes 👍</span></div>
      <div><b>${app.installs}</b><br><span class="sub-text">Installs 📥</span></div>
      <div onclick="toggleComments('${app.id}')" style="cursor:pointer; color:var(--primary);">
        <b>${app.comments.length}</b><br><span>Reviews 💬</span>
      </div>
    </div>

    <div id="comments-list-${app.id}" class="comment-drawer" style="display:none; background:rgba(0,0,0,0.05); padding:15px; border-radius:12px; margin-bottom:20px; border:1px dashed var(--border);">
      <h4 style="margin-bottom:15px; font-size:1rem;">User Experiences</h4>
      ${app.comments.map(c => `
        <div style="margin-bottom:12px; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:10px;">
          <b style="font-size:0.85rem; color:var(--primary);">${c.name}</b>
          <p style="font-size:0.85rem; margin-top:4px; font-style:italic;">"${c.text}"</p>
        </div>
      `).join('')}
      <button onclick="toggleComments('${app.id}')" style="width:100%; padding:8px; background:none; border:none; color:var(--text-sub); font-size:0.8rem; cursor:pointer;">Collapse Reviews ▲</button>
    </div>

    <div class="app-actions" style="display:flex; gap:10px; margin-bottom:20px;">
      <button class="btn-install" style="flex: 1; padding: 15px;" onclick="window.open('${app.url}', '_blank')">Install Now</button>
      <button class="btn-open" style="flex: 1; padding: 15px;" onclick="window.open('${app.url}', '_blank')">Open Web App</button>
    </div>
    
    <div style="background:var(--card-bg); padding:15px; border-radius:12px; line-height: 1.6;">
      <h4 style="margin-bottom:10px;">About this app</h4>
      <p>${app.desc}</p>
    </div>
  `;

  document.getElementById('detail-view-content').innerHTML = content;

  // Render Related Apps from same category
  const related = allApps.filter(a => a.category === app.category && a.id !== app.id);
  document.getElementById('related-apps-list').innerHTML = 
    related.length > 0 ? createVerticalList(related) : `<p class="sub-text">No other apps in this category yet.</p>`;

  showView('app-detail-view');
}

// Function to hide/show comments
function toggleComments(appId) {
    const section = document.getElementById(`comments-list-${appId}`);
    section.style.display = (section.style.display === "none") ? "block" : "none";
}

// 7. SEARCH SYSTEM (Real-time Filtering)
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (term.length === 0) {
      showView('home-view');
      return;
    }

    // Filter Categories
    const foundCats = categoriesData.filter(c => c.name.toLowerCase().includes(term));
    const catHtml = foundCats.map(c => `
      <div class="category-card" style="margin-bottom:10px;" onclick="openCategory('${c.id}')">
        • ${c.name}
      </div>
    `).join('');
    document.getElementById('search-cat-list').innerHTML = catHtml || '<p class="sub-text">No matching categories.</p>';

    // Filter Apps
    const foundApps = allApps.filter(a => 
      a.title.toLowerCase().includes(term) || 
      a.category.toLowerCase().includes(term) ||
      a.desc.toLowerCase().includes(term)
    );
    document.getElementById('search-app-list').innerHTML = foundApps.length > 0 ? createVerticalList(foundApps) : '<p class="sub-text">No apps found matching your search.</p>';

    showView('search-view');
  });
}

// 8. THEME MANAGEMENT
function setupThemeSwitcher() {
  const selector = document.getElementById('theme-select');
  if (!selector) return;

  selector.addEventListener('change', (e) => {
    document.body.setAttribute('data-theme', e.target.value);
    // Save preference to browser
    localStorage.setItem('suleiman-store-theme', e.target.value);
  });

  // Load saved theme
  const savedTheme = localStorage.getItem('suleiman-store-theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    selector.value = savedTheme;
  }
}
