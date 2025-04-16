<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Models\User;
use App\Models\School;
use App\Models\Course;
use App\Models\Major;
use App\Models\Term;
use App\Models\Section;
use App\Models\Schedule;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Department;
use App\Models\Room;
use App\Models\RoomFeature;
use App\Models\CourseRegistration;

class FactoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Manually fresh migrate at the start of test
        $this->artisan('migrate:fresh');
        $this->seed(); // If you need default roles or data
    }

    /** @test */
    public function it_can_create_all_factories()
    {
        $this->seed(); // Make sure roles exist if needed
        
        // Try making one of each model
    
        
        School::factory()->count(5)->create();
        User::factory()->count(1000)->student()->create();
        User::factory()->count(100)->professor()->create();
        Building::factory()->count(20)->create();
        Floor::factory()->count(60)->create();
        Room::factory()->count(400)->create();
        Department::factory()->count(25)->create();
        Major::factory()->count(75)->create();
        Course::factory()->count(300)->create();
        Term::factory()->count(20)->create();
        Section::factory()->count(200)->create();
        CourseRegistration::factory()->count(1000)->create();
        

        
        

       
        


        

        $this->assertDatabaseCount('schools', 7);
        
    }
}
