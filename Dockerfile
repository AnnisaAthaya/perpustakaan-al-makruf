FROM node:20-alpine AS frontend
WORKDIR /app

# Mengaktifkan pnpm melalui Corepack bawaan Node.js
RUN corepack enable pnpm

# Salin definisi dependencies (Pastikan menyalin pnpm-lock.yaml)
COPY package.json pnpm-lock.yaml ./

# Install dependensi secara ketat tanpa mengubah file lock
RUN pnpm install --frozen-lockfile

# Salin sisa kode aplikasi dan jalankan kompilasi Vite
COPY . .
RUN pnpm run build

# Stage 2: Install Dependencies PHP
FROM composer:2.7 AS vendor
WORKDIR /app
COPY database/ database/
COPY composer.json composer.lock ./
RUN composer install --no-dev --ignore-platform-reqs --no-interaction --prefer-dist --optimize-autoloader

# Stage 3: Final Production Image (FrankenPHP)
FROM dunglas/frankenphp:php8.4-alpine
WORKDIR /app

# Menginstal ekstensi sistem dan PHP yang dibutuhkan melalui installer FrankenPHP
RUN install-php-extensions pdo_mysql gd zip opcache pcntl redis

# Copy kode aplikasi dasar
COPY . .

# Ambil hasil build dari stage vendor dan frontend
COPY --from=vendor /app/vendor/ ./vendor/
COPY --from=frontend /app/public/build/ ./public/build/

# Atur permission agar aman dan bisa ditulis oleh FrankenPHP/Caddy
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

RUN php artisan optimize \
    && php artisan storage:link

# Buka port yang diperlukan (HTTP, HTTPS, HTTP/3 UDP)
EXPOSE 80
EXPOSE 443
EXPOSE 443/udp

# Jalankan server menggunakan Octane
CMD ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=80"]
