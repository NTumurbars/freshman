<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;
use App\Models\Section;
use App\Models\Room;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Schedule>
 */
class ScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startHour = fake()->numberBetween(8, 18); // 8 AM - 6 PM
        $startMinute = fake()->randomElement([0, 15, 30, 45]); // typical quarter hour starts

        $startTime = sprintf('%02d:%02d:00', $startHour, $startMinute); // "HH:MM:SS" format
        
        $durations = [60, 75, 90];
        $durationMinutes = fake()->randomElement($durations);

        $start = Carbon::createFromTimeString($startTime);
        $end = $start->copy()->addMinutes($durationMinutes);

        return [
            'section_id'=>Section::factory(),
            'room_id'=>Room::factory(),
            'day_of_week'=>fake()->randomElement([
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
            ]),
            'start_time'=> $start->format('H:i:s'),
            'end_time'=> $end->format('H:i:s'),
        ];
    }
}
