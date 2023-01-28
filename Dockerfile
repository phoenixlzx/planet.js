FROM    node:alpine

WORKDIR /var/www/html

COPY    ["docker/", "/"]
RUN     apk add --no-cache nginx python3 \
        make g++ && \
        chmod +x /entrypoint.sh && \
        mkdir -p /run/nginx && \
        rm -f /etc/nginx/http.d/default.conf && \
        mkdir -p /config && \
        npm install -g planet.js --unsafe-perm && \
        planet i && \
        chown -R node /var/www/html && \
        apk del make g++

EXPOSE 80

ENTRYPOINT  ["/bin/sh", "/entrypoint.sh"]
