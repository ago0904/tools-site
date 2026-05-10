// 标签页切换
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + link.dataset.tab).classList.add('active');
    if (link.dataset.tab === 'tools') loadToolStats();
    if (link.dataset.tab === 'pages') loadPageStats();
    if (link.dataset.tab === 'logs') loadLogs();
  });
});

let trendChart, toolsChart;

async function loadDashboard() {
  try {
    const res = await fetch('/api/stats/dashboard');
    const data = await res.json();
    document.getElementById('totalVisits').textContent = data.totalVisits.toLocaleString();
    document.getElementById('uniqueVisitors').textContent = data.uniqueVisitors.toLocaleString();
    document.getElementById('totalTools').textContent = data.toolStats.length;
    const today = data.dailyTrend.find(d => d.date === new Date().toISOString().split('T')[0]);
    document.getElementById('todayVisits').textContent = (today?.count || 0).toLocaleString();

    // 趋势图
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: data.dailyTrend.map(d => d.date.slice(5)),
        datasets: [{
          label: '访问量',
          data: data.dailyTrend.map(d => d.count),
          borderColor: '#4a90d9',
          backgroundColor: 'rgba(74,144,217,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });

    // 工具排行图
    const toolsCtx = document.getElementById('toolsChart').getContext('2d');
    if (toolsChart) toolsChart.destroy();
    toolsChart = new Chart(toolsCtx, {
      type: 'bar',
      data: {
        labels: data.toolStats.map(t => t.tool_name),
        datasets: [{
          label: '使用次数',
          data: data.toolStats.map(t => t.count),
          backgroundColor: ['#4a90d9', '#50c878', '#9b59b6', '#f39c12', '#e74c3c', '#1abc9c', '#34495e', '#e91e63', '#00bcd4', '#8bc34a']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  } catch (e) { console.error('Dashboard load failed', e); }
}

async function loadToolStats() {
  try {
    const res = await fetch('/api/stats/tools');
    const data = await res.json();
    const tbody = document.getElementById('toolsTable');
    tbody.innerHTML = data.map(row => `
      <tr>
        <td>${row.tool_name}</td>
        <td>${row.total_uses}</td>
        <td>${row.unique_users}</td>
        <td>${row.last_used || '-'}</td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

async function loadPageStats() {
  try {
    const res = await fetch('/api/stats/pages');
    const data = await res.json();
    const tbody = document.getElementById('pagesTable');
    tbody.innerHTML = data.map(row => `
      <tr>
        <td>${row.page}</td>
        <td>${row.views}</td>
        <td>${row.unique_ips}</td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

async function loadLogs() {
  try {
    const res = await fetch('/api/stats/logs?limit=100');
    const data = await res.json();
    const tbody = document.getElementById('logsTable');
    tbody.innerHTML = data.map(row => `
      <tr>
        <td>${row.created_at}</td>
        <td>${row.tool_name}</td>
        <td>${row.action}</td>
        <td>${row.ip}</td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

// 初始化
loadDashboard();
setInterval(loadDashboard, 30000);
setInterval(() => {
  if (document.getElementById('tab-logs').classList.contains('active')) loadLogs();
}, 10000);
