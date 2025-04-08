<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Section;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\School;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding schedules for existing sections...');

        // Get all sections that don't have schedules
        $sections = Section::doesntHave('schedules')->get();
        
        if ($sections->isEmpty()) {
            $this->command->info('No sections without schedules found. Creating additional schedules for random sections...');
            $sections = Section::inRandomOrder()->take(10)->get();
        }

        foreach ($sections as $section) {
            // Determine the school ID from the section's course department
            $school = $section->course->department->school;
            
            if (!$school) {
                continue;
            }
            
            $this->createSchedulesForSection($section, $school->id);
        }

        $this->command->info('Schedules seeded successfully!');
    }

    /**
     * Create schedules for a given section
     *
     * @param Section $section The section to create schedules for
     * @param int $schoolId The school ID to find rooms
     * @return void
     */
    private function createSchedulesForSection($section, $schoolId)
    {
        // Get random rooms from the school
        $rooms = Room::whereHas('floor.building', function($query) use ($schoolId) {
            $query->where('school_id', $schoolId);
        })->get();
        
        if ($rooms->isEmpty()) {
            return;
        }
        
        $room = $rooms->random();
        
        // Choose a random delivery method
        $deliveryMethods = ['in-person', 'online', 'hybrid'];
        $deliveryMethod = $deliveryMethods[array_rand($deliveryMethods)];
        
        // Section delivery method should match schedule's location type
        $section->update(['delivery_method' => $deliveryMethod]);
        $locationType = $deliveryMethod; // location type matches delivery method
        
        // Virtual meeting URL for online or hybrid sections
        $virtualMeetingUrl = null;
        if (in_array($locationType, ['online', 'hybrid'])) {
            $platforms = ['zoom', 'teams', 'google-meet', 'webex'];
            $platform = $platforms[array_rand($platforms)];
            $meetingId = strtoupper(substr(md5(rand()), 0, 8));
            $virtualMeetingUrl = "https://{$platform}.example.com/meet/{$meetingId}";
        }
        
        // Choose a random meeting pattern
        $patterns = [
            'single', 
            'monday-wednesday-friday', 
            'tuesday-thursday', 
            'monday-wednesday',
            'tuesday-friday',
            'weekly'
        ];
        $pattern = $patterns[array_rand($patterns)];
        
        // Set days of week based on pattern
        $daysOfWeek = [];
        switch ($pattern) {
            case 'monday-wednesday-friday':
                $daysOfWeek = ['Monday', 'Wednesday', 'Friday'];
                break;
            case 'tuesday-thursday':
                $daysOfWeek = ['Tuesday', 'Thursday'];
                break;
            case 'monday-wednesday':
                $daysOfWeek = ['Monday', 'Wednesday'];
                break;
            case 'tuesday-friday':
                $daysOfWeek = ['Tuesday', 'Friday'];
                break;
            case 'weekly':
                $weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                $daysOfWeek = [$weekdays[array_rand($weekdays)]];
                break;
            default:
                $daysOfWeek = ['Monday'];
                break;
        }
        
        // Generate time slots with more variety
        $timeSlots = [
            // Morning classes
            ['08:00:00', '09:15:00'],
            ['09:30:00', '10:45:00'],
            ['11:00:00', '12:15:00'],
            // Afternoon classes
            ['13:00:00', '14:15:00'],
            ['14:30:00', '15:45:00'],
            ['16:00:00', '17:15:00'],
            // Evening classes
            ['18:00:00', '19:15:00'],
            ['19:30:00', '20:45:00']
        ];
        
        $selectedTimeSlot = $timeSlots[array_rand($timeSlots)];
        $startTime = $selectedTimeSlot[0];
        $endTime = $selectedTimeSlot[1];
        
        // For in-person and hybrid classes, we need multiple rooms if the pattern has multiple days
        if ($locationType !== 'online' && count($daysOfWeek) > 1 && rand(0, 10) > 7) {
            // 30% chance of having different rooms for different days
            $multipleRooms = true;
        } else {
            $multipleRooms = false;
        }
        
        // Create a schedule for each day in the pattern
        foreach ($daysOfWeek as $day) {
            // If using multiple rooms, pick a different room for each day
            if ($multipleRooms) {
                $room = $rooms->random();
            }
            
            Schedule::updateOrCreate(
                [
                    'section_id' => $section->id,
                    'day_of_week' => $day,
                    'start_time' => $startTime,
                    'end_time' => $endTime
                ],
                [
                    'room_id' => $locationType === 'online' ? null : $room->id,
                    'meeting_pattern' => $pattern,
                    'location_type' => $locationType,
                    'virtual_meeting_url' => $virtualMeetingUrl
                ]
            );
        }
    }
} 