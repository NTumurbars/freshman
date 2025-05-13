<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\Department;
use App\Models\Major;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

/**
 * StudentSeeder
 *
 * This seeder creates a diverse set of student users for each school in the system.
 * Features:
 * - Creates students with appropriate naming patterns based on school location
 * - Generates unique, realistic email addresses for each student
 * - Distributes students across multiple schools
 * - Handles internationalization for Temple Japan students
 */
class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds - create more diverse student population
     *
     * @return void
     */
    public function run()
    {
        // Initialize faker for generating realistic data
        $faker = Faker::create();

        // Get the student role
        $studentRole = Role::where('name', 'student')->first();

        if (!$studentRole) {
            $this->command->error('Student role not found!');
            return;
        }

        // ======================== MAIN CAMPUS STUDENTS ========================
        // Create students for Temple University Main Campus (Philadelphia)
        $templeSchool = School::where('name', 'Temple University')->first();
        if ($templeSchool) {
            // Create 60 students for Temple University Main Campus
            $this->seedStudentsForSchool($templeSchool, $studentRole, $faker, 60);
        } else {
            $this->command->error('Temple University not found!');
        }

        // ======================== TEMPLE JAPAN STUDENTS =======================
        // Create students for Temple University Japan Campus (Tokyo)
        $tujSchool = School::where('name', 'Temple University Japan')->first();
        if ($tujSchool) {
            // Create 40 students for Temple University Japan
            $this->seedStudentsForSchool($tujSchool, $studentRole, $faker, 40);
        } else {
            $this->command->error('Temple University Japan not found!');
        }

        $this->command->info('Created ' . User::where('role_id', $studentRole->id)->count() . ' students total');
    }

    /**
     * Seed students for a specific school
     *
     * This method creates a set number of students for a given school,
     * assigning them appropriate names and generating credible email addresses.
     *
     * @param School $school The school to create students for
     * @param Role $studentRole The student role model
     * @param \Faker\Generator $faker The faker instance for generating data
     * @param int $count Number of students to create
     * @return void
     */
    private function seedStudentsForSchool($school, $studentRole, $faker, $count = 30)
    {
        $this->command->info("Creating {$count} students for {$school->name}...");

        // Get all majors for this school to assign to students
        $majors = Major::whereHas('department', function($query) use ($school) {
            $query->where('school_id', $school->id);
        })->with('department')->get();

        if ($majors->isEmpty()) {
            $this->command->error("No majors found for {$school->name}");
            return;
        }

        // Email domain based on school
        $emailDomain = $school->name === 'Temple University Japan'
            ? 'tuj.temple.edu'
            : 'temple.edu';

        // Create students
        for ($i = 1; $i <= $count; $i++) {
            // Get a random major
            $major = $majors->random();

            // Generate a student name based on the school's location
            if ($school->name === 'Temple University Japan' && $faker->boolean(70)) {
                // 70% chance of Japanese name for Temple Japan students
                $firstName = $faker->firstName($faker->boolean(50) ? 'male' : 'female');
                $lastName = $faker->lastName('ja_JP');
            } else {
                // American/international names for other students
                $firstName = $faker->firstName($faker->boolean(50) ? 'male' : 'female');
                $lastName = $faker->lastName();
            }

            $fullName = "{$firstName} {$lastName}";

            // Generate email with firstName.lastName format
            $email = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $firstName) . '.' .
                      preg_replace('/[^a-zA-Z0-9]/', '', $lastName)) . '@' . $emailDomain;

            $email = substr($email, 0, 50); // Ensure it's not too long

            // Create the student user with basic fields
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $fullName,
                    'password' => Hash::make('password'),
                    'role_id' => $studentRole->id,
                    'school_id' => $school->id,
                    'email_verified_at' => now(),
                    'remember_token' => Str::random(10),
                ]
            );

            // Log progress for large datasets
            if ($i % 10 === 0) {
                $this->command->info("Created {$i} students for {$school->name}...");
            }
        }

        $this->command->info("Finished creating students for {$school->name}");
    }
}
