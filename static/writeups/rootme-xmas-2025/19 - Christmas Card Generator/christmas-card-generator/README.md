# Christmas card generator

Please read this to setup the challenge smoothly.

## Local setup

Build and start the three docker containers.

```bash
docker compose up --build
```

When the containers are running, execute the following command and append your `/etc/hosts` file with the output.

```bash
for container in cdn website bot; do echo "$(docker inspect "$(docker compose ps | grep $container | cut -d' ' -f 1)" | grep IPAddress | cut -d'"' -f 4)    $container"; done

Example:
172.22.0.2    cdn
172.22.0.3    website
172.22.0.4    bot
```

You should now be able to access http://website, http://cdn and http://bot in your browser.

## Local / Remote difference

The remote environment where you can get the real flag is almost identical to your local environment. The Docker containers are the same. The only differences are:

- The files `env-bot.env` and `env-target.env` are configured with the remote `WEBSITE_URL` and `CDN_URL` set to https://cardgenerator.challenges.xmas.root-me.org and https://cardgenerator-cdn.challenges.xmas.root-me.org. The `CDN_UPLOAD_SECRET` and the flag are also different.
- A reverse proxy forwards the HTTP trafic to the website and cdn containers.
- Each player gets their own bot container instance.

The official solution was tested in both the local HTTP and remote HTTPs environments. Good luck and don't forget to share your Christmas cards.
