<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Room;

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
            'building_id'=>Building::inRandomOrder()->first()->id,
            'number'=>fake()->randomDigit(),
        ];
    }

    public function newFloor()
    {
        return $this->state(function (array $attributes) {
            return [
                'building_id'=>Building::factory(),
                
            ];
        });
    }

    public function configure()
    {
        return $this->afterCreating(function (Floor $floor) {
            Room::factory()->create(['floor_id' => $floor->id,]);
        });
    }
}
