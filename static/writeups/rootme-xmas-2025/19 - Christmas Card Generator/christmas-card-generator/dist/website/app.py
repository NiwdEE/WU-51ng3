from flask import Flask, jsonify, redirect, request, render_template, send_file, session, url_for
import ada_url
import base64
import os
import re
import requests
import string

app = Flask(__name__)
app.secret_key = os.urandom(16)

app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 # 1 MB
app.config['CDN_UPLOAD_SECRET'] = os.environ.get('CDN_UPLOAD_SECRET', 'changeme')
app.config['CDN_URL'] = os.environ.get('CDN_URL', 'http://cdn')

app.config['AVAILABLE_THEMES'] = ['default', 'santa', 'snow', 'night', 'gingerbread', 'christmas']
app.config['ALLOWED_EXTENSIONS'] = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp'
}

def check_filename(filename):
    allowed = set(string.ascii_letters + string.digits + '-_.()')
    if not all(c in allowed for c in filename):
        return False
    if '.' not in filename:
        return False
    extension = filename.split('.')[1]
    if extension not in app.config['ALLOWED_EXTENSIONS']:
        return False
    return True

def render_card(card):
    card = re.sub(r'\[img\|([^\]]+)\]',
        r'<img src="\1" />',
        card)
    card = re.sub(r'\[style\|([^\]]+)\]',
        r'<link rel="stylesheet" href="\1" />',
        card)
    card = card.replace('\n', '<br />')
    return card

def check_card(card):
    allowed = set(string.printable) - set(['<', '>'])
    if not all(c in allowed for c in card):
        return False
    if card.count('[style|') > 1:
        return False
    return True

@app.before_request
def set_user_id():
    if 'user_id' not in session:
        session['user_id'] = '-'.join([f'{b:02x}' for b in os.urandom(8)])

@app.after_request
def security_headers(resp):
    resp.headers['Content-Security-Policy'] = '; '.join([
        "default-src 'none'",
        f"style-src 'self' {app.config['CDN_URL']}/official/",
        f"img-src 'self' {app.config['CDN_URL']}",
        f"connect-src 'self' {app.config['CDN_URL']}",
        "script-src 'sha256-4dkBexWUN1kvEY39ZfSRO3NW9fvOXpPi4R/k+mTSyzs=' 'sha256-fIACdD+gL7Uh5HUydVkdc0e92wyRmyNB+gIzlu82cnA='",
        "base-uri 'none'"
    ])
    resp.headers['X-Frame-Options'] = 'SAMEORIGIN'
    resp.headers['X-Content-Type-Options'] = 'nosniff'
    return resp

@app.route('/favicon.ico')
def favicon():
    return redirect(f"{app.config['CDN_URL']}/official/favicon.ico")

@app.route('/')
def index():
    allowed_extensions = ', '.join([ext for ext in app.config['ALLOWED_EXTENSIONS'].keys()]).upper()
    accept_extensions = ','.join([ext for ext in app.config['ALLOWED_EXTENSIONS'].values()])
    return render_template('index.j2', cdn_url=app.config['CDN_URL'], user_id=session['user_id'],
        allowed_extensions=allowed_extensions, accept_extensions=accept_extensions,
        themes=app.config['AVAILABLE_THEMES'])

@app.route('/upload_image', methods=['POST'])
def post_upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not check_filename(file.filename):
        allowed_extensions = ', '.join([ext for ext in app.config['ALLOWED_EXTENSIONS'].keys()]).upper()
        return jsonify({'error': f"Invalid filename. Allowed extensions: {allowed_extensions}"}), 400
    if 'cdn' not in request.form or not request.form['cdn'].startswith(app.config['CDN_URL']):
        return jsonify({'error': 'Invalid CDN'}), 400
    extension = file.filename.split('.')[1]
    content_type = app.config['ALLOWED_EXTENSIONS'][extension]
    user_id = session['user_id']
    try:
        image_url = f"{request.form['cdn']}/uploads/{user_id}/{file.filename}"
        headers = {
            'X-Upload-Key': app.config['CDN_UPLOAD_SECRET'],
            'Content-Type': content_type
        }
        response = requests.post(
            image_url,
            data=file.read(),
            headers=headers
        )
        if response.status_code == 200:
            return response.json(), 200
        try:
            return jsonify({'error': f"CDN upload failed: {response.json()['error']}"}), 500
        except Exception:
            return jsonify({'error': f"CDN upload failed: {response.text}"})
    except Exception as e:
        return jsonify({'error': f'CDN upload failed: {e}'}), 500

@app.route('/generate_card', methods=['POST'])
def generate_card():
    try:
        card = request.form['card']
    except Exception:
        return 'Missing card', 400
    if not check_card(card):
        return 'Invalid card', 400
    theme = request.form.get('theme', 'default')
    return redirect(f"{url_for('view_card')}?data={base64.b64encode(card.encode('utf-8')).decode()}&theme={theme}")

@app.route('/view_card')
def view_card():
    card_data = request.args.get('data', '')
    if not card_data:
        return redirect('/')
    try:
        card = base64.b64decode(card_data).decode('utf-8')
    except Exception:
        return 'Invalid card', 400
    if not check_card(card):
        return 'Invalid card', 400
    theme = request.args.get('theme', 'default')
    if theme not in app.config['AVAILABLE_THEMES']:
        theme = 'default'
    card = f'{card}[style|{app.config['CDN_URL']}/official/card.{theme}.css]'
    return render_template('card.j2', card=render_card(card), theme=theme,
        cdn_url=app.config['CDN_URL'], user_id=session['user_id'])

@app.route('/search')
def search_route():
    search = request.args.get('search', '?q=santa')
    search = search.replace('\\', '/').strip()
    if '//' in search or ':/' in search:
        return 'Invalid search', 403
    try:
        location = ada_url.join_url('https://duckduckgo.com/', search)
        return redirect(location)
    except ValueError:
        return 'Invalid search', 403

if __name__ == '__main__':
    app.run(debug=True)
