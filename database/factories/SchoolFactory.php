<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\School>
 */
class SchoolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titles = ['University', 'College', 'Institute', 'Academy', 'State University', 'State College', 'Community College'];
        $title = fake()->randomElement($titles);
        return [
            'name'=>fake()->randomElement([fake()->lastName(), fake()->city()]) . ' ' . $title,
            'email'=>fake()->email(),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (School $school) {
            Term::factory()->count(4)->create(['school_id' => $school->id,]);
        });
    }
}
