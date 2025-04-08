<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\School;
use App\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'school_id'=> School::factory(),
            'role_id' => Role::inRandomOrder()->first()->id,
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10)
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function student()
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => Role::where('name', 'student')->first()->id,
            'school_id'=>School::inRandomOrder()->first()->id,
        ]);
    }

    public function professor()
    {
        return $this->state(function (array $attributes) {
            return [
                'role_id' => Role::where('name', 'professor')->first()->id,
                'school_id'=>School::inRandomOrder()->first()->id,
            ];
        });
    }


}
