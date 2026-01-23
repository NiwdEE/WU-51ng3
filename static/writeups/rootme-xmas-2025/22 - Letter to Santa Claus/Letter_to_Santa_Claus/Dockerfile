FROM alpine:3.20.3

# Init
RUN apk update && \
    apk add --no-cache php83 php83-apache2 apache2 php83-session

# Setup challenge user
RUN addgroup -S challenge && adduser -D -S challenge -G challenge

# Setup challenge
COPY ./conf/httpd.conf /etc/apache2/httpd.conf
COPY ./conf/vhost.conf /etc/apache2/sites-enabled/000-default.conf
COPY ./conf/php.ini /etc/php83/php.ini

COPY --chown=challenge:challenge ./src/ /var/www/html/

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./flag.txt /flag.txt

# Expose ports
EXPOSE 8080

# Start
ENTRYPOINT ["/entrypoint.sh"]