FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip nodejs npm \
    libzip-dev libpng-dev libonig-dev \
    libxml2-dev libcurl4-openssl-dev \
    && docker-php-ext-install \
    pdo pdo_mysql mbstring zip exif pcntl bcmath gd curl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy all project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Install Node dependencies and build frontend (FORCE FRESH INSTALL)
RUN rm -rf node_modules package-lock.json \
    && npm install && npm run build

# Set storage permissions
RUN chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Cache Laravel configs
RUN php artisan config:cache || true \
    && php artisan route:cache || true \
    && php artisan view:cache || true

EXPOSE 10000

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000