from flask import Flask, jsonify, request, send_from_directory
import database
import os
import re
import uuid

app = Flask(__name__)

app.config['WEBSITE_URL'] = os.environ.get('WEBSITE_URL', 'http://website')

app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 # 1 MB
app.config['CDN_UPLOAD_SECRET'] = os.environ.get('CDN_UPLOAD_SECRET', 'changeme')

database.init_db()

def check_upload_auth():
    auth_header = request.headers.get('X-Upload-Key')
    if auth_header != app.config['CDN_UPLOAD_SECRET']:
        return False
    return True

def validate_user_id(user_id):
    if len(user_id) > 64:
        return False
    if not user_id or not re.match(r'^[a-zA-Z0-9_-]+$', user_id):
        return False
    return True

@app.after_request
def security_headers(resp):
    resp.headers['Access-Control-Allow-Origin'] = app.config['WEBSITE_URL']
    resp.headers['Content-Security-Policy'] = '; '.join([
        "default-src 'none'",
        "base-uri 'none'"
    ])
    return resp

@app.route('/')
def index():
    return '<!DOCTYPE html><html><head><title>CDN</title></head></html>'

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok'
    }), 200

@app.route('/favicon.ico')
def favicon():
    return '', 404

@app.route('/robots.txt')
def robots():
    return 'User-agent: *\nAllow: /\n', 200, {'Content-Type': 'text/plain'}

@app.route('/official/<path:filename>')
def official(filename):
    return send_from_directory('official', filename)

@app.route('/uploads/<user_id>/<path:filename>')
def get_uploads(user_id, filename):
    if not validate_user_id(user_id):
        return jsonify({'error': 'Invalid user_id'}), 400
    f = database.get_file(user_id, filename)
    if not f:
        return 'File not found', 404
    user_dir = os.path.join('/uploads', user_id)
    return send_from_directory(user_dir, f['safe_filename'], mimetype=f['content_type'])

@app.route('/uploads/<user_id>/<path:filename>', methods=['POST'])
def post_uploads(user_id, filename):
    if not check_upload_auth():
        return jsonify({'error': 'Unauthorized'}), 401
    if not validate_user_id(user_id):
        return jsonify({'error': 'Invalid user_id'}), 400
    database.delete_file(user_id, filename)
    file_content = request.get_data()
    content_type = request.content_type or 'application/octet-stream'
    safe_filename = str(uuid.uuid4())
    user_dir = os.path.join('/uploads', user_id)
    try:
        if not os.path.exists(user_dir):
            os.makedirs(user_dir, exist_ok=True)
        with open(os.path.join(user_dir, safe_filename), 'wb') as f:
            f.write(file_content)
    except OSError as e:
        # This is not part of the challenge, just a dirty way to restart the container and cleanup if we run out of space
        print(f'OSError: {e}')
        os.system('/usr/bin/pkill gunicorn')
    database.add_file(user_id, filename, safe_filename, content_type)
    return jsonify({
        'message': 'File uploaded successfully'
    }), 200

@app.route('/uploads/<user_id>/<path:filename>/delete')
def delete_uploads(user_id, filename):
    if check_upload_auth():
        return jsonify({'error': 'Unauthorized'}), 401
    if not validate_user_id(user_id):
        return jsonify({'error': 'Invalid user_id'}), 400
    f = database.get_file(user_id, filename)
    if not f:
        return jsonify({'error': 'File not found'}), 404
    safe_filename = f['safe_filename']
    database.delete_file(user_id, filename)
    try:
        file_path = os.path.join('/uploads', user_id, safe_filename)
        os.unlink(file_path)
    except Exception:
        pass
    return jsonify({'message': 'File deleted'}), 200

@app.route('/api/stats')
def stats():
    file_count = database.count_files()
    total_size = 0
    for f in database.get_all_files():
        file_path = os.path.join('/uploads', f['user_id'], f['safe_filename'])
        if os.path.exists(file_path):
            total_size += os.path.getsize(file_path)
    return jsonify({
        'total_files': file_count,
        'total_size_bytes': total_size
    }), 200

@app.route('/api/stats/<user_id>')
def user_stats(user_id):
    if not validate_user_id(user_id):
        return jsonify({'error': 'Invalid user_id'}), 400
    files = database.get_user_files(user_id)
    file_count = len(files)
    total_size = 0
    for f in files:
        file_path = os.path.join('/uploads', user_id, f['safe_filename'])
        if os.path.exists(file_path):
            total_size += os.path.getsize(file_path)
    return jsonify({
        'total_files': file_count,
        'total_size_bytes': total_size
    }), 200

@app.route('/api/files/<user_id>')
def list_user_files(user_id):
    if not validate_user_id(user_id):
        return jsonify({'error': 'Invalid user_id'}), 400
    files = database.get_user_files(user_id)
    return jsonify({
        'files': [{
            'filename': f['filename'],
            'content_type': f['content_type'],
            'uploaded_at': f['created_at'],
            'size': os.path.getsize(os.path.join('/uploads', user_id, f['safe_filename']))
                    if os.path.exists(os.path.join('/uploads', user_id, f['safe_filename'])) else 0
        } for f in files]
    }), 200

@app.route('/api/files/<user_id>/recent')
def recent_user_files(user_id):
    if not validate_user_id(user_id):
        return jsonify({'error': 'Invalid user_id'}), 400
    try:
        limit = int(request.args['limit'])
    except Exception:
        limit = 10
    limit = min(limit, 10)
    files = database.get_user_recent_files(user_id, limit)
    return jsonify({
        'files': [{
            'filename': f['filename'],
            'content_type': f['content_type'],
            'uploaded_at': f['created_at'],
            'size': os.path.getsize(os.path.join('/uploads', user_id, f['safe_filename']))
                    if os.path.exists(os.path.join('/uploads', user_id, f['safe_filename'])) else 0
        } for f in files]
    }), 200

@app.route('/official')
def list_official():
    files = []
    if os.path.exists('official'):
        for f in os.listdir('official'):
            if os.path.isfile(os.path.join('official', f)):
                files.append(f)
    return jsonify({'files': files}), 200

if __name__ == '__main__':
    app.run(debug=True)
