<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\School;
use App\Models\Term;
use App\Models\Section;
use App\Models\Course;
use App\Models\CourseRegistration;
use App\Models\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * CourseRegistrationSeeder
 *
 * This seeder creates realistic course registrations for students by:
 * - Ensuring students take a diverse set of subjects
 * - Preventing schedule conflicts
 * - Respecting section capacity limits
 * - Creating appropriate course loads (3-5 courses per student)
 *
 * The approach prioritizes subject diversity and schedule practicality to
 * create a realistic academic enrollment pattern for each student.
 */
class CourseRegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds - register students for courses realistically
     *
     * @return void
     */
    public function run()
    {
        // Process each school separately for realistic enrollment patterns
        $schools = School::all();

        foreach ($schools as $school) {
            $this->command->info("Processing course registrations for {$school->name}...");

            // Find active terms for registration (or most recent if none active)
            $activeTerms = Term::where('school_id', $school->id)
                ->where('is_active', true)
                ->get();

            if ($activeTerms->isEmpty()) {
                $this->command->warn("No active terms found for {$school->name}, using most recent term");
                $activeTerms = Term::where('school_id', $school->id)
                    ->orderBy('start_date', 'desc')
                    ->limit(1)
                    ->get();

                if ($activeTerms->isEmpty()) {
                    $this->command->error("No terms found for {$school->name}");
                    continue;
                }
            }

            // Get all students for this school to be registered
            $students = User::where('school_id', $school->id)
                ->whereHas('role', function($query) {
                    $query->where('name', 'student');
                })
                ->get();

            if ($students->isEmpty()) {
                $this->command->error("No students found for {$school->name}");
                continue;
            }

            // Register students for each active term
            foreach ($activeTerms as $term) {
                $this->registerStudentsForTerm($school, $term, $students);
            }
        }
    }

    /**
     * Register students for a specific term
     *
     * This method ensures that:
     * 1. Students get a diverse mix of course subjects
     * 2. No scheduling conflicts occur
     * 3. Section capacities are not exceeded
     * 4. Each student is enrolled in 3-5 courses
     *
     * @param School $school The school where registrations occur
     * @param Term $term The academic term for registrations
     * @param \Illuminate\Support\Collection $students Collection of students to register
     * @return void
     */
    private function registerStudentsForTerm($school, $term, $students)
    {
        $this->command->info("Registering students for {$term->name} at {$school->name}...");

        // Retrieve all open sections with their courses and schedules
        $sections = Section::where('term_id', $term->id)
            ->where('status', 'open')
            ->with(['course', 'schedules'])
            ->get();

        if ($sections->isEmpty()) {
            $this->command->error("No available sections found for {$term->name}");
            return;
        }

        // Group sections by subject area for better subject diversity
        $sectionsByPrefix = [];
        foreach ($sections as $section) {
            // Extract subject prefix from course code (e.g., CS101 -> CS)
            $prefix = substr($section->course->code, 0, 2);
            if (!isset($sectionsByPrefix[$prefix])) {
                $sectionsByPrefix[$prefix] = [];
            }
            $sectionsByPrefix[$prefix][] = $section;
        }

        // Register each student for an appropriate course load
        $registrationCount = 0;
        foreach ($students as $student) {
            // Target: 3-5 courses per student (typical undergraduate load)
            $coursesToRegister = rand(3, 5);

            // Track registrations to prevent duplicates and conflicts
            $registeredSections = [];
            $studentSchedules = [];

            // PRIORITY 1: Register for a variety of subject areas first
            // This ensures students have a diverse academic schedule
            $availablePrefixes = array_keys($sectionsByPrefix);
            shuffle($availablePrefixes); // Randomize the order of subjects

            foreach ($availablePrefixes as $prefix) {
                if (count($registeredSections) >= $coursesToRegister) {
                    break;
                }

                $prefixSections = $sectionsByPrefix[$prefix];
                shuffle($prefixSections); // Randomize section selection within subject

                // Try to find a non-conflicting section in this subject area
                foreach ($prefixSections as $section) {
                    // Skip if already registered for this section
                    if (in_array($section->id, $registeredSections)) {
                        continue;
                    }

                    // Skip if this section is full (respect capacity limits)
                    $currentRegistrations = CourseRegistration::where('section_id', $section->id)->count();
                    if ($section->capacity && $currentRegistrations >= $section->capacity) {
                        continue;
                    }

                    // Check for schedule conflicts
                    $hasConflict = false;
                    foreach ($section->schedules as $schedule) {
                        foreach ($studentSchedules as $existingSchedule) {
                            if ($existingSchedule['day_of_week'] === $schedule->day_of_week) {
                                // Check for time overlap using start/end times
                                if (
                                    ($schedule->start_time >= $existingSchedule['start_time'] && $schedule->start_time < $existingSchedule['end_time']) ||
                                    ($schedule->end_time > $existingSchedule['start_time'] && $schedule->end_time <= $existingSchedule['end_time']) ||
                                    ($schedule->start_time <= $existingSchedule['start_time'] && $schedule->end_time >= $existingSchedule['end_time'])
                                ) {
                                    $hasConflict = true;
                                    break;
                                }
                            }
                        }

                        if ($hasConflict) {
                            break;
                        }
                    }

                    if ($hasConflict) {
                        continue;
                    }

                    // Register the student for this section
                    try {
                        CourseRegistration::create([
                            'user_id' => $student->id,
                            'section_id' => $section->id
                        ]);

                        $registrationCount++;
                        $registeredSections[] = $section->id;

                        // Record this schedule to prevent conflicts
                        foreach ($section->schedules as $schedule) {
                            $studentSchedules[] = [
                                'day_of_week' => $schedule->day_of_week,
                                'start_time' => $schedule->start_time,
                                'end_time' => $schedule->end_time
                            ];
                        }

                        // Only register for one section per subject area to ensure variety
                        break;
                    } catch (\Exception $e) {
                        // Log the error and continue
                        Log::error("Failed to register student {$student->id} for section {$section->id}: " . $e->getMessage());
                    }
                }
            }

            // PRIORITY 2: Fill remaining course slots with any available sections
            // If student still needs more courses to reach their target load
            if (count($registeredSections) < $coursesToRegister) {
                $remainingNeeded = $coursesToRegister - count($registeredSections);
                $shuffledSections = $sections->shuffle();

                foreach ($shuffledSections as $section) {
                    if (count($registeredSections) >= $coursesToRegister) {
                        break;
                    }

                    // Skip if already registered for this section
                    if (in_array($section->id, $registeredSections)) {
                        continue;
                    }

                    // Skip if this section is full
                    $currentRegistrations = CourseRegistration::where('section_id', $section->id)->count();
                    if ($section->capacity && $currentRegistrations >= $section->capacity) {
                        continue;
                    }

                    // Check for schedule conflicts
                    $hasConflict = false;
                    foreach ($section->schedules as $schedule) {
                        foreach ($studentSchedules as $existingSchedule) {
                            if ($existingSchedule['day_of_week'] === $schedule->day_of_week) {
                                // Check for time overlap
                                if (
                                    ($schedule->start_time >= $existingSchedule['start_time'] && $schedule->start_time < $existingSchedule['end_time']) ||
                                    ($schedule->end_time > $existingSchedule['start_time'] && $schedule->end_time <= $existingSchedule['end_time']) ||
                                    ($schedule->start_time <= $existingSchedule['start_time'] && $schedule->end_time >= $existingSchedule['end_time'])
                                ) {
                                    $hasConflict = true;
                                    break;
                                }
                            }
                        }

                        if ($hasConflict) {
                            break;
                        }
                    }

                    if ($hasConflict) {
                        continue;
                    }

                    // Register the student for this section
                    try {
                        CourseRegistration::create([
                            'user_id' => $student->id,
                            'section_id' => $section->id
                        ]);

                        $registrationCount++;
                        $registeredSections[] = $section->id;

                        // Add this schedule to student schedules
                        foreach ($section->schedules as $schedule) {
                            $studentSchedules[] = [
                                'day_of_week' => $schedule->day_of_week,
                                'start_time' => $schedule->start_time,
                                'end_time' => $schedule->end_time
                            ];
                        }
                    } catch (\Exception $e) {
                        // Log the error and continue
                        Log::error("Failed to register student {$student->id} for section {$section->id}: " . $e->getMessage());
                    }
                }
            }
        }

        $this->command->info("Registered {$registrationCount} course registrations for {$term->name}");
    }
}
