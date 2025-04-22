<?php

namespace Database\Factories;

use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Term;
use App\Models\Building;
use App\Models\Department;


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
            'code'=>fake()->numberBetween(10000, 99999),
            'website_url' => fake()->url(),
            'logo_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa176-tAid4pc1T8-sMsYnxJ_QFyhXAahbOA&s',
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress(),
            'city'=> fake()->city(),
            'state'=> fake()->state(),
            'country'=> fake()->country(),
            'postal_code' => fake()->postcode(),
            'phone'=> fake()->phoneNumber(),
            'timezone'=> fake()->timezone(),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (School $school) {
            Term::factory()->create(['school_id' => $school->id,]);
            Building::factory()->create(['school_id' => $school->id,]);
            Department::factory()->create(['school_id'=> $school->id,]);
        });
    }
}
