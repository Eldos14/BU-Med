<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'fio' => fake()->name(),
            'iin' => fake()->numerify('############'),
            'birth_date' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female']),
            'address' => fake()->address(),
            'contacts' => fake()->phoneNumber(),
            'clinic_id' => null,
            'osms_status' => fake()->boolean(40),
            'profile_complete' => false,
        ];
    }

    public function complete(): static
    {
        return $this->state(fn (array $attributes) => [
            'profile_complete' => true,
        ]);
    }
}
