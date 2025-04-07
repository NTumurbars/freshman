<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;

class UpdateCoursesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Set all existing courses to active
        Course::where('is_active', NULL)
            ->update(['is_active' => true]);

        $this->command->info('All existing courses updated to have is_active = true');
    }
} 