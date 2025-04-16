<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\School;
use App\Models\Building;
use App\Models\Floor;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Building>
 */
class BuildingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $buildingTypes = ['Library', 'Hall', 'Center', 'Auditorium'];
        return [
            'school_id'=>School::inRandomOrder()->first()->id,
            'name' => fake()->lastName() . ' ' . $this->faker->randomElement($buildingTypes)
        ];
    }

    public function newBuilding()
    {
        return $this->state(function (array $attributes) {
            return [
                
                'school_id' => School::factory(),
            ];
        });
    }

    public function configure()
    {
        return $this->afterCreating(function (Building $building) {
            Floor::factory()->create(['building_id' => $building->id,]);
        });
    }
}
