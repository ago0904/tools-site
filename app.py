from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import db

app = Flask(__name__, static_folder='public')
CORS(app)

def get_client_ip():
    forwarded = request.headers.get('X-Forwarded-For', '')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.remote_addr or 'unknown'

# 静态文件服务
@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/admin')
def admin():
    return send_from_directory('admin', 'index.html')

@app.route('/admin/<path:path>')
def admin_static(path):
    return send_from_directory('admin', path)

@app.route('/css/<path:path>')
def css(path):
    return send_from_directory('public/css', path)

@app.route('/js/<path:path>')
def js(path):
    return send_from_directory('public/js', path)

@app.route('/tools/<path:path>')
def tools(path):
    return send_from_directory('public/tools', path)

# API 路由
@app.route('/api/log/tool', methods=['POST'])
def log_tool():
    data = request.get_json() or {}
    db.log_tool_usage(
        data.get('toolName', ''),
        data.get('action', ''),
        get_client_ip(),
        request.headers.get('User-Agent', '')
    )
    return jsonify({'success': True})

@app.route('/api/log/page', methods=['POST'])
def log_page():
    data = request.get_json() or {}
    db.log_page_view(
        data.get('page', ''),
        get_client_ip(),
        request.headers.get('User-Agent', '')
    )
    return jsonify({'success': True})

@app.route('/api/stats/dashboard')
def dashboard():
    return jsonify(db.get_dashboard())

@app.route('/api/stats/tools')
def tool_stats():
    return jsonify(db.get_tool_stats())

@app.route('/api/stats/pages')
def page_stats():
    return jsonify(db.get_page_stats())

@app.route('/api/stats/logs')
def logs():
    limit = request.args.get('limit', 50, type=int)
    return jsonify(db.get_recent_logs(limit))

if __name__ == '__main__':
    db.init_db()
    print("🛠️  Tools Site running at http://0.0.0.0:3456")
    print("📊 Admin Panel at http://0.0.0.0:3456/admin")
    app.run(host='0.0.0.0', port=3456, debug=False)
