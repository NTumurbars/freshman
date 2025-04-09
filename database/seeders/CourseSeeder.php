<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Major;
use App\Models\Course;
use App\Models\Section;
use App\Models\Term;
use App\Models\ProfessorProfile;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Role;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder creates all course-related data:
     * 1. Creates courses for each department
     * 2. Creates sections for active terms
     * 3. Ensures all courses have proper properties
     */
    public function run(): void
    {
        $this->command->info('Starting course seeding process...');

        // Create courses and sections for departments
        $this->createCoursesForDepartments();

        // Update any course properties if needed
        $this->updateCourseProperties();

        $this->command->info('All courses and sections seeded successfully!');
    }

    /**
     * Create courses and sections for departments
     */
    private function createCoursesForDepartments(): void
    {
        $this->command->info('Creating courses and sections for departments...');

        // Get all departments, with their school, active terms, and professors
        $departments = Department::with(['school', 'school.terms' => function($query) {
            $query->where('is_active', true);
        }, 'professor_profiles'])->get();

        $sections_statuses = ['open', 'closed', 'waitlist', 'cancelled'];
        $delivery_methods = ['in-person', 'online', 'hybrid'];
        $delivery_method_weights = [1, 1, 2]; // Give hybrid twice the chance
        static $sectionNumber = 1;

        foreach ($departments as $dept) {
            $this->command->info("Processing department: {$dept->name}");

            // Skip if no active terms
            if ($dept->school->terms->isEmpty()) {
                $this->command->info("Skipping {$dept->name} - no active terms");
                continue;
            }

            // Define courses for this department
            $courses = $this->getCoursesForDepartment($dept->name);

            if (empty($courses)) {
                $this->command->info("Skipping {$dept->name} - no courses defined");
                continue;
            }

            // Create course and sections
            foreach ($courses as $courseData) {
                $major = Major::where('department_id', $dept->id)->first();

                $course = Course::updateOrCreate(
                    ['code' => $courseData['code']],
                    [
                        'department_id' => $dept->id,
                        'major_id' => $major ? $major->id : null,
                        'title' => $courseData['title'],
                        'description' => 'This is a course description for ' . $courseData['title'],
                        'credits' => $courseData['credits'],
                        'level' => substr($courseData['code'], 2, 1) . '00',
                        'is_active' => true,
                    ]
                );

                $this->command->info("Created course: {$course->code} - {$course->title}");

                // Create multiple sections for each course
                $numSections = rand(2, 4); // Create 2-4 sections per course
                for ($i = 0; $i < $numSections; $i++) {
                    // Get a random professor from this department
                    $profProfiles = $dept->professor_profiles;

                    if ($profProfiles->isEmpty()) {
                        // If no professors exist, create a default professor for this department
                        $professor = User::updateOrCreate(
                            ['email' => strtolower(str_replace(' ', '.', $dept->name)) . '@tuj.ac.jp'],
                            [
                                'name' => 'Default Professor',
                                'password' => Hash::make('password'),
                                'role_id' => Role::where('name', 'professor')->first()->id,
                                'school_id' => $dept->school_id,
                                'email_verified_at' => now(),
                                'remember_token' => Str::random(10),
                            ]
                        );

                        $profProfile = ProfessorProfile::updateOrCreate(
                            ['user_id' => $professor->id],
                            [
                                'department_id' => $dept->id,
                                'title' => 'Professor',
                                'office' => 'Main Building, Room ' . rand(100, 500),
                                'phone' => '+81-3-5441-' . rand(1000, 9999),
                                'website' => 'https://tuj.ac.jp/faculty/' . strtolower(str_replace(' ', '-', $dept->name)),
                            ]
                        );
                        $this->command->info("Created default professor for {$dept->name}");
                    } else {
                        $profProfile = $profProfiles->random();
                    }

                    // Create section for each active term
                    foreach ($dept->school->terms as $term) {
                        // Determine capacity based on delivery method
                        $delivery_method = $this->weightedRandom($delivery_methods, $delivery_method_weights);
                        $capacity = null;

                        if ($delivery_method === 'online') {
                            // Online courses can have larger capacities
                            $capacity = rand(30, 100);
                        } elseif ($delivery_method === 'hybrid') {
                            // Hybrid courses have medium capacities
                            $capacity = rand(20, 40);
                        } else {
                            // In-person courses have capacities that will be based on room sizes
                            // We'll set some explicitly, leave others null to use room capacity
                            if (rand(0, 1) === 1) {
                                $capacity = rand(15, 35);
                            }
                        }

                        $section = Section::updateOrCreate(
                            [
                                'course_id' => $course->id,
                                'term_id' => $term->id,
                                'professor_profile_id' => $profProfile->id,
                                'section_code' => 'SEC-' . str_pad($sectionNumber, 2, '0', STR_PAD_LEFT),
                            ],
                            [
                                'status' => $sections_statuses[array_rand($sections_statuses)],
                                'delivery_method' => $delivery_method,
                                'notes' => fake()->optional(0.3)->sentence(),
                                'capacity' => $capacity,
                            ]
                        );

                        $this->command->info("Created section: {$section->section_code} for {$course->code} in term {$term->name}");
                        $sectionNumber++;
                    }
                }
            }
        }
    }

    /**
     * Get courses data for a specific department
     */
    private function getCoursesForDepartment($departmentName): array
    {
        switch ($departmentName) {
            case 'Computer Science':
                return [
                    ['code' => 'CS101', 'title' => 'Introduction to Computer Science', 'credits' => 3],
                    ['code' => 'CS201', 'title' => 'Data Structures and Algorithms', 'credits' => 4],
                    ['code' => 'CS301', 'title' => 'Database Systems', 'credits' => 3],
                    ['code' => 'CS401', 'title' => 'Software Engineering', 'credits' => 4],
                ];

            case 'Electrical Engineering':
                return [
                    ['code' => 'EE101', 'title' => 'Circuit Analysis', 'credits' => 3],
                    ['code' => 'EE201', 'title' => 'Digital Logic Design', 'credits' => 4],
                    ['code' => 'EE301', 'title' => 'Signals and Systems', 'credits' => 3],
                ];

            case 'Business':
                return [
                    ['code' => 'BUS101', 'title' => 'Introduction to Business', 'credits' => 3],
                    ['code' => 'BUS201', 'title' => 'Financial Accounting', 'credits' => 3],
                    ['code' => 'BUS301', 'title' => 'Business Law', 'credits' => 3],
                    ['code' => 'BUS401', 'title' => 'Strategic Management', 'credits' => 3],
                ];

            case 'Asian Studies':
                return [
                    ['code' => 'ASST101', 'title' => 'Introduction to Asian Studies', 'credits' => 3],
                    ['code' => 'ASST201', 'title' => 'East Asian History', 'credits' => 3],
                    ['code' => 'ASST301', 'title' => 'Japanese Culture and Society', 'credits' => 3],
                    ['code' => 'ASST401', 'title' => 'Contemporary Asian Issues', 'credits' => 3],
                ];

            case 'International Business':
                return [
                    ['code' => 'IB101', 'title' => 'Global Business Environment', 'credits' => 3],
                    ['code' => 'IB201', 'title' => 'International Marketing', 'credits' => 3],
                    ['code' => 'IB301', 'title' => 'Cross-Cultural Management', 'credits' => 3],
                    ['code' => 'IB401', 'title' => 'Global Strategy', 'credits' => 3],
                ];

            case 'Communication Studies':
                return [
                    ['code' => 'COMM101', 'title' => 'Public Speaking', 'credits' => 3],
                    ['code' => 'COMM201', 'title' => 'Media Studies', 'credits' => 3],
                ];

            default:
                return [];
        }
    }

    /**
     * Update course properties
     */
    private function updateCourseProperties(): void
    {
        $this->command->info('Updating course properties...');

        // Set all existing courses to active if not set
        Course::where('is_active', NULL)
            ->update(['is_active' => true]);

        // Add more course property updates here if needed

        $this->command->info('Course properties updated successfully!');
    }

    /**
     * Helper function to get a weighted random value
     */
    private function weightedRandom($values, $weights) {
        $total = array_sum($weights);
        $rand = mt_rand(1, $total);
        $sum = 0;
        for ($i = 0; $i < count($values); $i++) {
            $sum += $weights[$i];
            if ($rand <= $sum) {
                return $values[$i];
            }
        }
        return $values[0];
    }
}
