<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;
use App\Models\Section;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\User;
use App\Models\Building;
use App\Models\Floor;
use App\Models\ProfessorProfile;



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

        $locationTypes = [
            ['type' => 'Virtual', 'url' => fake()->url()],
            ['type' => 'In Person', 'url' => NULL]
        ];
        $location = fake()->randomElement($locationTypes);

        $section = Section::inRandomOrder()->first();
        $professorProfile = $section->professor_profile_id;
        $professorUserId = ProfessorProfile::where('id', $professorProfile)->first()->user_id;
        $schoolid = User::where('id', $professorUserId)->first()->school_id;
        $buildingid = Building::where('school_id', $schoolid)->inRandomOrder()->first()->id;
        $floorid = Floor::where('building_id', $buildingid)->inRandomOrder()->first()->id;
        $roomid = Room::where('floor_id', $floorid)->inRandomOrder()->first()->id;

        return [
            'room_id'=>$roomid,
            'day_of_week'=>fake()->randomElement([
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
            ]),
            'start_time'=> $start->format('H:i:s'),
            'end_time'=> $end->format('H:i:s'),
            'meeting_pattern' => 'Idk what this is lol, a string of some sort ¯\_(ツ)_/¯',
            'location_type' => $location['type'],
            'virtual_meeting_url' => $location['url'],
            'type' => 'What is this type? Why are there two types in this table???',
            'capacity' => fake()->numberBetween(10, 400),


        ];
    }

    public function newSchedule()
    {
        
        return $this->state(function (array $attributes) {
            return [
                'section_id'=>Section::factory(),
                'room_id'=>Room::factory(),
            ];
        });
    }

}
