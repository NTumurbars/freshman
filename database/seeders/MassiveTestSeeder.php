<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MassiveTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\School::factory()->count(5)->create();
        \App\Models\User::factory()->count(1000)->student()->create();
        \App\Models\User::factory()->count(100)->professor()->create();
        \App\Models\Building::factory()->count(20)->create();
        \App\Models\Floor::factory()->count(60)->create();
        \App\Models\Room::factory()->count(400)->create();
        \App\Models\Department::factory()->count(25)->create();
        \App\Models\Major::factory()->count(75)->create();
        \App\Models\Course::factory()->count(300)->create();
        \App\Models\Term::factory()->count(20)->create();
        \App\Models\Section::factory()->count(200)->create();
        \App\Models\CourseRegistration::factory()->count(1000)->create();
    }

}
