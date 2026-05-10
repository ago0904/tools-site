// ===== Tool Categories & Data =====
const TOOL_CATEGORIES = [
  {
    id: 'json',
    name: 'JSON 工具',
    icon: '📋',
    color: '#3fb950',
    tools: [
      { id: 'json', name: 'JSON 格式化', icon: '✨', desc: '美化、验证、压缩、树形查看' },
      { id: 'json2code', name: 'JSON 转代码', icon: '💻', desc: '生成 TypeScript/Java/Go/Python 接口' },
      { id: 'json2xml', name: 'JSON/XML 互转', icon: '⇄', desc: 'JSON 与 XML 格式互转' },
      { id: 'jsonschema', name: 'JSON Schema', icon: '📐', desc: '生成 JSON Schema 校验规则' },
    ]
  },
  {
    id: 'encode',
    name: '编码加密',
    icon: '🔐',
    color: '#a371f7',
    tools: [
      { id: 'base64', name: 'Base64', icon: '🔢', desc: '文本与 Base64 互转' },
      { id: 'url', name: 'URL 编码', icon: '🔗', desc: 'URL 编解码、参数解析' },
      { id: 'hash', name: '哈希计算', icon: '#️⃣', desc: 'MD5、SHA-1、SHA-256 等' },
      { id: 'jwt', name: 'JWT 解析', icon: '🎫', desc: 'JWT Token 解码与验证' },
      { id: 'aes', name: 'AES 加解密', icon: '🛡️', desc: 'AES 对称加密' },
    ]
  },
  {
    id: 'format',
    name: '代码格式化',
    icon: '🎨',
    color: '#58a6ff',
    tools: [
      { id: 'jsformat', name: 'JS/HTML 格式化', icon: '📜', desc: 'JavaScript / HTML 美化压缩' },
      { id: 'cssformat', name: 'CSS 格式化', icon: '🎨', desc: 'CSS / SCSS 美化压缩' },
      { id: 'sqlformat', name: 'SQL 格式化', icon: '🗄️', desc: 'SQL 语句美化与压缩' },
      { id: 'xmlformat', name: 'XML 格式化', icon: '📄', desc: 'XML 美化与压缩' },
    ]
  },
  {
    id: 'net',
    name: '网络工具',
    icon: '🌐',
    color: '#d29922',
    tools: [
      { id: 'http', name: 'HTTP 请求', icon: '📡', desc: '在线发送 HTTP 请求测试' },
      { id: 'ip', name: 'IP 查询', icon: '📍', desc: '查询本机 IP 与地理位置' },
      { id: 'dns', name: 'DNS 查询', icon: '🔍', desc: '域名 DNS 记录查询' },
    ]
  },
  {
    id: 'text',
    name: '文本处理',
    icon: '📝',
    color: '#f778ba',
    tools: [
      { id: 'diff', name: '文本对比', icon: '🔀', desc: '两段文本差异高亮对比' },
      { id: 'regex', name: '正则测试', icon: '🔎', desc: '实时匹配、替换、提取' },
      { id: 'text', name: '文本工具箱', icon: '🧰', desc: '去重、排序、统计、替换' },
      { id: 'markdown', name: 'Markdown', icon: '📃', desc: 'Markdown 实时预览' },
    ]
  },
  {
    id: 'convert',
    name: '转换工具',
    icon: '⚙️',
    color: '#79c0ff',
    tools: [
      { id: 'timestamp', name: '时间戳', icon: '⏰', desc: '时间戳与日期互转' },
      { id: 'color', name: '颜色转换', icon: '🎨', desc: 'HEX / RGB / HSL 互转' },
      { id: 'unit', name: '单位换算', icon: '📏', desc: '长度、重量、温度、存储' },
      { id: 'base', name: '进制转换', icon: '🔢', desc: '二、八、十、十六进制互转' },
    ]
  },
  {
    id: 'gen',
    name: '生成器',
    icon: '⚡',
    color: '#3fb950',
    tools: [
      { id: 'password', name: '密码生成', icon: '🔑', desc: '随机强密码生成器' },
      { id: 'uuid', name: 'UUID', icon: '🆔', desc: '批量生成 UUID/GUID' },
      { id: 'qrcode', name: '二维码', icon: '▪️', desc: '文本/URL 转二维码' },
      { id: 'barcode', name: '条形码', icon: '┃', desc: '生成 Code128 条形码' },
      { id: 'lorem', name: '假文生成', icon: '📄', desc: 'Lorem Ipsum 占位文本' },
      { id: 'cron', name: 'Cron 表达式', icon: '⏱️', desc: '生成与解析 Cron 规则' },
    ]
  },
];

// ===== Common Functions =====
function renderSidebar(activeToolId) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let html = `
    <div class="sidebar-header">
      <a href="/">
        <div class="sidebar-logo">
          <div class="logo-icon">🛠️</div>
          <span>DevTools</span>
        </div>
        <div class="sidebar-version">v2.0</div>
      </a>
    </div>
  `;

  TOOL_CATEGORIES.forEach(cat => {
    const hasActive = cat.tools.some(t => t.id === activeToolId);
    html += `
      <div class="nav-section ${hasActive ? '' : 'collapsed'}">
        <div class="nav-title" onclick="toggleNav(this)">
          <span>${cat.icon} ${cat.name}</span>
          <span class="chevron">▼</span>
        </div>
        <ul class="nav-items">
          ${cat.tools.map(t => `
            <li>
              <a href="/tools/${t.id}.html" class="${t.id === activeToolId ? 'active' : ''}">
                <span class="icon">${t.icon}</span>
                <span>${t.name}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });

  sidebar.innerHTML = html;
}

function toggleNav(el) {
  el.parentElement.classList.toggle('collapsed');
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('已复制到剪贴板');
  }
}

function showToast(message, duration = 2000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function logPageView(page) {
  fetch('/api/log/page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page })
  }).catch(() => {});
}

function logToolUsage(tool, action = 'use') {
  fetch('/api/log/tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, action })
  }).catch(() => {});
}

// ===== Recent Tools =====
function getRecentTools() {
  try {
    return JSON.parse(localStorage.getItem('recent_tools') || '[]');
  } catch { return []; }
}

function addRecentTool(toolId, toolName) {
  let recent = getRecentTools();
  recent = recent.filter(r => r.id !== toolId);
  recent.unshift({ id: toolId, name: toolName, time: Date.now() });
  recent = recent.slice(0, 8);
  localStorage.setItem('recent_tools', JSON.stringify(recent));
}

function renderRecentBar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const recent = getRecentTools();
  if (recent.length === 0) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';
  container.innerHTML = '<span style="color:var(--text-muted);font-size:12px;margin-right:4px;">最近使用：</span>' +
    recent.map(r => `<a href="/tools/${r.id}.html" class="recent-chip">${r.name}</a>`).join('');
}
