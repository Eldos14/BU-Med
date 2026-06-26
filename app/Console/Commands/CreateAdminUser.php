<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    protected $signature = 'admin:create';

    protected $description = 'Создать нового администратора';

    public function handle(): void
    {
        $name = $this->ask('Имя пользователя');
        $email = $this->ask('Email');
        $password = $this->secret('Пароль (мин. 8 символов)');

        if (User::where('email', $email)->exists()) {
            $this->error("Пользователь с email {$email} уже существует.");

            return;
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);

        $this->info("Администратор {$email} успешно создан.");
    }
}
