<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\School;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    $departments = [
        'Biology',
        'Chemistry',
        'Physics',
        'Environmental Science',
        'Mathematics',
        'Computer Science',
        'Data Science',
        'Statistics',
        'Mechanical Engineering',
        'Electrical Engineering',
        'Civil Engineering',
        'Chemical Engineering',
        'History',
        'Philosophy',
        'English',
        'Art History',
        'Religious Studies',
        'Psychology',
        'Sociology',
        'Anthropology',
        'Political Science',
        'Economics',
        'Business Administration',
        'Accounting',
        'Finance',
        'Marketing',
        'Management',
        'Visual Arts',
        'Music',
        'Theater',
        'Dance',
        'Creative Writing',
        'Education',
        'Special Education',
        'Educational Leadership',
        'Nursing',
        'Public Health',
        'Health Administration',
        'Kinesiology',
        'Journalism',
        'Communication Studies',
        'Media Studies',
        'Public Relations',
        'Law',
        'Public Policy',
        'Criminology',
        'International Relations'
    ];
    
    public function definition(): array
    {
        return [
            'school_id'=>School::factory(),
            'name'=>fake()->randomElement($departments),
        ];
    }
}
