import os
import sqlite3

DB_PATH = './db/cdn.db'

CONNECTION = None
def connect():
    global CONNECTION
    reconnect = False
    if not CONNECTION:
        reconnect = True
    else:
        try:
            cursor = CONNECTION.cursor()
            cursor.close()
        except Exception as ex:
            reconnect = True
    if reconnect:
        try:
            CONNECTION.close()
        except:
            pass
        CONNECTION = sqlite3.connect(DB_PATH)
        CONNECTION.row_factory = sqlite3.Row
    return CONNECTION

def init_db():
    if not os.path.exists(DB_PATH):
        os.mknod(DB_PATH)
    con = connect()
    with con:
        con.execute('''CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            safe_filename TEXT NOT NULL,
            content_type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, filename)
        )''')

def add_file(user_id, filename, safe_filename, content_type):
    con = connect()
    with con:
        con.execute('''INSERT OR REPLACE INTO files (user_id, filename, safe_filename, content_type)
            VALUES (?, ?, ?, ?)''', (user_id, filename, safe_filename, content_type))

def get_file(user_id, filename):
    con = connect()
    with con:
        file = con.execute('SELECT * FROM files WHERE user_id = ? AND filename = ?',
            (user_id, filename,)).fetchone()
    if not file:
        return None
    return dict(file)

def get_all_files():
    con = connect()
    with con:
        files = con.execute('SELECT * FROM files').fetchall()
    return [dict(f) for f in files]

def get_user_files(user_id):
    con = connect()
    with con:
        files = con.execute('SELECT * FROM files WHERE user_id = ?', (user_id,)).fetchall()
    return [dict(f) for f in files]

def get_user_recent_files(user_id, limit):
    con = connect()
    with con:
        files = con.execute('''SELECT * FROM files WHERE user_id = ?
            ORDER BY created_at DESC LIMIT ?''', (user_id, limit)).fetchall()
    return [dict(f) for f in files]

def delete_file(user_id, filename):
    con = connect()
    with con:
        file = con.execute('DELETE FROM files WHERE user_id = ? AND filename = ?', (user_id, filename,))

def count_files():
    con = connect()
    with con:
        count = int(con.execute('SELECT COUNT(*) FROM files').fetchone()[0])
    return count
