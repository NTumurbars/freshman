<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\School;
use App\Models\Term;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Term>
 */
class TermFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
        $year = fake()->numberBetween(2020, 2040);
        return [
            'school_id'=>School::inRandomOrder()->first()->id,
            'name' => fake()->randomElement($seasons) . ' ' . $year,
            'start_date' => fake()->dateTimeBetween('-5 years', '+15 years')->format('Y-m-d'),
            'end_date' => fake()->dateTimeBetween('-5 years', '+15 years')->format('Y-m-d'),
        ];
    }

    public function newTerm()
    {
        return $this->state(function (array $attributes) {
            return [
                
                'school_id'=>School::factory(),
            ];
        });
    }
}
