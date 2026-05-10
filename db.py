import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'db', 'stats.db')
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS tool_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tool_name TEXT NOT NULL,
                action TEXT,
                ip TEXT,
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS daily_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE,
                total_visits INTEGER DEFAULT 0,
                unique_ips INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS page_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page TEXT,
                ip TEXT,
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ''')

# 记录工具使用
def log_tool_usage(tool_name, action, ip, ua):
    with get_conn() as conn:
        conn.execute(
            'INSERT INTO tool_stats (tool_name, action, ip, user_agent) VALUES (?, ?, ?, ?)',
            (tool_name, action, ip, ua)
        )

# 记录页面访问
def log_page_view(page, ip, ua):
    with get_conn() as conn:
        conn.execute(
            'INSERT INTO page_views (page, ip, user_agent) VALUES (?, ?, ?)',
            (page, ip, ua)
        )

# 仪表盘数据
def get_dashboard():
    with get_conn() as conn:
        total = conn.execute('SELECT COUNT(*) as c FROM page_views').fetchone()['c']
        unique = conn.execute('SELECT COUNT(DISTINCT ip) as c FROM page_views').fetchone()['c']
        tools = conn.execute('''
            SELECT tool_name, COUNT(*) as count FROM tool_stats
            GROUP BY tool_name ORDER BY count DESC LIMIT 10
        ''').fetchall()
        trend = conn.execute('''
            SELECT date(created_at) as date, COUNT(*) as count
            FROM page_views
            WHERE created_at >= date('now', '-7 days')
            GROUP BY date(created_at) ORDER BY date
        ''').fetchall()
        return {
            'totalVisits': total or 0,
            'uniqueVisitors': unique or 0,
            'toolStats': [dict(r) for r in tools],
            'dailyTrend': [dict(r) for r in trend]
        }

# 工具统计
def get_tool_stats():
    with get_conn() as conn:
        rows = conn.execute('''
            SELECT tool_name, COUNT(*) as total_uses,
                   COUNT(DISTINCT ip) as unique_users,
                   MAX(created_at) as last_used
            FROM tool_stats GROUP BY tool_name ORDER BY total_uses DESC
        ''').fetchall()
        return [dict(r) for r in rows]

# 页面统计
def get_page_stats():
    with get_conn() as conn:
        rows = conn.execute('''
            SELECT page, COUNT(*) as views, COUNT(DISTINCT ip) as unique_ips
            FROM page_views GROUP BY page ORDER BY views DESC
        ''').fetchall()
        return [dict(r) for r in rows]

# 实时日志
def get_recent_logs(limit=50):
    with get_conn() as conn:
        rows = conn.execute(
            'SELECT * FROM tool_stats ORDER BY created_at DESC LIMIT ?',
            (limit,)
        ).fetchall()
        return [dict(r) for r in rows]
