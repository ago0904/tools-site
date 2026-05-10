const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'stats.db');
const db = new sqlite3.Database(dbPath);

// 初始化表
db.serialize(() => {
  // 工具使用统计
  db.run(`CREATE TABLE IF NOT EXISTS tool_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT NOT NULL,
    action TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 每日汇总
  db.run(`CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    total_visits INTEGER DEFAULT 0,
    unique_ips INTEGER DEFAULT 0
  )`);

  // 页面访问记录
  db.run(`CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = {
  // 记录工具使用
  logToolUsage(toolName, action, ip, ua) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO tool_stats (tool_name, action, ip, user_agent) VALUES (?, ?, ?, ?)',
        [toolName, action, ip, ua],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // 记录页面访问
  logPageView(page, ip, ua) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO page_views (page, ip, user_agent) VALUES (?, ?, ?)',
        [page, ip, ua],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  // 获取仪表盘数据
  getDashboard() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total_visits FROM page_views', [], (err, total) => {
        if (err) return reject(err);
        db.get('SELECT COUNT(DISTINCT ip) as unique_ips FROM page_views', [], (err2, unique) => {
          if (err2) return reject(err2);
          db.all('SELECT tool_name, COUNT(*) as count FROM tool_stats GROUP BY tool_name ORDER BY count DESC LIMIT 10', [], (err3, tools) => {
            if (err3) return reject(err3);
            db.all(`SELECT date(created_at) as date, COUNT(*) as count 
                    FROM page_views 
                    WHERE created_at >= date('now', '-7 days') 
                    GROUP BY date(created_at) 
                    ORDER BY date`, [], (err4, trend) => {
              if (err4) return reject(err4);
              resolve({
                totalVisits: total?.total_visits || 0,
                uniqueVisitors: unique?.unique_ips || 0,
                toolStats: tools,
                dailyTrend: trend
              });
            });
          });
        });
      });
    });
  },

  // 获取所有工具统计
  getToolStats() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          tool_name,
          COUNT(*) as total_uses,
          COUNT(DISTINCT ip) as unique_users,
          MAX(created_at) as last_used
        FROM tool_stats 
        GROUP BY tool_name 
        ORDER BY total_uses DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // 获取实时日志
  getRecentLogs(limit = 50) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM tool_stats 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // 获取页面访问统计
  getPageStats() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT page, COUNT(*) as views, COUNT(DISTINCT ip) as unique_ips
        FROM page_views 
        GROUP BY page 
        ORDER BY views DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
