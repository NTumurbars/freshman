<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Department;
use App\Models\ProfessorProfile;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProfessorProfile>
 */
class ProfessorProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'=>User::where('role_id', 4)->first()->id,
            'department_id'=>Department::inRandomOrder()->first()->id,
            'office'=>fake()->word(),
            'phone'=>fake()->phoneNumber(),
            'website'=>fake()->url(),
            'title'=>fake()->title(),
        ];
    }
    public function newPP()
    {
        return $this->state(function (array $attributes) {
            return [
                'user_id'=>User::factory()->professor(),
                'department_id'=>Department::factory(),
            ];
        });
    }

    
    
}
