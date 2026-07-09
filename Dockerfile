FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Install Dependencies PHP
FROM composer:2.7 AS vendor
WORKDIR /app
COPY database/ database/
COPY composer.json composer.lock ./
RUN composer install --no-dev --ignore-platform-reqs --no-interaction --prefer-dist --optimize-autoloader

# Stage 3: Final Production Image (FrankenPHP)
FROM dunglas/frankenphp:php8.4-alpine
WORKDIR /app

RUN install-php-extensions pdo_mysql gd zip opcache pcntl redis

COPY . .

COPY --from=vendor /app/vendor/ ./vendor/
COPY --from=frontend /app/public/build/ ./public/build/

RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

# optimize but not config
RUN php artisan optimize && php artisan storage:link && php artisan config:clear

EXPOSE 80
EXPOSE 443
EXPOSE 443/udp

CMD ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=80"]
