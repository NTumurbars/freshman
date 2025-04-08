<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\School;

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
            'school_id'=>School::factory(),
            'room_number'=>fake()->numberBetween(100, 999),
            'building'=>fake()=>word(),
            'capacity'=>fake()=>numberBetween(5, 400)
        ];
    }
}
