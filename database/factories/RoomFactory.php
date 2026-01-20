<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\School;
use App\Models\Room;
use App\Models\Floor;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'floor_id' => Floor::inRandomOrder()->first()->id,
            'room_number'=>fake()->numberBetween(100, 999),
            'capacity'=>fake()->numberBetween(5, 400)
        ];
    }

    public function newRoom()
    {
        return $this->state(function (array $attributes) use ($schoolId, $building) {
            return [
                'floor_id'=>Floor::factory(),
            ];
        });
    }
}
