<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Course;
use App\Models\Term;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Section>
 */
class SectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id'=>Course::factory(),
            'term_id'=>Term::factory(),
            'professor_id'=>User::factory()->professor(),
            'section_code'=>fake()->bothify('?##'),
            'number_of_students'=>fake()->numberBetween(5, 400)
        ];
    }
}
