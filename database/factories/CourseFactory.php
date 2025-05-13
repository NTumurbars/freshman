<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Department;
use App\Models\Major;
use App\Models\Course;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $descriptors = [
            'Introduction to', 'Advanced', 'Fundamentals of', 'Principles of', 
            'Applied', 'Foundations of', 'Essentials of', 'Basics of', 'Intermediate', 'Seminar in'
        ];
    
        $subjects = [
            'Biology', 'Mathematics', 'Physics', 'Computer Science', 'Psychology', 
            'History', 'Economics', 'Chemistry', 'Sociology', 'Political Science', 
            'Business Administration', 'Art History', 'Creative Writing', 'Philosophy', 'Environmental Studies'
        ];
    
        $levels = ['', 'I', 'II', 'III']; // optional course level suffix

        $currentMajor = Major::inRandomOrder()->first();
        return [
            'major_id' => $currentMajor->id,
            'department_id' => $currentMajor->department_id,
            
            'code' => strtoupper($this->faker->unique()->bothify('???###')),
            'title' => fake()->randomElement($descriptors) . ' ' 
                    . fake()->randomElement($subjects) 
                    . ' ' 
                    . fake()->randomElement($levels),
            'description' => fake()->paragraph(),
            'credits' => fake()->numberBetween(1, 5),
            'level'=> fake()->numberBetween(1, 3),
            'is_active'=>fake()->boolean(),
        ];
    }

    public function newCourse()
    {
        return $this->state(function (array $attributes) use ($currentMajor) {
            return [
                'department_id' => Department::factory(),
                'major_id' => Major::factory(),
                
            ];
        });
    }

}
