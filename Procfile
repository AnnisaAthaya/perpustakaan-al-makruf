web: vendor/bin/heroku-php-apache2 public/
release: php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan wayfinder:generate && php artisan migrate --force
