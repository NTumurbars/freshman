<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Section;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\School;

class WeeklyScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Adding weekly schedules for existing sections...');

        // Get all sections that already have schedules
        $sections = Section::has('schedules')
            ->with(['schedules', 'course.department.school'])
            ->inRandomOrder()
            ->take(15)
            ->get();
        
        if ($sections->isEmpty()) {
            $this->command->info('No sections with schedules found.');
            return;
        }

        foreach ($sections as $section) {
            $school = $section->course->department->school;
            
            if (!$school) {
                continue;
            }
            
            $this->addWeeklyScheduleToSection($section, $school->id);
        }

        $this->command->info('Weekly schedules added successfully!');
    }

    /**
     * Add a weekly schedule to a section that already has schedules
     *
     * @param Section $section The section to add a weekly schedule to
     * @param int $schoolId The school ID to find rooms
     * @return void
     */
    private function addWeeklyScheduleToSection($section, $schoolId)
    {
        // Get existing schedules for this section
        $existingSchedules = $section->schedules;
        
        // Skip if this section already has too many schedules
        if ($existingSchedules->count() >= 5) {
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
        
        // Use the section's existing delivery method
        $locationType = $section->delivery_method;
        
        // Virtual meeting URL for online or hybrid sections
        $virtualMeetingUrl = null;
        if (in_array($locationType, ['online', 'hybrid'])) {
            $platforms = ['zoom', 'teams', 'google-meet', 'webex'];
            $platform = $platforms[array_rand($platforms)];
            $meetingId = strtoupper(substr(md5(rand()), 0, 8));
            $virtualMeetingUrl = "https://{$platform}.example.com/meet/{$meetingId}";
        }
        
        // Set pattern to weekly
        $pattern = 'weekly';
        
        // Get days of week that don't have schedules yet
        $existingDays = $existingSchedules->pluck('day_of_week')->toArray();
        $allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $availableDays = array_diff($allDays, $existingDays);
        
        // If no available days, skip
        if (empty($availableDays)) {
            return;
        }
        
        // Pick a random available day
        $day = $availableDays[array_rand($availableDays)];
        
        // Generate time slots with more variety
        $timeSlots = [
            // Morning classes
            ['08:00:00', '08:50:00'],
            ['09:00:00', '09:50:00'],
            ['10:00:00', '10:50:00'],
            ['11:00:00', '11:50:00'],
            // Afternoon classes
            ['13:00:00', '13:50:00'],
            ['14:00:00', '14:50:00'],
            ['15:00:00', '15:50:00'],
            ['16:00:00', '16:50:00'],
            // Evening classes
            ['18:00:00', '19:15:00'],
            ['19:30:00', '20:45:00']
        ];
        
        // Check existing time slots to avoid conflicts
        $selectedTimeSlot = null;
        foreach ($timeSlots as $timeSlot) {
            $conflict = false;
            foreach ($existingSchedules as $schedule) {
                if ($schedule->day_of_week == $day) {
                    // Check for time overlap
                    $existingStart = strtotime($schedule->start_time);
                    $existingEnd = strtotime($schedule->end_time);
                    $proposedStart = strtotime($timeSlot[0]);
                    $proposedEnd = strtotime($timeSlot[1]);
                    
                    if (
                        ($proposedStart >= $existingStart && $proposedStart < $existingEnd) ||
                        ($proposedEnd > $existingStart && $proposedEnd <= $existingEnd) ||
                        ($proposedStart <= $existingStart && $proposedEnd >= $existingEnd)
                    ) {
                        $conflict = true;
                        break;
                    }
                }
            }
            
            if (!$conflict) {
                $selectedTimeSlot = $timeSlot;
                break;
            }
        }
        
        // If all time slots conflict, skip
        if (!$selectedTimeSlot) {
            return;
        }
        
        $startTime = $selectedTimeSlot[0];
        $endTime = $selectedTimeSlot[1];
        
        // Create the weekly schedule
        Schedule::create([
            'section_id' => $section->id,
            'room_id' => $locationType === 'online' ? null : $room->id,
            'day_of_week' => $day,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'meeting_pattern' => $pattern,
            'location_type' => $locationType,
            'virtual_meeting_url' => $virtualMeetingUrl
        ]);
    }
} 