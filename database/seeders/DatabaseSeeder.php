<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\School;
use App\Models\Department;
use App\Models\Major;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create Roles
        $superAdminRole = Role::updateOrCreate(['name' => 'super_admin']);
        $schoolAdminRole = Role::updateOrCreate(['name' => 'school_admin']);
        $majorCoordRole = Role::updateOrCreate(['name' => 'major_coordinator']);
        $professorRole = Role::updateOrCreate(['name' => 'professor']);
        $studentRole = Role::updateOrCreate(['name' => 'student']);

        // Create Super Admin
        $superAdmin = User::updateOrCreate(
            ['email' => 'super@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role_id' => $superAdminRole->id,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Create Sample Schools
        $school1 = School::updateOrCreate(
            ['name' => 'Temple University'],
            ['email' => 'temple@admin.com'],
        );

        $school2 = School::updateOrCreate(
            ['name' => 'Temple University Japan Campus'],
            ['email' => 'tuj@admin.com'],

        );

        // Create School Admins
        $schoolAdmin1 = User::updateOrCreate(
            ['email' => 'temple@admin.com'],
            [
                'name' => 'Temple Main Campus Admin',
                'password' => Hash::make('password'),
                'role_id' => $schoolAdminRole->id,
                'school_id' => $school1->id,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        $schoolAdmin2 = User::updateOrCreate(
            ['email' => 'tuj@admin.com'],
            [
                'name' => 'TUJ Admin',
                'password' => Hash::make('password'),
                'role_id' => $schoolAdminRole->id,
                'school_id' => $school2->id,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Create Departments for Engineering
        $departments = [
            ['name' => 'Computer Science', 'school_id' => $school1->id],
            ['name' => 'Electrical Engineering', 'school_id' => $school1->id],
            ['name' => 'Mechanical Engineering', 'school_id' => $school1->id],
        ];

        foreach ($departments as $dept) {
            $department = Department::updateOrCreate(
                ['name' => $dept['name'], 'school_id' => $dept['school_id']],
            );

        }


        $this->command->info('Database seeded successfully!');
        $this->command->info('Super Admin Login: super@admin.com / password');
        $this->command->info('School Admin Login: temple@admin.com / password');
    }
}
