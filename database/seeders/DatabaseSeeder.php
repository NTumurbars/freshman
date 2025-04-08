<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\School;
use App\Models\Department;
use App\Models\Major;
use App\Models\User;
use App\Models\Term;
use App\Models\Course;
use App\Models\ProfessorProfile;
use App\Models\Section;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Room;
use App\Models\RoomFeature;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // ======================== ROLES ========================
        $this->command->info('Seeding roles...');
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

        // ======================== TEMPLE UNIVERSITY (MAIN CAMPUS) ========================
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
                'role_id' => $schoolAdminRole->id,
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

        $templeDepartmentObjects = [];
        foreach ($templeDepartments as $dept) {
            $department = Department::updateOrCreate(
                ['name' => $dept['name'], 'school_id' => $temple->id],
                ['code' => $dept['code'], 'contact' => $dept['contact']]
            );
            $templeDepartmentObjects[] = $department;
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
            ['name' => 'Fall 2024', 'start_date' => '2024-08-28', 'end_date' => '2024-12-15', 'is_active' => false],
            ['name' => 'Spring 2025', 'start_date' => '2025-01-16', 'end_date' => '2025-05-03', 'is_active' => true],
            ['name' => 'Summer 2024', 'start_date' => '2024-05-20', 'end_date' => '2025-08-02', 'is_active' => false],
        ];

        $templeTermObjects = [];
        foreach ($templeTerms as $termData) {
            $term = Term::updateOrCreate(
                ['name' => $termData['name'], 'school_id' => $temple->id],
                [
                    'start_date' => $termData['start_date'],
                    'end_date' => $termData['end_date'],
                    'is_active' => $termData['is_active']
                ]
            );
            $templeTermObjects[] = $term;
        }

        // Create professors for Temple
        $templeProfessors = [
            ['name' => 'John Smith', 'email' => 'jsmith@temple.edu', 'department' => 'Computer Science', 'title' => 'Professor'],
            ['name' => 'Jane Doe', 'email' => 'jdoe@temple.edu', 'department' => 'Electrical Engineering', 'title' => 'Associate Professor'],
            ['name' => 'Robert Johnson', 'email' => 'rjohnson@temple.edu', 'department' => 'Business', 'title' => 'Professor'],
        ];

        $templeProfessorProfiles = [];
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
                        'role_id' => $professorRole->id,
                        'school_id' => $temple->id,
                        'email_verified_at' => now(),
                        'remember_token' => Str::random(10),
                    ]
                );

                $profile = ProfessorProfile::updateOrCreate(
                    ['user_id' => $professor->id],
                    [
                        'department_id' => $dept->id,
                        'title' => $profData['title'],
                        'office' => 'Office ' . rand(100, 500),
                        'phone' => '215-204-' . rand(1000, 9999),
                        'website' => 'https://temple.edu/faculty/' . strtolower(str_replace(' ', '-', $profData['name'])),
                    ]
                );
                
                $templeProfessorProfiles[] = $profile;
            }
        }

        // Create sample courses and sections for Temple
        $templeCourses = [
            ['code' => 'CS101', 'title' => 'Introduction to Computer Science', 'department' => 'Computer Science', 'credits' => 3],
            ['code' => 'CS201', 'title' => 'Data Structures and Algorithms', 'department' => 'Computer Science', 'credits' => 4],
            ['code' => 'EE101', 'title' => 'Circuit Analysis', 'department' => 'Electrical Engineering', 'credits' => 3],
            ['code' => 'BUS101', 'title' => 'Introduction to Business', 'department' => 'Business', 'credits' => 3],
            ['code' => 'BUS201', 'title' => 'Financial Accounting', 'department' => 'Business', 'credits' => 3],
        ];

        foreach ($templeCourses as $courseData) {
            $dept = Department::where('name', $courseData['department'])
                            ->where('school_id', $temple->id)
                            ->first();
            
            if ($dept) {
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
                
                // Create sections for each course
                foreach ($templeTermObjects as $term) {
                    if ($term->is_active) {
                        $profProfile = $templeProfessorProfiles[array_rand($templeProfessorProfiles)];
                        
                        $section = Section::updateOrCreate(
                            [
                                'course_id' => $course->id,
                                'term_id' => $term->id,
                                'section_code' => '001'
                            ],
                            [
                                'professor_id' => $profProfile->user_id,
                                'number_of_students' => rand(20, 50),
                                'status' => 'active',
                                'delivery_method' => 'in-person',
                            ]
                        );
                        
                        // Create schedules for each section
                        $this->createSchedulesForSection($section, $temple->id);
                    }
                }
            }
        }

        // ======================== TEMPLE JAPAN ========================
        $this->command->info('Seeding Temple University Japan campus...');
        
        // Create Temple University Japan Campus
        $templeJapan = School::updateOrCreate(
            ['name' => 'Temple University Japan'],
            [
                'email' => 'tuj@admin.com',
                'website_url' => 'https://www.tuj.ac.jp',
                'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Temple_T_logo.svg/330px-Temple_T_logo.svg.png',
                'description' => 'Temple University Japan (TUJ) is the oldest and largest foreign university in Japan - located in Tokyo.',
                'address' => '1-14-29 Taishido',
                'city' => 'Setagaya-ku',
                'state' => 'Tokyo',
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
                'name' => 'TUJ Admin',
                'password' => Hash::make('password'),
                'role_id' => $schoolAdminRole->id,
                'school_id' => $templeJapan->id,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Create Departments for TUJ
        $tujDepartments = [
            ['name' => 'Asian Studies', 'code' => 'ASST', 'contact' => ['email' => 'asianstudies@tuj.ac.jp', 'phone' => '+81-3-5441-9801', 'office' => 'Main Building, Room 201']],
            ['name' => 'International Business', 'code' => 'IB', 'contact' => ['email' => 'business@tuj.ac.jp', 'phone' => '+81-3-5441-9802', 'office' => 'Main Building, Room 302']],
            ['name' => 'Communication Studies', 'code' => 'COMM', 'contact' => ['email' => 'comm@tuj.ac.jp', 'phone' => '+81-3-5441-9803', 'office' => 'Science Building, Room S101']],
        ];

        $tujDepartmentObjects = [];
        foreach ($tujDepartments as $dept) {
            $department = Department::updateOrCreate(
                ['name' => $dept['name'], 'school_id' => $templeJapan->id],
                ['code' => $dept['code'], 'contact' => $dept['contact']]
            );
            $tujDepartmentObjects[] = $department;
        }

        // Create Majors for TUJ
        $tujMajors = [
            ['department' => 'Asian Studies', 'name' => 'Japanese Studies', 'code' => 'JPST', 'description' => 'Bachelor of Arts in Japanese Studies'],
            ['department' => 'Asian Studies', 'name' => 'Asian Studies', 'code' => 'ASST', 'description' => 'Bachelor of Arts in Asian Studies'],
            ['department' => 'International Business', 'name' => 'International Business', 'code' => 'IB', 'description' => 'Bachelor of Business Administration in International Business'],
            ['department' => 'Communication Studies', 'name' => 'Communication Studies', 'code' => 'COMM', 'description' => 'Bachelor of Arts in Communication Studies'],
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
            ['name' => 'Fall 2023', 'start_date' => '2023-09-04', 'end_date' => '2023-12-22', 'is_active' => false],
            ['name' => 'Spring 2024', 'start_date' => '2024-01-08', 'end_date' => '2024-04-26', 'is_active' => true],
            ['name' => 'Summer 2024', 'start_date' => '2024-05-13', 'end_date' => '2024-07-26', 'is_active' => false],
        ];

        $tujTermObjects = [];
        foreach ($tujTerms as $termData) {
            $term = Term::updateOrCreate(
                ['name' => $termData['name'], 'school_id' => $templeJapan->id],
                [
                    'start_date' => $termData['start_date'],
                    'end_date' => $termData['end_date'],
                    'is_active' => $termData['is_active']
                ]
            );
            $tujTermObjects[] = $term;
        }

        // Create professors for TUJ
        $tujProfessors = [
            ['name' => 'Akira Tanaka', 'email' => 'atanaka@tuj.ac.jp', 'department' => 'Asian Studies', 'title' => 'Professor'],
            ['name' => 'Sarah Miller', 'email' => 'smiller@tuj.ac.jp', 'department' => 'International Business', 'title' => 'Associate Professor'],
            ['name' => 'Ken Watanabe', 'email' => 'kwatanabe@tuj.ac.jp', 'department' => 'Communication Studies', 'title' => 'Assistant Professor'],
        ];

        $tujProfessorProfiles = [];
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
                        'role_id' => $professorRole->id,
                        'school_id' => $templeJapan->id,
                        'email_verified_at' => now(),
                        'remember_token' => Str::random(10),
                    ]
                );

                $profile = ProfessorProfile::updateOrCreate(
                    ['user_id' => $professor->id],
                    [
                        'department_id' => $dept->id,
                        'title' => $profData['title'],
                        'office' => 'Office ' . rand(100, 500),
                        'phone' => '+81-3-5441-' . rand(1000, 9999),
                        'website' => 'https://tuj.ac.jp/faculty/' . strtolower(str_replace(' ', '-', $profData['name'])),
                    ]
                );
                
                $tujProfessorProfiles[] = $profile;
            }
        }

        // Create sample courses and sections for TUJ
        $tujCourses = [
            ['code' => 'JPST101', 'title' => 'Introduction to Japanese Language', 'department' => 'Asian Studies', 'credits' => 3],
            ['code' => 'JPST201', 'title' => 'Japanese Culture and Society', 'department' => 'Asian Studies', 'credits' => 3],
            ['code' => 'IB101', 'title' => 'Global Business Environment', 'department' => 'International Business', 'credits' => 3],
            ['code' => 'IB201', 'title' => 'International Marketing', 'department' => 'International Business', 'credits' => 3],
            ['code' => 'COMM101', 'title' => 'Public Speaking', 'department' => 'Communication Studies', 'credits' => 3],
        ];

        foreach ($tujCourses as $courseData) {
            $dept = Department::where('name', $courseData['department'])
                            ->where('school_id', $templeJapan->id)
                            ->first();
            
            if ($dept) {
                $major = Major::where('department_id', $dept->id)->first();
                
                $course = Course::updateOrCreate(
                    ['code' => $courseData['code']],
                    [
                        'department_id' => $dept->id,
                        'major_id' => $major ? $major->id : null,
                        'title' => $courseData['title'],
                        'description' => 'This is a course description for ' . $courseData['title'],
                        'credits' => $courseData['credits'],
                        'level' => substr($courseData['code'], -3, 1) . '00',
                        'is_active' => true,
                    ]
                );
                
                // Create sections for each course
                foreach ($tujTermObjects as $term) {
                    if ($term->is_active) {
                        $profProfile = $tujProfessorProfiles[array_rand($tujProfessorProfiles)];
                        
                        $section = Section::updateOrCreate(
                            [
                                'course_id' => $course->id,
                                'term_id' => $term->id,
                                'section_code' => '001'
                            ],
                            [
                                'professor_id' => $profProfile->user_id,
                                'number_of_students' => rand(15, 40),
                                'status' => 'active',
                                'delivery_method' => 'in-person',
                            ]
                        );
                        
                        // Create schedules for each section
                        $this->createSchedulesForSection($section, $templeJapan->id);
                    }
                }
            }
        }

        // ======================== BUILDINGS, FLOORS, ROOMS ========================
        $this->command->info('Seeding buildings, floors, and rooms...');
        
        // Get all schools
        $schools = School::all();

        foreach ($schools as $school) {
            // Create buildings for each school
            $building1 = Building::updateOrCreate(
                ['name' => 'Main Building', 'school_id' => $school->id],
            );

            $building2 = Building::updateOrCreate(
                ['name' => 'Science Building', 'school_id' => $school->id],
            );

            // Create floors for Main Building (from 1 to 5)
            for ($i = 1; $i <= 5; $i++) {
                $floor = Floor::updateOrCreate(
                    ['building_id' => $building1->id, 'number' => $i],
                );

                // Create rooms for each floor
                $roomsPerFloor = rand(3, 6);
                for ($j = 1; $j <= $roomsPerFloor; $j++) {
                    $roomNumber = $i * 100 + $j; // Room number format: floor_number + room_number (e.g. 101, 102, 201, 202)
                    Room::updateOrCreate(
                        ['floor_id' => $floor->id, 'room_number' => $roomNumber],
                        ['capacity' => rand(20, 50)]
                    );
                }
            }

            // Create floors for Science Building (from 1 to 3)
            for ($i = 1; $i <= 3; $i++) {
                $floor = Floor::updateOrCreate(
                    ['building_id' => $building2->id, 'number' => $i],
                );

                // Create rooms for each floor
                $roomsPerFloor = rand(2, 4);
                for ($j = 1; $j <= $roomsPerFloor; $j++) {
                    $roomNumber = "S" . $i . "0" . $j; // Room number format: S + floor_number + room_number (e.g. S101, S102)
                    Room::updateOrCreate(
                        ['floor_id' => $floor->id, 'room_number' => $roomNumber],
                        ['capacity' => rand(15, 40)]
                    );
                }
            }
        }

        // ======================== COMMON ROOM FEATURES ========================
        $this->command->info('Seeding room features...');
        
        // Create common room features with categories and descriptions
        $roomFeatures = [
            [
                'name' => 'Projector',
                'category' => 'Technology',
                'description' => 'High-definition projector for presentations and video content'
            ],
            [
                'name' => 'Smart Board',
                'category' => 'Technology',
                'description' => 'Interactive whiteboard with touch capabilities and digital content sharing'
            ],
            [
                'name' => 'Computer Lab',
                'category' => 'Technology',
                'description' => 'Room equipped with multiple workstations for student use'
            ],
            [
                'name' => 'Video Conferencing',
                'category' => 'Technology',
                'description' => 'Advanced audio/video equipment for remote meetings and lectures'
            ],
            [
                'name' => 'Accessible Entrance',
                'category' => 'Accessibility',
                'description' => 'Wheelchair accessible entrance and pathways'
            ],
            [
                'name' => 'Adjustable Desks',
                'category' => 'Furniture',
                'description' => 'Height-adjustable desks to accommodate various needs'
            ],
            [
                'name' => 'Movable Seating',
                'category' => 'Furniture',
                'description' => 'Flexible seating arrangements that can be reconfigured for different activities'
            ],
            [
                'name' => 'Lab Equipment',
                'category' => 'Technology',
                'description' => 'Specialized scientific or engineering equipment for hands-on learning'
            ],
            [
                'name' => 'Recording Equipment',
                'category' => 'Audio/Visual',
                'description' => 'Audio and video recording capabilities for lecture capture'
            ],
            [
                'name' => 'Emergency Exits',
                'category' => 'Safety',
                'description' => 'Multiple emergency exits with proper signage and lighting'
            ],
            [
                'name' => 'First Aid Kit',
                'category' => 'Safety',
                'description' => 'Fully stocked first aid kit for emergencies'
            ]
        ];

        foreach ($roomFeatures as $feature) {
            RoomFeature::updateOrCreate(
                ['name' => $feature['name']],
                [
                    'category' => $feature['category'],
                    'description' => $feature['description']
                ]
            );
        }

        // Assign features to random rooms
        $rooms = Room::all();
        $allFeatures = RoomFeature::all();
        
        foreach ($rooms as $room) {
            // Assign 2-5 random features to each room
            $featureCount = rand(2, 5);
            $featureIds = $allFeatures->random($featureCount)->pluck('id')->toArray();
            $room->features()->sync($featureIds);
        }

        // ======================== UPDATE COURSES ========================
        $this->command->info('Ensuring all courses have is_active flag set...');
        
        // Ensure all courses have is_active set to true
        Course::where('is_active', NULL)
            ->update(['is_active' => true]);

        // ======================== ADDITIONAL SCHEDULES ========================
        $this->command->info('Seeding additional schedules...');
        $this->call(ScheduleSeeder::class);
        
        // ======================== WEEKLY SCHEDULES ========================
        $this->command->info('Adding weekly schedules to sections...');
        $this->call(WeeklyScheduleSeeder::class);

        // ======================== SUMMARY ========================
        $this->command->info('Database seeded successfully!');
        $this->command->info('Super Admin Login: super@admin.com / password');
        $this->command->info('Temple Admin Login: temple@admin.com / password');
        $this->command->info('TUJ Admin Login: tuj@admin.com / password');
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
                $daysOfWeek = [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][array_rand(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])]];
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
            
            \App\Models\Schedule::updateOrCreate(
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
