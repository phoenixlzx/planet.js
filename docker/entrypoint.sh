#!/bin/sh
CONFIG_FILE="/config/config.yml"
if [ ! -s ${CONFIG_FILE} ]; then
    echo "configuration not found at /config/config.yml..."
    echo "Please mount your configuration at /config/config.yml!"
    echo "Exiting..."
    exit 1
else
    cp ${CONFIG_FILE} /var/www/html/config.yml
    su node -c planet /var/www/html/config.yml
fi

if [ -z ${REFRESH_INTERVAL} ]; then
    REFRESH_INTERVAL="30" # In Minutes
fi

CRON_COMMAND="*/${REFRESH_INTERVAL} * * * * su node -c planet"
echo "${CRON_COMMAND}" >> /etc/crontabs/root

crond
nginx -g "daemon off;"
