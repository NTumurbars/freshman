<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\School;
use App\Models\Department;
use App\Models\Major;
use App\Models\User;
use App\Models\Term;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * The master database seeder that coordinates all other seeders.
     *
     * This seeder creates core data (roles, users, schools) and then
     * calls specialized seeders for specific functionality.
     */
    public function run()
    {
        $this->command->info('Starting database seeding process...');

        // ======================== STEP 1: CORE DATA ========================

        // Seed roles and admin users
        $roles = $this->seedRolesAndAdmins();

        // Seed schools, departments, majors, terms
        $this->seedSchoolData($roles);

        // ======================== STEP 2: SPECIALIZED SEEDERS ========================

        // Buildings, Floors, Rooms and Features
        $this->command->info('Seeding buildings, floors, rooms, and features...');
        $this->call(BuildingSeeder::class);

        // Courses and Sections
        $this->command->info('Seeding courses and sections...');
        $this->call(CourseSeeder::class);

        // Create schedules for sections
        $this->command->info('Seeding schedules for sections...');
        $this->call(ScheduleSeeder::class);

        // Seed students
        $this->command->info('Seeding students...');
        $this->seedStudents($roles);

        // ======================== SUMMARY ========================
        $this->command->info('Database seeding completed successfully!');
        $this->command->info('Super Admin Login: super@admin.com / password');
        $this->command->info('Temple Admin Login: temple@admin.com / password');
        $this->command->info('TUJ Admin Login: tuj@admin.com / password');
    }

    /**
     * Seed roles and admin users
     */
    private function seedRolesAndAdmins()
    {
        $this->command->info('Seeding roles and admin users...');

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

        return [
            'super_admin' => $superAdminRole,
            'school_admin' => $schoolAdminRole,
            'major_coordinator' => $majorCoordRole,
            'professor' => $professorRole,
            'student' => $studentRole,
        ];
    }

    /**
     * Seed schools, departments, majors, terms
     */
    private function seedSchoolData($roles)
    {
        $this->command->info('Seeding schools, departments, majors, and terms...');

        // ======================== TEMPLE UNIVERSITY (MAIN CAMPUS) ========================
        $temple = $this->seedTempleMainCampus($roles);

        // ======================== TEMPLE JAPAN ========================
        $templeJapan = $this->seedTempleJapanCampus($roles);

        return [
            'temple' => $temple,
            'temple_japan' => $templeJapan
        ];
    }

    /**
     * Seed Temple Main Campus data
     */
    private function seedTempleMainCampus($roles)
    {
        $this->command->info('Seeding Temple University main campus...');

        // Create Temple University Main Campus
        $temple = School::updateOrCreate(
            ['name' => 'Temple University'],
            [
                'email' => 'temple@admin.com',
                'website_url' => 'https://www.temple.edu',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Temple_T_logo.svg/330px-Temple_T_logo.svg.png',
                'description' => 'Temple University is a public state-related research university in Philadelphia, Pennsylvania.',
                'address' => '1801 N. Broad Street',
                'city' => 'Philadelphia',
                'state' => 'PA',
                'country' => 'USA',
                'postal_code' => '19122',
                'phone' => '215-204-7000',
                'timezone' => 'America/New_York',
            ]
        );

        // Create School Admin
        $templeAdmin = User::updateOrCreate(
            ['email' => 'temple@admin.com'],
            [
                'name' => 'Temple Main Campus Admin',
                'password' => Hash::make('password'),
                'role_id' => $roles['school_admin']->id,
                'school_id' => $temple->id,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Create Departments for Temple
        $templeDepartments = [
            ['name' => 'Computer Science', 'code' => 'CS', 'contact' => ['email' => 'cs@temple.edu', 'phone' => '215-204-8450', 'office' => 'Science Building, Room 101']],
            ['name' => 'Electrical Engineering', 'code' => 'EE', 'contact' => ['email' => 'ee@temple.edu', 'phone' => '215-204-8460', 'office' => 'Science Building, Room 203']],
            ['name' => 'Business', 'code' => 'BUS', 'contact' => ['email' => 'business@temple.edu', 'phone' => '215-204-8470', 'office' => 'Main Building, Room 305']],
        ];

        foreach ($templeDepartments as $dept) {
            $department = Department::updateOrCreate(
                ['name' => $dept['name'], 'school_id' => $temple->id],
                ['code' => $dept['code'], 'contact' => $dept['contact']]
            );
        }

        // Create Majors for Temple
        $templeMajors = [
            ['department' => 'Computer Science', 'name' => 'Computer Science', 'code' => 'CS', 'description' => 'Bachelor of Science in Computer Science'],
            ['department' => 'Computer Science', 'name' => 'Information Science and Technology', 'code' => 'IST', 'description' => 'Bachelor of Science in Information Science and Technology'],
            ['department' => 'Electrical Engineering', 'name' => 'Electrical Engineering', 'code' => 'EE', 'description' => 'Bachelor of Science in Electrical Engineering'],
            ['department' => 'Business', 'name' => 'Business Administration', 'code' => 'BBA', 'description' => 'Bachelor of Business Administration'],
            ['department' => 'Business', 'name' => 'Finance', 'code' => 'FIN', 'description' => 'Bachelor of Science in Finance'],
        ];

        foreach ($templeMajors as $majorData) {
            $dept = Department::where('name', $majorData['department'])
                            ->where('school_id', $temple->id)
                            ->first();
            if ($dept) {
                Major::updateOrCreate(
                    ['department_id' => $dept->id, 'code' => $majorData['code']],
                    ['name' => $majorData['name'], 'description' => $majorData['description']]
                );
            }
        }

        // Create Terms for Temple
        $templeTerms = [
            ['name' => 'Fall 2025', 'start_date' => '2025-08-27', 'end_date' => '2025-12-14', 'is_active' => false],
            ['name' => 'Spring 2025', 'start_date' => '2025-01-15', 'end_date' => '2025-05-02', 'is_active' => true],
            ['name' => 'Summer 2025', 'start_date' => '2025-05-19', 'end_date' => '2025-08-01', 'is_active' => false],
        ];

        foreach ($templeTerms as $termData) {
            $term = Term::updateOrCreate(
                ['name' => $termData['name'], 'school_id' => $temple->id],
                [
                    'start_date' => $termData['start_date'],
                    'end_date' => $termData['end_date'],
                    'is_active' => $termData['is_active']
                ]
            );
        }

        // Create professors for Temple
        $templeProfessors = [
            ['name' => 'John Smith', 'email' => 'jsmith@temple.edu', 'department' => 'Computer Science', 'title' => 'Professor'],
            ['name' => 'Jane Doe', 'email' => 'jdoe@temple.edu', 'department' => 'Electrical Engineering', 'title' => 'Associate Professor'],
            ['name' => 'Robert Johnson', 'email' => 'rjohnson@temple.edu', 'department' => 'Business', 'title' => 'Professor'],
        ];

        foreach ($templeProfessors as $profData) {
            $dept = Department::where('name', $profData['department'])
                            ->where('school_id', $temple->id)
                            ->first();

            if ($dept) {
                $professor = User::updateOrCreate(
                    ['email' => $profData['email']],
                    [
                        'name' => $profData['name'],
                        'password' => Hash::make('password'),
                        'role_id' => $roles['professor']->id,
                        'school_id' => $temple->id,
                        'email_verified_at' => now(),
                        'remember_token' => Str::random(10),
                    ]
                );

                $profile = \App\Models\ProfessorProfile::updateOrCreate(
                    ['user_id' => $professor->id],
                    [
                        'department_id' => $dept->id,
                        'title' => $profData['title'],
                        'office' => 'Office ' . rand(100, 500),
                        'phone' => '215-204-' . rand(1000, 9999),
                        'website' => 'https://temple.edu/faculty/' . strtolower(str_replace(' ', '-', $profData['name'])),
                    ]
                );
            }
        }

        return $temple;
    }

    /**
     * Seed Temple Japan Campus data (minimal version)
     */
    private function seedTempleJapanCampus($roles)
    {
        $this->command->info('Seeding Temple University Japan campus...');

        // Create Temple University Japan Campus
        $templeJapan = School::updateOrCreate(
            ['name' => 'Temple University Japan'],
            [
                'email' => 'tuj@admin.com',
                'website_url' => 'https://www.tuj.ac.jp',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Temple_T_logo.svg/330px-Temple_T_logo.svg.png',
                'description' => 'Temple University Japan (TUJ) is the oldest and largest foreign university in Japan.',
                'address' => '1-14-29 Taishido',
                'city' => 'Setagaya-ku, Tokyo',
                'state' => null,
                'country' => 'Japan',
                'postal_code' => '154-0004',
                'phone' => '+81-3-5441-9800',
                'timezone' => 'Asia/Tokyo',
            ]
        );

        // Create School Admin for TUJ
        $tujAdmin = User::updateOrCreate(
            ['email' => 'tuj@admin.com'],
            [
                'name' => 'Temple Japan Admin',
                'password' => Hash::make('password'),
                'role_id' => $roles['school_admin']->id,
                'school_id' => $templeJapan->id,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Create minimal department data for TUJ
        $tujDepartments = [
            ['name' => 'Asian Studies', 'code' => 'ASST', 'contact' => ['email' => 'asianstudies@tuj.ac.jp', 'phone' => '+81-3-5441-9801', 'office' => 'Main Building, Room 201']],
            ['name' => 'International Business', 'code' => 'IB', 'contact' => ['email' => 'business@tuj.ac.jp', 'phone' => '+81-3-5441-9802', 'office' => 'Main Building, Room 302']],
        ];

        foreach ($tujDepartments as $dept) {
            $department = Department::updateOrCreate(
                ['name' => $dept['name'], 'school_id' => $templeJapan->id],
                ['code' => $dept['code'], 'contact' => $dept['contact']]
            );
        }

        // Create Majors for TUJ
        $tujMajors = [
            ['department' => 'Asian Studies', 'name' => 'Asian Studies', 'code' => 'ASST', 'description' => 'Bachelor of Arts in Asian Studies'],
            ['department' => 'Asian Studies', 'name' => 'Japanese Studies', 'code' => 'JST', 'description' => 'Bachelor of Arts in Japanese Studies'],
            ['department' => 'International Business', 'name' => 'International Business', 'code' => 'IB', 'description' => 'Bachelor of Business Administration in International Business'],
            ['department' => 'International Business', 'name' => 'Global Management', 'code' => 'GM', 'description' => 'Bachelor of Business Administration in Global Management'],
        ];

        foreach ($tujMajors as $majorData) {
            $dept = Department::where('name', $majorData['department'])
                            ->where('school_id', $templeJapan->id)
                            ->first();
            if ($dept) {
                Major::updateOrCreate(
                    ['department_id' => $dept->id, 'code' => $majorData['code']],
                    ['name' => $majorData['name'], 'description' => $majorData['description']]
                );
            }
        }

        // Create Terms for TUJ
        $tujTerms = [
            ['name' => 'Fall 2025', 'start_date' => '2025-09-03', 'end_date' => '2025-12-21', 'is_active' => false],
            ['name' => 'Spring 2025', 'start_date' => '2025-01-07', 'end_date' => '2025-04-25', 'is_active' => true],
            ['name' => 'Summer 2025', 'start_date' => '2025-05-12', 'end_date' => '2025-07-25', 'is_active' => false],
        ];

        foreach ($tujTerms as $termData) {
            $term = Term::updateOrCreate(
                ['name' => $termData['name'], 'school_id' => $templeJapan->id],
                [
                    'start_date' => $termData['start_date'],
                    'end_date' => $termData['end_date'],
                    'is_active' => $termData['is_active']
                ]
            );
        }

        // Create professors for TUJ
        $tujProfessors = [
            ['name' => 'Yuki Tanaka', 'email' => 'y.tanaka@tuj.ac.jp', 'department' => 'Asian Studies', 'title' => 'Professor'],
            ['name' => 'Hiroshi Sato', 'email' => 'h.sato@tuj.ac.jp', 'department' => 'Asian Studies', 'title' => 'Associate Professor'],
            ['name' => 'Kenji Yamamoto', 'email' => 'k.yamamoto@tuj.ac.jp', 'department' => 'International Business', 'title' => 'Professor'],
            ['name' => 'Aiko Suzuki', 'email' => 'a.suzuki@tuj.ac.jp', 'department' => 'International Business', 'title' => 'Associate Professor'],
        ];

        foreach ($tujProfessors as $profData) {
            $dept = Department::where('name', $profData['department'])
                            ->where('school_id', $templeJapan->id)
                            ->first();

            if ($dept) {
                $professor = User::updateOrCreate(
                    ['email' => $profData['email']],
                    [
                        'name' => $profData['name'],
                        'password' => Hash::make('password'),
                        'role_id' => $roles['professor']->id,
                        'school_id' => $templeJapan->id,
                        'email_verified_at' => now(),
                        'remember_token' => Str::random(10),
                    ]
                );

                $profile = \App\Models\ProfessorProfile::updateOrCreate(
                    ['user_id' => $professor->id],
                    [
                        'department_id' => $dept->id,
                        'title' => $profData['title'],
                        'office' => 'Main Building, Room ' . rand(100, 500),
                        'phone' => '+81-3-5441-' . rand(1000, 9999),
                        'website' => 'https://tuj.ac.jp/faculty/' . strtolower(str_replace(' ', '-', $profData['name'])),
                    ]
                );
            }
        }

        return $templeJapan;
    }

    /**
     * Seed students for each school
     */
    private function seedStudents($roles)
    {
        // Temple Main Campus Students
        $templeSchool = School::where('name', 'Temple University')->first();
        $csDepartment = Department::where('name', 'Computer Science')
            ->where('school_id', $templeSchool->id)
            ->first();

        $csMajor = Major::where('department_id', $csDepartment->id)
            ->where('code', 'CS')
            ->first();

        $studentRole = $roles['student'];

        // Create 20 students for Temple Main Campus
        $templeStudents = [
            ['name' => 'John Smith', 'email' => 'john.smith@temple.edu'],
            ['name' => 'Emma Johnson', 'email' => 'emma.johnson@temple.edu'],
            ['name' => 'Michael Brown', 'email' => 'michael.brown@temple.edu'],
            ['name' => 'Sarah Davis', 'email' => 'sarah.davis@temple.edu'],
            ['name' => 'James Wilson', 'email' => 'james.wilson@temple.edu'],
            // Add more students as needed
        ];

        foreach ($templeStudents as $studentData) {
            User::updateOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'role_id' => $studentRole->id,
                    'school_id' => $templeSchool->id,
                    'email_verified_at' => now(),
                    'remember_token' => Str::random(10),
                ]
            );
        }

        // Temple Japan Students
        $tujSchool = School::where('name', 'Temple University Japan')->first();
        $asianStudiesDept = Department::where('name', 'Asian Studies')
            ->where('school_id', $tujSchool->id)
            ->first();

        $japaneseStudiesMajor = Major::where('department_id', $asianStudiesDept->id)
            ->where('code', 'JST')
            ->first();

        // Create students for Temple Japan
        $tujStudents = [
            ['name' => 'Yuki Tanaka', 'email' => 'yuki.tanaka@tuj.temple.edu'],
            ['name' => 'Sakura Yamamoto', 'email' => 'sakura.yamamoto@tuj.temple.edu'],
            ['name' => 'Hiroshi Sato', 'email' => 'hiroshi.sato@tuj.temple.edu'],
            ['name' => 'Akiko Suzuki', 'email' => 'akiko.suzuki@tuj.temple.edu'],
            ['name' => 'Kenji Nakamura', 'email' => 'kenji.nakamura@tuj.temple.edu'],
            // Add more students as needed
        ];

        foreach ($tujStudents as $studentData) {
            User::updateOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'role_id' => $studentRole->id,
                    'school_id' => $tujSchool->id,
                    'email_verified_at' => now(),
                    'remember_token' => Str::random(10),
                ]
            );
        }
    }
}
