<?php

use App\Models\Patient;
use App\Models\User;

test('patient can register and is redirected to profile edit', function () {
    $response = $this->post(route('register'), [
        'name' => 'Иванов Иван Иванович',
        'email' => 'patient@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect(route('patient.profile.edit'));

    $user = User::where('email', 'patient@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->role)->toBe('patient');
    expect($user->patient)->not->toBeNull();
    expect($user->patient->profile_complete)->toBeFalse();
});

test('registration creates patient record automatically', function () {
    $this->post(route('register'), [
        'name' => 'Петрова Анна Сергеевна',
        'email' => 'anna@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $user = User::where('email', 'anna@example.com')->first();
    expect(Patient::where('user_id', $user->id)->exists())->toBeTrue();
});

test('registration fails without required fields', function () {
    $response = $this->post(route('register'), []);

    $response->assertSessionHasErrors(['name', 'email', 'password']);
});

test('registration fails with duplicate email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post(route('register'), [
        'name' => 'Тест',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('registration fails with mismatched passwords', function () {
    $response = $this->post(route('register'), [
        'name' => 'Тест',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'different123',
    ]);

    $response->assertSessionHasErrors('password');
});

test('patient route is inaccessible for non-patient users', function () {
    $doctor = User::factory()->create(['role' => 'doctor']);

    $this->actingAs($doctor)
        ->get(route('patient.dashboard'))
        ->assertStatus(403);
});

test('patient can access patient dashboard', function () {
    $user = User::factory()->create(['role' => 'patient']);
    Patient::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('patient.dashboard'))
        ->assertOk();
});
