<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Section;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\School;
use Illuminate\Support\Collection;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder handles all schedule-related data:
     * 1. Creates primary schedules for sections
     * 2. Creates additional weekly schedules for sections
     */
    public function run(): void
    {
        $this->command->info('Starting schedule seeding process...');

        // Step 1: Create primary schedules for sections
        $this->createPrimarySchedules();

        // Step 2: Create additional weekly schedules
        $this->createWeeklySchedules();

        $this->command->info('All schedules seeded successfully!');
    }

    /**
     * Create primary schedules for sections without schedules
     */
    private function createPrimarySchedules(): void
    {
        $this->command->info('Creating primary schedules for sections...');

        // Get all sections that don't have schedules yet
        $sections = Section::doesntHave('schedules')->get();

        if ($sections->isEmpty()) {
            $this->command->info('No sections without schedules found. Creating additional primary schedules for random sections...');
            $sections = Section::inRandomOrder()->take(10)->get();
        }

        $this->command->info('Creating primary schedules for ' . $sections->count() . ' sections...');

        foreach ($sections as $section) {
            // Determine the school ID from the section's course department
            $schoolId = null;
            if ($section->course && $section->course->department) {
                $schoolId = $section->course->department->school_id;
            }

            if (!$schoolId) {
                continue;
            }

            $this->createSchedulesForSection($section, $schoolId);
        }

        $this->command->info('Primary schedules created successfully!');
    }

    /**
     * Create additional weekly schedules for sections that already have schedules
     */
    private function createWeeklySchedules(): void
    {
        $this->command->info('Creating additional weekly schedules for sections...');

        // Get all sections that already have schedules
        $sections = Section::has('schedules')
            ->with(['schedules', 'course.department.school'])
            ->inRandomOrder()
            ->take(15)
            ->get();

        if ($sections->isEmpty()) {
            $this->command->info('No sections with schedules found. Skipping weekly schedule creation.');
            return;
        }

        $this->command->info('Creating additional weekly schedules for ' . $sections->count() . ' sections...');

        foreach ($sections as $section) {
            $schoolId = null;
            if ($section->course && $section->course->department && $section->course->department->school) {
                $schoolId = $section->course->department->school->id;
            }

            if (!$schoolId) {
                continue;
            }

            $this->addWeeklyScheduleToSection($section, $schoolId);
        }

        $this->command->info('Weekly schedules added successfully!');
    }

    /**
     * Create primary schedules for a given section
     *
     * @param Section $section The section to create schedules for
     * @param int $schoolId The school ID to find rooms
     * @return void
     */
    private function createSchedulesForSection($section, $schoolId): void
    {
        // Get random rooms from the school
        $rooms = Room::whereHas('floor.building', function($query) use ($schoolId) {
            $query->where('school_id', $schoolId);
        })->get();

        if ($rooms->isEmpty()) {
            return;
        }

        $room = $rooms->random();

        // Use the section's delivery method
        $deliveryMethod = $section->delivery_method;

        // Virtual meeting URL for online or hybrid sections
        $virtualMeetingUrl = null;
        if (in_array($deliveryMethod, ['online', 'hybrid'])) {
            $platforms = ['zoom', 'teams', 'google-meet', 'webex'];
            $platform = $platforms[array_rand($platforms)];
            $meetingId = strtoupper(substr(md5(rand()), 0, 8));
            $virtualMeetingUrl = "https://{$platform}.example.com/meet/{$meetingId}";
        }

        // Determine location type based on delivery method and virtual meeting URL
        $locationType = $deliveryMethod === 'online' ? 'virtual' :
                       ($virtualMeetingUrl ? 'hybrid' : 'in-person');

        // Define common meeting patterns with their associated days
        $meetingPatterns = [
            'lecture' => [
                'monday-wednesday-friday' => ['Monday', 'Wednesday', 'Friday'],
                'tuesday-thursday' => ['Tuesday', 'Thursday'],
            ]
        ];

        // Set time slots based on pattern type
        $timeSlots = [
            'lecture' => [
                ['08:00:00', '09:15:00'],
                ['09:30:00', '10:45:00'],
                ['11:00:00', '12:15:00'],
                ['13:00:00', '14:15:00'],
                ['14:30:00', '15:45:00'],
                ['16:00:00', '17:15:00'],
            ]
        ];

        // Create the lecture schedule
        $patternType = 'lecture';
        $pattern = array_rand($meetingPatterns[$patternType]);
        $daysOfWeek = $meetingPatterns[$patternType][$pattern];
        $selectedTimeSlot = $timeSlots[$patternType][array_rand($timeSlots[$patternType])];
        $startTime = $selectedTimeSlot[0];
        $endTime = $selectedTimeSlot[1];

        // Create lecture schedules for each day
        foreach ($daysOfWeek as $day) {
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
                    'virtual_meeting_url' => $virtualMeetingUrl,
                    'type' => $patternType
                ]
            );
        }
    }

    /**
     * Add a weekly schedule to a section that already has schedules
     *
     * @param Section $section The section to add a weekly schedule to
     * @param int $schoolId The school ID to find rooms
     * @return void
     */
    private function addWeeklyScheduleToSection($section, $schoolId): void
    {
        // Get existing schedules for this section
        $existingSchedules = $section->schedules;

        // Skip if this section already has schedules
        if ($existingSchedules->count() > 0) {
            return;
        }

        // Get random rooms from the school
        $rooms = Room::whereHas('floor.building', function($query) use ($schoolId) {
            $query->where('school_id', $schoolId);
        })->get();

        if ($rooms->isEmpty()) {
            return;
        }

        $room = $rooms->random();

        // Use the section's delivery method
        $deliveryMethod = $section->delivery_method;

        // Virtual meeting URL for online or hybrid sections
        $virtualMeetingUrl = null;
        if (in_array($deliveryMethod, ['online', 'hybrid'])) {
            $platforms = ['zoom', 'teams', 'google-meet', 'webex'];
            $platform = $platforms[array_rand($platforms)];
            $meetingId = strtoupper(substr(md5(rand()), 0, 8));
            $virtualMeetingUrl = "https://{$platform}.example.com/meet/{$meetingId}";
        }

        // Determine location type based on delivery method and virtual meeting URL
        $locationType = $deliveryMethod === 'online' ? 'virtual' :
                       ($virtualMeetingUrl ? 'hybrid' : 'in-person');

        // Define meeting patterns
        $meetingPatterns = [
            'monday-wednesday-friday' => ['Monday', 'Wednesday', 'Friday'],
            'tuesday-thursday' => ['Tuesday', 'Thursday'],
        ];

        // Set time slots
        $timeSlots = [
            ['08:00:00', '09:15:00'],
            ['09:30:00', '10:45:00'],
            ['11:00:00', '12:15:00'],
            ['13:00:00', '14:15:00'],
            ['14:30:00', '15:45:00'],
            ['16:00:00', '17:15:00'],
        ];

        // Pick a random pattern and time slot
        $pattern = array_rand($meetingPatterns);
        $daysOfWeek = $meetingPatterns[$pattern];
        $selectedTimeSlot = $timeSlots[array_rand($timeSlots)];
        $startTime = $selectedTimeSlot[0];
        $endTime = $selectedTimeSlot[1];

        // Create schedules for each day
        foreach ($daysOfWeek as $day) {
            Schedule::create([
                'section_id' => $section->id,
                'room_id' => $locationType === 'online' ? null : $room->id,
                'day_of_week' => $day,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'meeting_pattern' => $pattern,
                'location_type' => $locationType,
                'virtual_meeting_url' => $virtualMeetingUrl,
                'type' => 'lecture'
            ]);
        }
    }
}
