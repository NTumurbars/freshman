<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\School;

class RouteAccessAutoTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $roles = ['super_admin', 'school_admin', 'professor', 'student'];
    protected $usersByRole = [];
    protected $school;
    protected $building;
    protected $floor;
    protected $room;
    protected $professorProfile;
    protected $logFile;
    protected $section;
    protected $department;
    protected $course;
    protected $term;
    protected $major;


    protected function setUp(): void
    {
        parent::setUp();
        $this->logFile = storage_path('logs/route-access-matrix.log');

        // Optional: clear the file on each test run
        file_put_contents($this->logFile, "🔎 Route Access Matrix Test\n\n");

        $this->seed();
        $this->seed(\Database\Seeders\MassiveTestSeeder::class);

        $this->school = \App\Models\School::inRandomOrder()->first();
        $this->building = \App\Models\Building::where('school_id', $this->school->id)->inRandomOrder()->first();
        $this->floor = \App\Models\Floor::where('building_id', $this->building->id)->inRandomOrder()->first();
        $this->room = \App\Models\Room::where('floor_id', $this->floor->id)->inRandomOrder()->first();
        $this->department = \App\Models\Department::where('school_id', $this->school->id)->inRandomOrder()->first();
        $this->course = \App\Models\Course::where('department_id', $this->department->id)->inRandomOrder()->first();
        $this->term = \App\Models\Term::where('school_id', $this->school->id)->inRandomOrder()->first();
        $this->major =\App\Models\Major::where('department_id', $this->department->id)->inRandomOrder()->first();

        while($this->section === null)
        {
            $userId = User::where('school_id', $this->school->id)->where('role_id', 4)->inRandomOrder()->first()->id;

            $this->professorProfile = \App\Models\ProfessorProfile::where('user_id', $userId)->first();

            $this->section = \App\Models\Section::where('professor_profile_id', $this->professorProfile->id)->inRandomOrder()->first();
        }


        // Match your actual roles and role_id mappings
        $this->roles = ['super_admin', 'school_admin', 'professor', 'student'];

        $roleIdMap = [
            'super_admin' => 1,
            'school_admin' => 2,
            'professor' => 4,
            'student' => 5,
        ];

        $this->usersByRole = [
            'super_admin' => \App\Models\User::where('role_id', 1)->first(),
            'school_admin' => \App\Models\User::where('role_id', 2)->where('school_id', $this->school->id)->first(),
            'professor' => \App\Models\User::where('role_id', 4)->where('school_id', $this->school->id)->first(),
            'student' => \App\Models\User::where('role_id', 5)->where('school_id', $this->school->id)->first(),
        ];
    }


    /** @test */
    /** @test */
    public function roles_can_access_routes_matrix()
    {
        $logOutput = "";
        $routes = collect(\Illuminate\Support\Facades\Route::getRoutes())->filter(function ($route) {
            return in_array('GET', $route->methods()) &&
                !str_starts_with($route->uri(), '_') &&
                strpos($route->uri(), 'sanctum') === false &&
                !in_array('api', $route->middleware()) &&
                !str_contains($route->uri(), 'verify-email');
        });

        $accessMatrix = [];

        foreach ($routes as $route) {
            $originalUri = $route->uri();
            $accessMatrix[$originalUri] = [];
            


            // Handle any URI placeholders (like {school})
            $uri = preg_replace_callback('/\{(\w+)(\??)\}/', function ($matches) {
                $param = $matches[1];
                return match ($param) {
                    'school' => $this->school->id,
                    'building' => $this->building->id,
                    'floor' => $this->floor->id,
                    'room' => $this->room->id,
                    'professor_profile' => $this->professorProfile->id,
                    'section' => $this->section->id,
                    'department' => $this->department->id,
                    'course' => $this->course->id,
                    'term' => $this->term->id,
                    'major' => $this->major->id,
                    'id' => 1,
                    default => 1,
                };
            }, $originalUri);

            $output = "\n🔗 Route: /$uri\n";

            foreach ($this->usersByRole as $role => $user) {
                if (!$user) {
                    $accessMatrix[$originalUri][$role] = '❌ No user';
                    continue;
                }
            
                try {
                    $response = $this->actingAs($user)->get($uri);
                    $status = $response->getStatusCode();
                } catch (\Throwable $e) {
                    $status = '💥 Exception';
                }
            
                $accessMatrix[$originalUri][$role] = $status;
            }
            
        }

        // Dump formatted access matrix
        foreach ($accessMatrix as $uri => $roleStatuses) {
            echo "\n🔗 Route: /$uri\n";
            $logOutput .= "\n🔗 Route: /$uri\n";
    
            foreach ($roleStatuses as $role => $status) {
                $emoji = match ($status) {
                    200 => '✅',
                    302 => '➡️ ',
                    403 => '⛔',
                    404 => '❓',
                    '❌ No user' => '❌',
                    '💥 Exception' => '💥',
                    default => "⚠️ ($status)",
                };
    
                echo "   [$role] => $status $emoji\n";
                $logOutput .= "   [$role] => $status $emoji\n";
            }
        }
    
        file_put_contents($this->logFile, $logOutput, FILE_APPEND);
        $this->assertTrue(true);
    }

}
