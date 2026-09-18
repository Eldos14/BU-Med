# Baishev Med

Веб-приложение на базе Laravel и React для медицинского проекта. Проект использует Laravel 12, Inertia.js, React, Vite и Tailwind CSS.

## Стек

- PHP 8.2+
- Laravel 12
- React 19
- Inertia.js
- Vite
- Tailwind CSS
- MySQL/PostgreSQL/SQLite (в зависимости от настроек проекта)

## Требования

Перед запуском убедитесь, что установлены:

- PHP 8.2 или выше
- Composer
- Node.js 18+ и npm
- СУБД, которую вы используете в проекте

## Установка

1. Перейдите в папку проекта:

    ```bash
    cd baishev_med
    ```

2. Установите PHP-зависимости:

    ```bash
    composer install
    ```

3. Установите зависимости фронтенда:

    ```bash
    npm install
    ```

4. Создайте файл окружения:

    ```bash
    cp .env.example .env
    ```

5. Сгенерируйте ключ приложения:

    ```bash
    php artisan key:generate
    ```

6. Настройте подключение к базе данных в файле `.env`.

7. Выполните миграции:

    ```bash
    php artisan migrate
    ```

8. При необходимости заполните базу данными:

    ```bash
    php artisan db:seed
    ```

## Запуск проекта

### Режим разработки

```bash
npm run dev
```

### Laravel API/сервер

```bash
php artisan serve
```

Обычно приложение запускается как связка Laravel + Vite, поэтому для локальной разработки удобно использовать:

```bash
composer run dev
```

Это запускает одновременно сервер Laravel, очередь и клиентский dev-сервер Vite.

## Основные команды

```bash
php artisan test
php artisan migrate:fresh --seed
npm run build
npm run lint
```

## Структура проекта

- `app/` — логика приложения, модели, контроллеры
- `config/` — конфигурационные файлы Laravel
- `database/` — миграции и seeders
- `resources/` — React-компоненты, CSS, шаблоны
- `routes/` — маршруты приложения
- `public/` — статические файлы и точка входа
- `tests/` — автоматические тесты

## Полезные ссылки

- [Laravel documentation](https://laravel.com/docs)
- [Vite documentation](https://vite.dev/guide/)
- [Inertia.js documentation](https://inertiajs.com/)
- [React documentation](https://react.dev/)

## Лицензия

Нет лицензия
Тест активности
