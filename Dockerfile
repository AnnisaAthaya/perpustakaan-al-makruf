# Stage 1: Install Dependencies PHP (dijalankan lebih dulu)
FROM composer:2.7 AS vendor
WORKDIR /app
COPY database/ database/
COPY composer.json composer.lock ./
RUN composer install --no-dev --ignore-platform-reqs --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Stage 2: Build Frontend (butuh PHP untuk wayfinder)
FROM node:20-alpine AS frontend
WORKDIR /app

# Install PHP CLI supaya artisan bisa dipanggil wayfinder plugin
RUN apk add --no-cache php84 php84-tokenizer php84-xml php84-mbstring php84-openssl php84-phar php84-ctype php84-json php84-dom \
    && ln -sf /usr/bin/php84 /usr/bin/php

# Aktifkan pnpm
RUN corepack enable pnpm

# Salin seluruh source code Laravel (wayfinder butuh routes, dll)
COPY . .

# Salin vendor hasil composer install dari stage sebelumnya
COPY --from=vendor /app/vendor/ ./vendor/

# Install dependencies node
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Generate APP_KEY dummy supaya artisan tidak error saat wayfinder jalan
RUN cp .env.example .env 2>/dev/null || true \
    && php artisan key:generate --ansi || true

# Build assets (wayfinder akan berhasil karena php + vendor + kode tersedia)
RUN pnpm run build

# Stage 3: Final Production Image (FrankenPHP)
FROM dunglas/frankenphp:php8.4-alpine
WORKDIR /app

RUN install-php-extensions pdo_mysql gd zip opcache pcntl redis

COPY . .
COPY --from=vendor /app/vendor/ ./vendor/
COPY --from=frontend /app/public/build/ ./public/build/

RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

RUN php artisan optimize \
    && php artisan storage:link

EXPOSE 80
EXPOSE 443
EXPOSE 443/udp

CMD ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=80"]
