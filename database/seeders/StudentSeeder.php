<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\School;
use App\Models\Section;
use App\Models\CourseRegistration;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentSeeder extends Seeder
{
    /**
     * Create students and register them for classes
     */
    public function run(): void
    {
        $this->command->info('Starting student seeding process...');

        // Get available roles, schools, and sections
        $studentRole = Role::where('name', 'student')->first();
        $schools = School::all();
        $activeSections = Section::whereHas('term', function($query) {
            $query->where('is_active', true);
        })->get();

        if ($activeSections->isEmpty()) {
            $this->command->error('No active sections found. Please run other seeders first.');
            return;
        }

        $this->command->info('Creating students for each school...');

        foreach ($schools as $school) {
            // Create 50 students per school
            $numStudents = 50;

            $this->command->info("Creating {$numStudents} students for {$school->name}...");

            $students = [];

            for ($i = 1; $i <= $numStudents; $i++) {
                $firstName = fake()->firstName();
                $lastName = fake()->lastName();
                $email = strtolower($firstName . '.' . $lastName . $i . '@student.' . str_replace(' ', '', strtolower($school->name)) . '.edu');

                $student = User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $firstName . ' ' . $lastName,
                        'password' => Hash::make('password'),
                        'role_id' => $studentRole->id,
                        'school_id' => $school->id,
                        'email_verified_at' => now(),
                        'remember_token' => Str::random(10),
                    ]
                );

                $students[] = $student;

                if ($i % 10 === 0) {
                    $this->command->info("Created {$i} students for {$school->name}");
                }
            }

            $this->command->info("Registering students for courses...");

            // Get sections for this school
            $schoolSections = $activeSections->filter(function($section) use ($school) {
                return $section->course->department->school_id === $school->id;
            });

            if ($schoolSections->isEmpty()) {
                $this->command->warn("No active sections found for {$school->name}");
                continue;
            }

            // Register each student for 3-5 courses
            foreach ($students as $student) {
                $numRegistrations = rand(3, 5);

                // Get random sections for this student
                $studentSections = $schoolSections->random(min($numRegistrations, $schoolSections->count()));

                foreach ($studentSections as $section) {
                    CourseRegistration::updateOrCreate([
                        'user_id' => $student->id,
                        'section_id' => $section->id,
                    ]);
                }
            }

            $this->command->info("Completed course registrations for {$school->name} students");
        }

        $this->command->info('Student seeding completed successfully!');
    }
}
