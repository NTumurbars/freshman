<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Building;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Floor>
 */
class FloorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'building_id'=>Building::factory(),
            'name'=>fake()->randomDigit(),
        ];
    }

    public function newFloor()
    {
        return $this->state(function (array $attributes) {
            return [
                'building_id'=>Building::inRandomOrder()->first()->id,
            ];
        });
    }
}
