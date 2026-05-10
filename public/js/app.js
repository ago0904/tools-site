// 搜索过滤
document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('search');
  const grid = document.getElementById('toolsGrid');
  if (!search || !grid) return;

  // 记录页面访问
  fetch('/api/log/page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: location.pathname })
  }).catch(() => {});

  search.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const cards = grid.querySelectorAll('.tool-card');
    cards.forEach(card => {
      const name = card.dataset.name || '';
      const text = card.textContent.toLowerCase();
      card.classList.toggle('hidden', q && !name.includes(q) && !text.includes(q));
    });
  });
});

// 工具页面通用：记录工具使用
function logTool(toolName, action = 'use') {
  fetch('/api/log/tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toolName, action })
  }).catch(() => {});
}
