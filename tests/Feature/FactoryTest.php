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
use App\Models\Room;
use App\Models\RoomFeature;

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
        User::factory()->count(10)->student()->create();
        User::factory()->count(5)->professor()->create();

        $this->assertDatabaseCount('users', 21);
    }
}
