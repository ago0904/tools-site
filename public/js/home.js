// ===== Home Page Logic =====
function renderHome() {
  renderSidebar('');
  renderRecentBar('recentBar');
  renderCategories();
}

function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;

  grid.innerHTML = TOOL_CATEGORIES.map(cat => `
    <div class="category-card">
      <div class="category-header">
        <div class="category-icon" style="background:${cat.color}20;color:${cat.color}">${cat.icon}</div>
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.tools.length} 个</div>
      </div>
      <div class="category-tools">
        ${cat.tools.map(t => `
          <a href="/tools/${t.id}.html" class="tool-link" onclick="addRecentTool('${t.id}', '${t.name}')">
            <span class="t-icon">${t.icon}</span>
            <span>${t.name}</span>
            <span style="margin-left:auto;font-size:11px;color:var(--text-muted)">${t.desc}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ===== Tool Page Common Layout =====
function renderToolPage(toolId, toolName, categoryId) {
  renderSidebar(toolId);
  addRecentTool(toolId, toolName);
  logPageView('tool:' + toolId);

  // Set topbar title
  const topbarTitle = document.querySelector('.topbar-title');
  if (topbarTitle) topbarTitle.textContent = toolName;
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', renderHome);
