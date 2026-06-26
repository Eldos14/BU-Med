<?php

// Автоматически устанавливаем composer зависимости, если их нет на сервере Vercel
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    exec('cd .. && curl -sS https://getcomposer.org | php && php composer.phar install --no-dev');
}

// Запускаем Laravel
require __DIR__ . '/../public/index.php';
