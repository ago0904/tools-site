const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// 获取客户端 IP
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.socket.remoteAddress 
    || 'unknown';
}

// ===== API 路由 =====

// 记录工具使用
app.post('/api/log/tool', async (req, res) => {
  try {
    const { toolName, action } = req.body;
    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    await db.logToolUsage(toolName, action, ip, ua);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 记录页面访问
app.post('/api/log/page', async (req, res) => {
  try {
    const { page } = req.body;
    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    await db.logPageView(page, ip, ua);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 仪表盘数据
app.get('/api/stats/dashboard', async (req, res) => {
  try {
    const data = await db.getDashboard();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 工具统计
app.get('/api/stats/tools', async (req, res) => {
  try {
    const data = await db.getToolStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 页面统计
app.get('/api/stats/pages', async (req, res) => {
  try {
    const data = await db.getPageStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 实时日志
app.get('/api/stats/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data = await db.getRecentLogs(limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🛠️  Tools Site running at http://0.0.0.0:${PORT}`);
  console.log(`📊 Admin Panel at http://0.0.0.0:${PORT}/admin`);
});
