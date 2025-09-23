FROM node:23-alpine3.20

WORKDIR /usr/src/app/

# Installiere curl
RUN apk add --no-cache curl

# Installiere globale NPM-Pakete
RUN npm install -g npm@^11 pm2 tslib --no-audit --no-fund

# Kopiere Package-Dateien für besseres Caching
COPY package.json package-lock.json .npmrc ./

# NPM-Installation mit erweiterten Timeouts
RUN npm install --ignore-engines

# Umgebungsvariablen
ENV NODE_ENV=production \
    APP_NAME='' \
    PORT='3003' \
    PORT_SSR='3004' \
    APP_DEFAULT_USER='user@pen2class.ch' \
    APP_DEFAULT_PASSWORD='12345678' \
    APP_SECRET='' \
    APP_AUTH_URL_BASE="" \
    APP_AUTH_RESET_URL_BASE="" \
    APP_ENV='development' \
    APP_UI_PATH='app' \
    API_ACCESS_CONTROL_ORIGIN="*" \
    APP_SECRET_IGNORE_EXPIRATION=1 \
    APP_SWAGGER_DISABLED=1 \
    TZ='UTC' \
    LOG_LEVEL='0' \
    DB_TYPE='mysql' \
    DB_HOST='' \
    DB_PORT='' \
    DB_USERNAME='' \
    DB_PASSWORD='' \
    DB_DATABASE=''

# Kopiere Anwendungsdateien
COPY ./dist/apps/api ./dist/api/
COPY ./dist/apps/app ./dist/app/
COPY ./dist/apps/landing-page ./dist/public/
COPY ./config ./config/
COPY ./ecosystem.config.js ./


# Setze korrekten Besitzer und Berechtigungen
RUN mkdir /usr/src/app/storage
RUN chown -R node:node /usr/src/app
RUN chown -R node:node /usr/src/app/storage

USER node

# Expose Ports
EXPOSE 3003 3004 3005 3006 80 443

# Health Check (optional aktivieren)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
#     CMD curl -f http://localhost:3003/health || exit 1

# Startup Command
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
