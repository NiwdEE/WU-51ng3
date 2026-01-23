from flask import Flask, request, send_from_directory
import tempfile, os, subprocess, shutil, uuid

app = Flask(__name__, static_url_path="", static_folder="static")

UPLOAD_ROOT = "/app/uploads"

@app.get("/")
def index():
    return send_from_directory("static", "index.html")


@app.post("/upload")
def upload():
    if "file" not in request.files:
        return "Missing file", 400

    session_id = uuid.uuid4().hex
    session_dir = os.path.join(UPLOAD_ROOT, session_id)
    os.makedirs(session_dir, mode=0o700)

    bmp_path = os.path.join(session_dir, "input.bmp")
    request.files["file"].save(bmp_path)

    try:
        result = subprocess.run(
            ["./chall", bmp_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=3
        )
    except Exception as e:
        return str(e), 500

    shutil.rmtree(session_dir)

    return (result.stdout + result.stderr).decode('charmap')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
