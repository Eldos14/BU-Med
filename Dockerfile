# Этап 1: Сборка фронтенда (React)
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Этап 2: Сборка бэкенда (Laravel)
FROM php:8.2-apache
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql

# Настройка Apache под Laravel
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

WORKDIR /var/www/html
COPY . .
# Правильное копирование собранного React
COPY --from=frontend-builder /app/public/build ./public/build

# Правильное копирование Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# Права доступа
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Создаем пустой файл SQLite базы данных и запускаем миграции
RUN touch /var/www/html/database/database.sqlite \
    && chown www-data:www-data /var/www/html/database/database.sqlite \
    && chmod 775 /var/www/html/database/database.sqlite

EXPOSE 80
CMD php artisan migrate --force && apache2-foreground
